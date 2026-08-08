# Sketch & Guess

A multiplayer drawing-guessing game (Skribbl.io-style) with an "Analog Sketchbook" design. Next.js + Socket.IO + MongoDB (Atlas).

## How it runs

The Next.js app and the Socket.IO game server run in **one process** (`server/index.ts`), so the entire project is a single deployable unit — no separate ports, no Vercel-sidecar split. The Socket.IO client connects to the same origin the page was loaded from, so no socket URL configuration is needed anywhere.

```
Browser ◄──► one Node process: Next.js (pages + API) + Socket.IO (rooms/timers/canvas/chat) ◄──► MongoDB Atlas
```

## Getting Started (local dev)

```bash
npm install
npm run dev
```

Runs everything on http://localhost:3000. You need a `.env` file with `DATABASE_URL` pointing at your MongoDB.

## Deployment

> The real-time layer needs a **long-lived Node process** — so do **not** deploy this to Vercel (serverless). Use any host that runs a persistent Node service and supports WebSockets:

- **Koyeb** (free tier, stays online), **Render** (free tier, sleeps when idle), **Railway**, **Fly.io**, or a VPS (e.g. Oracle Cloud Always Free). Pick one — it hosts the whole project.

Deploy steps:

1. Push the repo to GitHub.
2. Create a service on your host pointing at the repo.
3. Set the **start command** to `npm run start` (after `npm run build`).
4. Set env vars:
   - `DATABASE_URL` — your MongoDB connection string.
   - `PORT` — usually auto-injected by the host (Render/Koyeb/Railway set this). Defaults to 3000.
   - `CORS_ORIGIN` — optional; the origin to allow for Socket.IO, defaults to `*`.
5. The host gives you a public HTTPS URL — that's the URL players open. No extra socket config, because the client connects to the same origin.

### MongoDB Atlas

Set network access to allow connections from the internet `0.0.0.0/0` (fine for a demo/game) or from your host's egress IPs.

### Scaling

- Game state (rooms, timers) lives in memory of the single process, keyed by room code. Perfect for one instance and small-to-moderate concurrent rooms.
- For horizontal scaling (several instances), you'd add the Socket.IO Redis adapter plus sticky sessions. Start with one instance.

## Env vars

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | MongoDB connection string |
| `PORT` | bind port (host-injected, default 3000) |
| `CORS_ORIGIN` | optional allowed browser origin for Socket.IO (`*` default) |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — learn about Next.js features and API.