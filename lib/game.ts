type JoinGameData = {
  username: string;
  language: string;
  avatar: number;
  playerId?: string | null;
};

async function postJoin(url: string, data: JoinGameData) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  // The API can respond with an HTML error page (e.g. a Next.js dev-server
  // crash or a reverse-proxy 404). Guard the JSON parse so the user gets a
  // useful message instead of "Unexpected token '<' ... is not valid JSON".
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message || `Request failed with status ${response.status}`
    );
  }

  return result;
}

export async function joinPublicGame(data: JoinGameData) {
  return postJoin("/api/matchmaking", data);
}

export async function joinPrivateGame(data: JoinGameData) {
  return postJoin("/api/matchmaking/private", data);
}