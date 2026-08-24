import { PlatformAdapter, PlatformStatsResult } from "./types";
import { Platform } from "@prisma/client";

export class CodeforcesAdapter implements PlatformAdapter {
  platform: Platform = Platform.CODEFORCES;

  async fetchStats(username: string): Promise<PlatformStatsResult> {
    const infoUrl = `https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`;
    const statusUrl = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(username)}`;

    const infoRes = await fetch(infoUrl, { next: { revalidate: 300 } });
    if (!infoRes.ok) {
      throw new Error(`Codeforces user '${username}' not found`);
    }

    const infoData = await infoRes.json();
    if (infoData.status !== "OK" || !infoData.result?.[0]) {
      throw new Error(`Codeforces API error for user '${username}'`);
    }

    const userInfo = infoData.result[0];

    // Fetch solved count from user status submissions
    let totalSolved = 0;
    try {
      const statusRes = await fetch(statusUrl, { next: { revalidate: 300 } });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.status === "OK" && Array.isArray(statusData.result)) {
          const solvedProblems = new Set<string>();
          for (const sub of statusData.result) {
            if (sub.verdict === "OK" && sub.problem?.contestId && sub.problem?.index) {
              solvedProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
            }
          }
          totalSolved = solvedProblems.size;
        }
      }
    } catch (e) {
      console.warn("Could not fetch Codeforces submission history, using rating fallback");
    }

    return {
      totalSolved: totalSolved || userInfo.rating || 0,
      rating: userInfo.rating || 0,
      maxRating: userInfo.maxRating || 0,
      rank: userInfo.rank || "Unrated",
      raw: userInfo,
    };
  }
}
