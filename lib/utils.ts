export function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

/**
 * Turn a raw exception (often a Prisma/MongoDB driver dump) into a short,
 * human-readable message before it reaches the client. We don't want to leak
 * DB internals into the UI, and the raw "Server selection timeout" text reads
 * like a mysterious error to players.
 */
export function friendlyErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown error";

  const isDbConnectionFailure =
    /server selection timeout|no available servers|connect econnrefused|connect timeout|timed out|authentication failed/i.test(
      message
    );

  if (isDbConnectionFailure) {
    return "Can't connect to the game database (MongoDB Atlas). Make sure the cluster is running and your IP is allowed, then try again.";
  }

  return message;
}