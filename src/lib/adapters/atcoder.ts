import { Platform } from "@prisma/client";
import { PlatformAdapter, PlatformStatsResult } from "./types";

export class AtCoderAdapter implements PlatformAdapter {
  platform: Platform = Platform.ATCODER;

  async fetchStats(username: string): Promise<PlatformStatsResult> {
    try {
      const res = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/submission_count?user=${encodeURIComponent(username)}`, {
        headers: { "User-Agent": "CodeTracker/1.0" },
        next: { revalidate: 3600 }
      });
      if (!res.ok) {
        throw new Error(`AtCoder API error: ${res.statusText}`);
      }
      const data = await res.json();
      const totalSolved = data?.count || 0;

      // Fetch user rating
      const ratingRes = await fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/info?user=${encodeURIComponent(username)}`);
      let rating: number | undefined = undefined;
      if (ratingRes.ok) {
        const info = await ratingRes.json();
        rating = info?.rating || undefined;
      }

      return {
        totalSolved,
        rating,
        raw: { data, rating }
      };
    } catch (error) {
      console.warn(`[AtCoderAdapter] Error fetching stats for ${username}:`, error);
      return {
        totalSolved: 0,
        raw: { error: String(error) }
      };
    }
  }
}
