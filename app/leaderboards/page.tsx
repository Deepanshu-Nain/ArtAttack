import { getTopPlayers } from "@/services/player.service";
import LeaderboardLayout from "@/components/Leaderboards/LeaderboardLayout";
import LeaderboardRow from "@/components/Leaderboards/LeaderboardRow";

export const revalidate = 60; // Revalidate cache every 60 seconds

type TopPlayer = {
  id: string;
  username: string;
  avatar: number;
  score: number;
};

export default async function LeaderboardsPage() {
  let topPlayers: TopPlayer[] = [];
  let error: string | null = null;

  try {
    topPlayers = await getTopPlayers(100);
  } catch (err) {
    // Don't let a DB outage take down the whole page/build.
    console.error("Failed to load leaderboard:", err);
    error = "Could not load the leaderboard right now. Please try again later.";
  }

  return (
    <LeaderboardLayout>
      {error ? (
        <div className="p-8 text-center text-[var(--color-on-surface-variant)] font-bold text-xl" style={{ fontFamily: "var(--font-body)" }}>
          {error}
        </div>
      ) : topPlayers.length === 0 ? (
        <div className="p-8 text-center text-[var(--color-on-surface-variant)] font-bold text-xl" style={{ fontFamily: "var(--font-body)" }}>
          No players found. Start playing to get on the board!
        </div>
      ) : (
        topPlayers.map((player, index) => (
          <LeaderboardRow key={player.id} player={player} index={index} />
        ))
      )}
    </LeaderboardLayout>
  );
}
