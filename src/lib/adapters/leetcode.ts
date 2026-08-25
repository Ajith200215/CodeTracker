import { PlatformAdapter, PlatformStatsResult } from "./types";
import { Platform } from "@prisma/client";

export class LeetCodeAdapter implements PlatformAdapter {
  platform: Platform = Platform.LEETCODE;

  async fetchStats(username: string): Promise<PlatformStatsResult> {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      throw new Error("LeetCode username cannot be empty");
    }

    // Primary: Instant Official LeetCode GraphQL Query
    try {
      const graphqlUrl = "https://leetcode.com/graphql";
      const query = `
        query userPublicProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
            profile {
              ranking
            }
          }
        }
      `;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      };
      if (process.env.LEETCODE_SESSION) {
        headers["Cookie"] = `LEETCODE_SESSION=${process.env.LEETCODE_SESSION}`;
      }

      const graphqlRes = await fetch(graphqlUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables: { username: cleanUsername } }),
        cache: "no-store",
      });

      if (graphqlRes.ok) {
        const gqlData = await graphqlRes.json();
        const matchedUser = gqlData?.data?.matchedUser;
        if (matchedUser) {
          const stats = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
          const all = stats.find((s: any) => s.difficulty === "All")?.count || 0;
          const easy = stats.find((s: any) => s.difficulty === "Easy")?.count || 0;
          const medium = stats.find((s: any) => s.difficulty === "Medium")?.count || 0;
          const hard = stats.find((s: any) => s.difficulty === "Hard")?.count || 0;

          return {
            totalSolved: all,
            easySolved: easy,
            mediumSolved: medium,
            hardSolved: hard,
            rating: matchedUser.profile?.ranking || 0,
            rank: matchedUser.profile?.ranking ? `#${matchedUser.profile.ranking}` : "N/A",
            raw: matchedUser,
          };
        }
      }
    } catch (e) {
      console.warn("Direct LeetCode GraphQL fetch failed, trying secondary REST proxy...");
    }

    // Secondary Fallback: Public REST proxy
    try {
      const proxyUrl = `https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(cleanUsername)}`;
      const res = await fetch(proxyUrl, { 
        headers: { "User-Agent": "Mozilla/5.0" },
        cache: "no-store" 
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.totalSolved === "number") {
          return {
            totalSolved: data.totalSolved,
            easySolved: data.easySolved || 0,
            mediumSolved: data.mediumSolved || 0,
            hardSolved: data.hardSolved || 0,
            rating: data.ranking || 0,
            rank: data.ranking ? `#${data.ranking}` : "N/A",
            raw: data,
          };
        }
      }
    } catch (e) {
      console.warn("LeetCode REST proxy fallback failed");
    }

    throw new Error(`Could not fetch stats for LeetCode user '${cleanUsername}'`);
  }
}
