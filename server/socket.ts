import type { Server as HTTPServer } from "http";
import { Server } from "socket.io";

// We can import our existing services right here!
import { setPlayerReady, addScore } from "../services/player.service";
import { startGame, handlePlayerLeave } from "../services/room.service";
import { getRoomByCode, updateRoom } from "../repositories/room.repository";
import {
  getPlayerById,
  updatePlayer,
  setAllPlayersDisconnected,
} from "../repositories/player.repository";
import { startNextRound } from "../services/round.service";

const WORD_SELECTION_SECONDS = 15;
const ROUND_SECONDS = 80;
// Guessers get a couple of letters of the word revealed after time passes
// (see startRoundTimer). The drawer never sees hints — they already know it.
const HINT_AFTER_SECONDS = 30; // reveal the 1st letter 30s into the round
const MAX_HINTS = 2;
// How long the round-results screen stays up (the revealed word + scoreboard)
// before auto-advancing to the next round. This is a fixed pause for everyone —
// no player can skip it, so nobody gets ahead of the rest of the room.
const RESULTS_SECONDS = 6;
// How long to wait for a player to reconnect (e.g. an F5 refresh) before
// treating their disconnection as a real leave and removing them from the room.
const DISCONNECT_GRACE_MS = 30_000;

// The Socket.IO instance. Assigned by attachSocketServer() below, which wires
// it onto whatever HTTP server hosts the Next.js app, so the whole game runs
// as a single deployable process.
let io: Server;

export function attachSocketServer(httpServer: HTTPServer) {
  // Fresh boot: every player from a previous process is treated as offline
  // until their browser actually reconnects (join-room sets connected:true).
  setAllPlayersDisconnected().catch((err) => {
    console.error("Failed to reset player connections at boot:", err);
  });

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*", // In production, set CORS_ORIGIN to your app's domain
      methods: ["GET", "POST"],
    },
  });

  registerConnectionHandlers();
  return io;
}

// --- TIMER STATE ---
// IMPORTANT: these maps live at module scope, NOT inside the "connection" handler.
// They are keyed by room code and must be shared by every socket in the same room,
// otherwise each player would have their own private timer/guesser state.
const activeTimers = new Map<string, NodeJS.Timeout>();
const roomTimeLeft = new Map<string, number>();
const roomCorrectGuessers = new Map<string, Set<string>>();

// --- HINT STATE ---
// Letter indices revealed so far this round, per room. Once the round timer
// crosses HINT_AFTER_SECONDS (and every HINT_AFTER_SECONDS after that), we
// reveal one more letter — up to MAX_HINTS total — so guessers get a nudge
// without the word being handed to them.
const roomRevealedIndices = new Map<string, number[]>();
const roomHintStep = new Map<string, number>();

// --- ROUND RESULTS STATE ---
// Base score per player captured the moment a word was chosen. We diff against
// this at round end to show each player's per-round "+points" on the results
// screen (like the design's "+500 pts" rows).
const roomBaseScores = new Map<string, Map<string, number>>();
// One-shot timeout holding the results screen open before auto-advance.
const resultsTimers = new Map<string, NodeJS.Timeout>();
// Guards against double-advance when several players click "next" at once.
const advancingRooms = new Set<string>();

function stopResultsTimer(roomCode: string) {
  const timer = resultsTimers.get(roomCode);
  if (timer) clearTimeout(timer);
  resultsTimers.delete(roomCode);
}

function stopTimer(roomCode: string) {
  const timer = activeTimers.get(roomCode);
  if (timer) clearInterval(timer);
  activeTimers.delete(roomCode);
  roomTimeLeft.delete(roomCode);
}

// Clean up every piece of server-side state tied to a room. Called when a room
// is deleted (becomes empty) so abandoned rooms don't leave timers and maps
// behind — a slow leak that would grow over many played matches.
function cleanupRoomState(roomCode: string) {
  stopTimer(roomCode);
  stopResultsTimer(roomCode);
  roomCorrectGuessers.delete(roomCode);
  roomBaseScores.delete(roomCode);
  roomRevealedIndices.delete(roomCode);
  roomHintStep.delete(roomCode);
  advancingRooms.delete(roomCode);
}

function startTimer(
  roomCode: string,
  duration: number,
  onComplete: () => void,
  onTick?: (timeLeft: number) => void
) {
  stopTimer(roomCode);
  roomTimeLeft.set(roomCode, duration);

  const interval = setInterval(async () => {
    const timeLeft = (roomTimeLeft.get(roomCode) ?? 0) - 1;
    roomTimeLeft.set(roomCode, timeLeft);

    io.to(roomCode).emit("timer-tick", timeLeft);

    if (onTick && timeLeft > 0) {
      await onTick(timeLeft);
    }

    if (timeLeft <= 0) {
      clearInterval(interval);
      activeTimers.delete(roomCode);
      roomTimeLeft.delete(roomCode);
      await onComplete();
    }
  }, 1000);

  activeTimers.set(roomCode, interval);
}

// Reveal one more letter of the current word for guessers, then broadcast the
// updated masked word as a "hint". The drawer is untouched — they draw the word.
async function maybeRevealHint(roomCode: string, timeLeft: number) {
  const step = roomHintStep.get(roomCode) ?? 0;
  if (step >= MAX_HINTS) return;

  // Reveal based on elapsed time: 1st hint at HINT_AFTER_SECONDS, 2nd at
  // 2 * HINT_AFTER_SECONDS. Guards the async gap so we only fire one step.
  const elapsed = ROUND_SECONDS - timeLeft;
  const readyStep = Math.floor(elapsed / HINT_AFTER_SECONDS);
  if (readyStep <= step) return;

  const room = await getRoomByCode(roomCode);
  if (!room?.currentWord) return;

  const word = room.currentWord;
  const revealed = roomRevealedIndices.get(roomCode) ?? [];

  // Find letter indices not yet revealed, then pick one.
  const candidates = word
    .split("")
    .map((char, i) => ({ char, i }))
    .filter(({ char, i }) => /[a-zA-Z]/.test(char) && !revealed.includes(i));
  if (candidates.length === 0) return;

  const pick = candidates[Math.floor(Math.random() * candidates.length)].i;
  const next = [...revealed, pick];
  roomRevealedIndices.set(roomCode, next);
  roomHintStep.set(roomCode, readyStep);

  const hintWord = word
    .split("")
    .map((char, i) =>
      /[a-zA-Z]/.test(char) && !next.includes(i) ? "_" : char
    )
    .join("");

  io.to(roomCode).emit("hint", { hintWord, revealedCount: next.length });
}

// Round timer with hint reveal on each tick. Used instead of a bare
// startTimer(ROUND_SECONDS) once the word is locked in.
function startRoundTimer(roomCode: string) {
  roomRevealedIndices.delete(roomCode);
  roomHintStep.delete(roomCode);
  startTimer(
    roomCode,
    ROUND_SECONDS,
    () => handleRoundEnd(roomCode),
    (timeLeft) => maybeRevealHint(roomCode, timeLeft)
  );
}

// Word-choice phase: if the drawer doesn't pick in time, auto-pick the first word
// so the game never hangs waiting for a player.
async function startWordSelection(roomCode: string) {
  startTimer(roomCode, WORD_SELECTION_SECONDS, async () => {
    try {
      const room = await getRoomByCode(roomCode);
      if (!room || room.currentWord) return;

      const word = room.wordChoices[0];
      if (!word) return;

      await updateRoom(roomCode, {
        currentWord: word,
        wordChoices: [],
      });

      roomCorrectGuessers.set(roomCode, new Set());
      roomBaseScores.set(
        roomCode,
        new Map(room.players.map((p) => [p.id, p.score]))
      );
      io.to(roomCode).emit("room-updated");

      startRoundTimer(roomCode);
    } catch (err) {
      console.error("Auto word selection error:", err);
    }
  });
}

// Whether the just-finished round is the last of the match. Mirrors the
// round-advance logic in round.service so the results screen can say "Back to
// Lobby" instead of "Next Round" on the final round.
function isFinalRound(room: {
  currentDrawerId: string | null;
  currentRound: number;
  maxRounds: number;
  players: { id: string }[];
}): boolean {
  let nextRound = room.currentRound;
  if (room.currentDrawerId) {
    const currentIndex = room.players.findIndex(
      (p) => p.id === room.currentDrawerId
    );
    if (currentIndex + 1 >= room.players.length) {
      nextRound++;
    }
  }
  return nextRound > room.maxRounds;
}

// Finish the round-results pause and move to the next round (or the lobby when
// the match is over). Guarded so it only ever runs once per round.
async function advanceAfterResults(roomCode: string) {
  if (advancingRooms.has(roomCode)) return;
  advancingRooms.add(roomCode);
  try {
    roomCorrectGuessers.delete(roomCode);
    roomBaseScores.delete(roomCode);
    const room = await startNextRound(roomCode);
    io.to(roomCode).emit("room-updated");

    // started:false means we're back in the lobby — no word selection needed.
    if (room.started) {
      startWordSelection(roomCode);
    }
  } catch (err) {
    console.error("Failed to advance after results:", err);
  } finally {
    advancingRooms.delete(roomCode);
  }
}

// Drawing phase ended (time out or everyone guessed). Instead of instantly
// advancing, reveal the word and per-round scores for RESULTS_SECONDS, then
// auto-advance (or wait for a player to hit "Next").
async function handleRoundEnd(roomCode: string) {
  try {
    const room = await getRoomByCode(roomCode);
    stopTimer(roomCode);
    roomCorrectGuessers.delete(roomCode);

    if (!room) return;

    const base = roomBaseScores.get(roomCode) ?? new Map<string, number>();
    const players = room.players.map((p) => ({
      id: p.id,
      username: p.username,
      avatar: p.avatar,
      score: p.score,
      delta: p.score - (base.get(p.id) ?? p.score),
    }));

    io.to(roomCode).emit("round-results", {
      word: room.currentWord,
      gameOver: isFinalRound(room),
      players,
    });

    stopResultsTimer(roomCode);
    resultsTimers.set(
      roomCode,
      setTimeout(() => advanceAfterResults(roomCode), RESULTS_SECONDS * 1000)
    );
  } catch (err) {
    console.error("Failed to end round:", err);
  }
}

// --- DISCONNECT / RECONNECT (soft leave) ---
// A player can hold several live sockets at once (e.g. multiple tabs). We only
// treat a player as having left once their LAST socket disconnects, and even
// then we wait DISCONNECT_GRACE_MS so a page refresh doesn't delete them from
// the game. Rejoining (join-room) within the grace period cancels the deletion.
const playerSockets = new Map<string, Set<string>>();
const pendingLeaves = new Map<string, NodeJS.Timeout>();

function addPlayerSocket(playerId: string, socketId: string) {
  let sockets = playerSockets.get(playerId);
  if (!sockets) {
    sockets = new Set();
    playerSockets.set(playerId, sockets);
  }
  sockets.add(socketId);
  cancelSoftLeave(playerId);
}

function removePlayerSocket(playerId: string, socketId: string, roomCode: string) {
  const sockets = playerSockets.get(playerId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (sockets.size > 0) return;
  playerSockets.delete(playerId);
  scheduleSoftLeave(playerId, roomCode);
}

function cancelSoftLeave(playerId: string) {
  const timer = pendingLeaves.get(playerId);
  if (timer) {
    clearTimeout(timer);
    pendingLeaves.delete(playerId);
  }
}

function scheduleSoftLeave(playerId: string, roomCode: string) {
  cancelSoftLeave(playerId);
  const timer = setTimeout(async () => {
    pendingLeaves.delete(playerId);
    try {
      const room = await handlePlayerLeave(roomCode, playerId);
      // If the drawer left mid-round, a fresh word-choice phase was started.
      if (room?.started && !room.currentWord && room.wordChoices.length > 0) {
        startWordSelection(roomCode);
      }
      // Room was deleted (now empty) — drop all of its timer/state so nothing
      // keeps tick-tocking for a room that no longer exists.
      if (!room) {
        cleanupRoomState(roomCode);
      }
    } catch (err) {
      console.error("Failed to handle player leave after grace period:", err);
    }
    io.to(roomCode).emit("room-updated");
  }, DISCONNECT_GRACE_MS);
  pendingLeaves.set(playerId, timer);
}

function registerConnectionHandlers() {
  io.on("connection", (socket) => {
    console.log("Player connected to Socket:", socket.id);

  let connectedRoom: string | null = null;
  let connectedPlayer: string | null = null;

  // --- ROOM JOINING ---
  socket.on("join-room", async ({ roomCode, playerId }) => {
    socket.join(roomCode);

    if (playerId) {
      connectedRoom = roomCode;
      connectedPlayer = playerId;
      addPlayerSocket(playerId, socket.id);

      // Re-assert the player's presence so an F5 refresh doesn't lose them
      // while the disconnect grace-period timer is still running.
      try {
        const player = await getPlayerById(playerId);
        if (player) {
          await updatePlayer(playerId, { connected: true });
        }
      } catch (err) {
        console.error("Failed to re-assert player connection:", err);
      }
    }

    console.log(`Socket ${socket.id} (Player: ${playerId}) joined room ${roomCode}`);

    // Broadcast to the room that a player joined (they can refetch or we can send the updated room)
    io.to(roomCode).emit("room-updated");

    // Late joiners: if the round is already being drawn, ask the drawer to send
    // the current canvas so they don't stare at a blank board.
    try {
      const room = await getRoomByCode(roomCode);
      if (room?.started && room.currentWord) {
        io.to(roomCode).emit("request-canvas-state", { roomCode });
      }
    } catch (err) {
      console.error("Failed to request canvas state:", err);
    }
  });

  // --- LOBBY ACTIONS ---
  socket.on("toggle-ready", async ({ roomCode, playerId, isReady }) => {
    try {
      await setPlayerReady(playerId, isReady);
      io.to(roomCode).emit("room-updated"); // Tell everyone to refetch room state
    } catch (err) {
      console.error("Toggle ready error:", err);
    }
  });

  socket.on("start-game", async ({ roomCode }) => {
    try {
      await startGame(roomCode);
      io.to(roomCode).emit("room-updated");
      startWordSelection(roomCode);
    } catch (err) {
      console.error("Start game error:", err);
    }
  });

  // --- WORD SELECTION ---
  socket.on("select-word", async ({ roomCode, playerId, word }) => {
    try {
      const room = await getRoomByCode(roomCode);
      // Only the current drawer may pick, and only from the offered choices.
      if (!room || room.currentDrawerId !== playerId || !room.wordChoices.includes(word)) return;

      await updateRoom(roomCode, {
        currentWord: word,
        wordChoices: [],
      });

      roomCorrectGuessers.set(roomCode, new Set());
      roomBaseScores.set(
        roomCode,
        new Map(room.players.map((p) => [p.id, p.score]))
      );
      io.to(roomCode).emit("room-updated");

      startRoundTimer(roomCode);
    } catch (err) {
      console.error("Select word error:", err);
    }
  });

  // --- CANVAS SYNC (Sprint 5) ---
  socket.on("draw-stroke", ({ roomCode, strokeData }) => {
    socket.to(roomCode).emit("draw-stroke", strokeData);
  });

  socket.on("fill-canvas", ({ roomCode, fillData }) => {
    socket.to(roomCode).emit("fill-canvas", fillData);
  });

  socket.on("sync-canvas", ({ roomCode, dataURL }) => {
    io.to(roomCode).emit("sync-canvas", dataURL);
  });

  socket.on("clear-canvas", ({ roomCode }) => {
    io.to(roomCode).emit("clear-canvas");
  });

  socket.on("request-canvas-state", ({ roomCode }) => {
    // Forward the request to everyone else in the room; the drawer responds
    // with the current canvas via "sync-canvas".
    socket.to(roomCode).emit("request-canvas-state", { roomCode });
  });

  // --- CHAT & GUESSES (Sprint 5) ---
  socket.on("chat-message", async ({ roomCode, playerId, message }) => {
    try {
      const room = await getRoomByCode(roomCode);
      if (!room) return;

      const player = room.players.find(p => p.id === playerId);
      if (!player) return;

      const isDrawer = room.currentDrawerId === playerId;

      // The drawer knows the word, so their messages are never guesses.
      if (isDrawer) {
        io.to(roomCode).emit("chat-message", {
          sender: player.username,
          message,
          isSystem: false,
        });
        return;
      }

      const guessers = roomCorrectGuessers.get(roomCode) ?? new Set<string>();

      if (room.currentWord && message.trim().toLowerCase() === room.currentWord.toLowerCase()) {
        if (guessers.has(playerId)) return; // Already guessed this round

        guessers.add(playerId);
        roomCorrectGuessers.set(roomCode, guessers);

        io.to(roomCode).emit("chat-message", {
          sender: "System",
          message: `${player.username} guessed the word!`,
          isSystem: true,
          isCorrect: true,
        });

        // Guesser gets points based on time left; drawer gets a flat bonus per correct guess.
        const timeLeft = roomTimeLeft.get(roomCode) ?? 0;
        const guesserPoints = Math.floor((timeLeft / ROUND_SECONDS) * 500) + 100;

        await addScore(playerId, guesserPoints);

        if (room.currentDrawerId) {
          await addScore(room.currentDrawerId, 100);
        }

        io.to(roomCode).emit("room-updated"); // refresh scores in UI

        // End round early if everyone guessed (the drawer doesn't guess)
        if (guessers.size >= room.players.length - 1) {
          stopTimer(roomCode);
          await handleRoundEnd(roomCode);
        }
      } else {
        io.to(roomCode).emit("chat-message", {
          sender: player.username,
          message,
          isSystem: false,
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    if (connectedPlayer && connectedRoom) {
      // Don't delete the player immediately: an F5 refresh tears down the old
      // socket before the new page connects. Wait a grace period instead, and
      // only hard-remove the player if they never come back.
      removePlayerSocket(connectedPlayer, socket.id, connectedRoom);
    }
  });
  });
}
