"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    // Connect to the same origin the page was loaded from: the Next.js app and
    // the Socket.IO server run in one process now, so no separate URL is needed
    // (and this works in dev on :3000, prod on the deployed domain, and behind
    // a proxy/TLS without any extra configuration).
    socket = io({
      autoConnect: false,
      path: "/socket.io",
    });
  }

  return socket;
}