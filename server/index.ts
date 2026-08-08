import { createServer } from "http";
import next from "next";
import { attachSocketServer } from "./socket";

// Run the Next.js app and the Socket.IO game server inside ONE process so the
// whole project deploys as a single unit on a host that runs long-lived Node
// processes (Koyeb, Render, Railway, Fly.io, a VPS, ...). No Vercel split.
//
// Dev:      npm run dev            (Next dev + Socket.IO on the same port)
// Prod:     npm run build && npm start
//
// The port comes from `PORT` (injected by cloud hosts), falling back to 3000.

const port = Number(process.env.PORT || 3000);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

// One shared HTTP server: Next.js handles page/API requests, Socket.IO handles
// the real-time layer, both on the same port/origin.
const httpServer = createServer((req, res) => handle(req, res));

// Attach the Socket.IO game server to the same HTTP server.
attachSocketServer(httpServer);

app.prepare().then(() => {
  httpServer.listen(port, "0.0.0.0", () => {
    console.log(
      `> Ready on http://localhost:${port} (${dev ? "development" : "production"}) — Next.js + Socket.IO in one process`
    );
  });
});
