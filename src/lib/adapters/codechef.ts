import { PlatformAdapter, PlatformStatsResult } from "./types";
import { Platform } from "@prisma/client";

export class CodeChefAdapter implements PlatformAdapter {
  platform: Platform = Platform.CODECHEF;

  async fetchStats(username: string): Promise<PlatformStatsResult> {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      throw new Error("CodeChef username cannot be empty");
    }

    try {
      const res = await fetch(`https://www.codechef.com/users/${encodeURIComponent(cleanUsername)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 300 },
      });

      if (res.ok) {
        const html = await res.text();
        const ratingMatch = html.match(/class="rating-number">[\s\n]*(\d+)/);
        const solvedMatch = 
          html.match(/Total Problems Solved:[^\d]*(\d+)/i) || 
          html.match(/Problems Solved:[^\d]*(\d+)/i) || 
          html.match(/Fully Solved \((\d+)\)/);
        const starsMatch = html.match(/class="rating-star">[\s\n]*<span>([^<]+)<\/span>/) || html.match(/(\d★|\d\s*star)/i);

        const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;
        const totalSolved = solvedMatch ? parseInt(solvedMatch[1], 10) : 0;
        const stars = starsMatch ? starsMatch[1].trim() : (rating > 2000 ? "5★" : rating > 1600 ? "3★" : "1★");

        if (rating > 0 || totalSolved > 0) {
          return {
            totalSolved,
            rating,
            stars,
            raw: { rating, totalSolved, stars },
          };
        }
      }
    } catch (e: any) {
      console.warn(`CodeChef direct fetch error for ${cleanUsername}:`, e.message);
    }

    return {
      totalSolved: 0,
      rating: 0,
      stars: "0★",
      raw: { error: true },
    };
  }
}
