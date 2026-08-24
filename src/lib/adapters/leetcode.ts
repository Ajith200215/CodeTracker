import { PlatformAdapter, PlatformStatsResult } from "./types";
import { Platform } from "@prisma/client";

export class LeetCodeAdapter implements PlatformAdapter {
  platform: Platform = Platform.LEETCODE;

  async fetchStats(username: string): Promise<PlatformStatsResult> {
    const cleanUsername = username.trim();

    // Primary: LeetCode public API proxy
    try {
      const proxyUrl = `https://leetcode-stats-api.herokuapp.com/${encodeURIComponent(cleanUsername)}`;
      const res = await fetch(proxyUrl, { next: { revalidate: 300 } });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success") {
          return {
            totalSolved: data.totalSolved || 0,
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
      console.warn("LeetCode REST proxy failed, attempting GraphQL fallback...");
    }

    // Secondary Fallback: Direct LeetCode GraphQL Query
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

    const graphqlRes = await fetch(graphqlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { username: cleanUsername } }),
      next: { revalidate: 300 },
    });

    if (!graphqlRes.ok) {
      throw new Error(`LeetCode user '${cleanUsername}' not found`);
    }

    const gqlData = await graphqlRes.json();
    const matchedUser = gqlData?.data?.matchedUser;
    if (!matchedUser) {
      throw new Error(`LeetCode user '${cleanUsername}' not found`);
    }

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
