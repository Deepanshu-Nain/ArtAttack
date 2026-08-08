"use client";

import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { fastFloodFill } from "@/lib/floodFill";

export default function CanvasBoard({
  socket,
  roomCode,
  isDrawer,
  currentColor,
  brushSize,
  currentTool,
  onSaveCanvasState,
}: {
  socket: Socket | null;
  roomCode: string;
  isDrawer: boolean;
  currentColor: string;
  brushSize: number;
  currentTool?: "brush" | "fill";
  onSaveCanvasState?: (dataURL: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const lastFillTime = useRef<number>(0);
  // Tracks whether this client's canvas has any content. Used when answering
  // "request-canvas-state" so a client with a blank canvas doesn't broadcast
  // a blank image over everyone else's work.
  const hasContentRef = useRef<boolean>(false);

  useEffect(() => {
    if (!socket) return;

    const handleDrawStroke = (strokeData: { x0: number; y0: number; x1: number; y1: number; color: string; size: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(strokeData.x0, strokeData.y0);
      ctx.lineTo(strokeData.x1, strokeData.y1);
      ctx.strokeStyle = strokeData.color;
      ctx.lineWidth = strokeData.size;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.closePath();
      hasContentRef.current = true;
    };

    const handleFill = (fillData: { x: number, y: number, color: string }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      fastFloodFill(ctx, fillData.x, fillData.y, fillData.color);
      hasContentRef.current = true;
    };

    const handleClearCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasContentRef.current = false;
    };

    const handleSyncCanvas = (dataURL: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        hasContentRef.current = true;
      };
      img.src = dataURL;
    };

    // A late joiner (or the server on join) asks for the current canvas. Share
    // it only if this client actually has content on the board.
    const handleRequestCanvasState = () => {
      if (!hasContentRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      socket.emit("sync-canvas", { roomCode, dataURL: canvas.toDataURL() });
    };

    socket.on("draw-stroke", handleDrawStroke);
    socket.on("fill-canvas", handleFill);
    socket.on("clear-canvas", handleClearCanvas);
    socket.on("sync-canvas", handleSyncCanvas);
    socket.on("request-canvas-state", handleRequestCanvasState);

    return () => {
      socket.off("draw-stroke", handleDrawStroke);
      socket.off("fill-canvas", handleFill);
      socket.off("clear-canvas", handleClearCanvas);
      socket.off("sync-canvas", handleSyncCanvas);
      socket.off("request-canvas-state", handleRequestCanvasState);
    };
  }, [socket, roomCode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    if (currentTool === "fill") {
      const now = Date.now();
      if (now - lastFillTime.current < 200) return; // 200ms throttle
      lastFillTime.current = now;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        if (onSaveCanvasState) onSaveCanvasState(canvas.toDataURL());
        fastFloodFill(ctx, x, y, currentColor);
        if (socket) {
          socket.emit("fill-canvas", { roomCode, fillData: { x, y, color: currentColor } });
        }
      }
      return;
    }

    if (onSaveCanvasState) onSaveCanvasState(canvas.toDataURL());
    setIsDrawing(true);
    setLastPos({ x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawer || !lastPos) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const currentPos = {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };

    // Draw locally
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.closePath();

    // Emit to others
    if (socket) {
      socket.emit("draw-stroke", {
        roomCode,
        strokeData: {
          x0: lastPos.x,
          y0: lastPos.y,
          x1: currentPos.x,
          y1: currentPos.y,
          color: currentColor,
          size: brushSize,
        }
      });
    }

    setLastPos(currentPos);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPos(null);
  };

  return (
    <div className="relative w-full max-w-[800px] aspect-[4/3] bg-[var(--color-drawing-surface)] sketch-border flex flex-col">
      {/* Top Spiral Binding */}
      <div className="top-spiral w-full absolute top-0 left-0" />

      {/* Canvas */}
      <div className="flex-grow w-full h-full relative mt-3">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className={`w-full h-full ${isDrawer ? "cursor-crosshair" : "cursor-default"}`}
          style={{ touchAction: "none" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
}
