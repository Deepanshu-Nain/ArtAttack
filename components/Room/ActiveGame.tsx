"use client";

import { useState } from "react";
import { Socket } from "socket.io-client";
import { Player, Room } from "@/types/game";
import CanvasBoard from "./CanvasBoard";
import ToolBar from "./ToolBar";
import ChatBox from "./ChatBox";

import ActiveGameLayout from "./ActiveGameLayout";
import TopGameBar from "./TopGameBar";
import PlayerCard from "./PlayerCard";

export default function ActiveGame({
  room,
  currentPlayerId,
  roomCode,
  socket,
}: {
  room: Room;
  currentPlayerId: string;
  roomCode: string;
  socket: Socket | null;
}) {
  const [currentColor, setCurrentColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [currentTool, setCurrentTool] = useState<"brush" | "fill">("brush");

  const [undoStack, setUndoStack] = useState<string[]>([]);

  const isDrawer = room.currentDrawerId === currentPlayerId;

  const handleClearCanvas = () => {
    if (!isDrawer || !socket) return;
    socket.emit("clear-canvas", { roomCode });
  };

  const handleSaveCanvasState = (dataURL: string) => {
    if (!isDrawer) return;
    setUndoStack(prev => {
      const newStack = [...prev, dataURL];
      if (newStack.length > 10) newStack.shift(); // keep last 10
      return newStack;
    });
  };

  const handleUndo = () => {
    if (!isDrawer || !socket || undoStack.length === 0) return;
    
    const newStack = [...undoStack];
    newStack.pop(); // remove current state
    
    const previousState = newStack.length > 0 ? newStack[newStack.length - 1] : null;
    setUndoStack(newStack);

    if (previousState) {
      socket.emit("sync-canvas", { roomCode, dataURL: previousState });
    } else {
      socket.emit("clear-canvas", { roomCode });
    }
  };

  return (
    <ActiveGameLayout
      playerList={
        <div className="flex flex-col h-full overflow-y-auto">
          {room.players.map((player: Player) => (
            <div key={player.id} className="border-b border-slate-200">
              <PlayerCard 
                player={{...player, isDrawer: player.id === room.currentDrawerId}} 
                layout="horizontal" 
              />
            </div>
          ))}
        </div>
      }
      topBar={<TopGameBar room={room} isDrawer={isDrawer} socket={socket} />}
      toolBar={
        <ToolBar 
          isDrawer={isDrawer}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          onClearCanvas={handleClearCanvas}
          onUndo={handleUndo}
        />
      }
      canvasBoard={
        <CanvasBoard 
          socket={socket}
          roomCode={roomCode}
          isDrawer={isDrawer}
          currentColor={currentColor}
          brushSize={brushSize}
          currentTool={currentTool}
          onSaveCanvasState={handleSaveCanvasState}
        />
      }
      chatBox={
        <ChatBox 
          socket={socket}
          roomCode={roomCode}
          currentPlayerId={currentPlayerId}
          isDrawer={isDrawer}
        />
      }
    />
  );
}
