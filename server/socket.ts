import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

// We can import our existing services right here!
import { setPlayerReady, addScore } from "../services/player.service";
import { startGame, handlePlayerLeave } from "../services/room.service";
import { getRoomByCode, updateRoom } from "../repositories/room.repository";
import { getPlayerById, updatePlayer } from "../repositories/player.repository";
import { startNextRound } from "../services/round.service";

const WORD_SELECTION_SECONDS = 15;
const ROUND_SECONDS = 80;
// How long to wait for a player to reconnect (e.g. an F5 refresh) before
// treating their disconnection as a real leave and removing them from the room.
const DISCONNECT_GRACE_MS = 30_000;

const app = express();
app.use(cors());
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, restrict this to your domain
    methods: ["GET", "POST"],
  },
});

// --- TIMER STATE ---
// IMPORTANT: these maps live at module scope, NOT inside the "connection" handler.
// They are keyed by room code and must be shared by every socket in the same room,
// otherwise each player would have their own private timer/guesser state.
const activeTimers = new Map<string, NodeJS.Timeout>();
const roomTimeLeft = new Map<string, number>();
const roomCorrectGuessers = new Map<string, Set<string>>();

function stopTimer(roomCode: string) {
  const timer = activeTimers.get(roomCode);
  if (timer) clearInterval(timer);
  activeTimers.delete(roomCode);
  roomTimeLeft.delete(roomCode);
}

function startTimer(roomCode: string, duration: number, onComplete: () => void) {
  stopTimer(roomCode);
  roomTimeLeft.set(roomCode, duration);

  const interval = setInterval(async () => {
    const timeLeft = (roomTimeLeft.get(roomCode) ?? 0) - 1;
    roomTimeLeft.set(roomCode, timeLeft);

    io.to(roomCode).emit("timer-tick", timeLeft);

    if (timeLeft <= 0) {
      clearInterval(interval);
      activeTimers.delete(roomCode);
      roomTimeLeft.delete(roomCode);
      await onComplete();
    }
  }, 1000);

  activeTimers.set(roomCode, interval);
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
      io.to(roomCode).emit("room-updated");

      startTimer(roomCode, ROUND_SECONDS, () => handleRoundEnd(roomCode));
    } catch (err) {
      console.error("Auto word selection error:", err);
    }
  });
}

// Drawing phase ended (time out or everyone guessed): advance to the next round.
async function handleRoundEnd(roomCode: string) {
  try {
    roomCorrectGuessers.delete(roomCode);
    const room = await startNextRound(roomCode);
    io.to(roomCode).emit("room-updated");

    // Game over (started:false) means we're back in the lobby — no timer needed.
    if (room.started) {
      startWordSelection(roomCode);
    }
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
    } catch (err) {
      console.error("Failed to handle player leave after grace period:", err);
    }
    io.to(roomCode).emit("room-updated");
  }, DISCONNECT_GRACE_MS);
  pendingLeaves.set(playerId, timer);
}

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
      io.to(roomCode).emit("room-updated");

      startTimer(roomCode, ROUND_SECONDS, () => handleRoundEnd(roomCode));
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

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Socket.IO Sidecar Server running on port ${PORT}`);
});
