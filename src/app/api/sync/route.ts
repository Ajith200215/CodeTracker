import { NextResponse } from "next/server";
import { getAdapter } from "@/lib/adapters";
import { Platform } from "@prisma/client";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const handles = body.handles || {
      LEETCODE: body.leetcode || "",
      CODEFORCES: body.codeforces || "",
      CODECHEF: body.codechef || "",
    };

    const results: Record<string, any> = {};
    let aggregatedTotalSolved = 0;

    // Fetch LeetCode live stats
    if (handles.LEETCODE || handles.leetcode) {
      const username = handles.LEETCODE || handles.leetcode;
      try {
        const adapter = getAdapter(Platform.LEETCODE);
        if (adapter) {
          const stats = await adapter.fetchStats(username);
          results.leetcode = {
            username,
            solved: stats.totalSolved,
            easy: stats.easySolved || 0,
            medium: stats.mediumSolved || 0,
            hard: stats.hardSolved || 0,
            rating: stats.rating || 0,
            rank: stats.rank || "N/A",
          };
          aggregatedTotalSolved += stats.totalSolved;
        }
      } catch (e: any) {
        console.warn("LeetCode fetch error:", e.message);
        results.leetcode = { username, solved: 0, easy: 0, medium: 0, hard: 0, rating: 0 };
      }
    } else {
      results.leetcode = { username: "None", solved: 0, easy: 0, medium: 0, hard: 0, rating: 0 };
    }

    // Fetch Codeforces live stats
    if (handles.CODEFORCES || handles.codeforces) {
      const username = handles.CODEFORCES || handles.codeforces;
      try {
        const adapter = getAdapter(Platform.CODEFORCES);
        if (adapter) {
          const stats = await adapter.fetchStats(username);
          results.codeforces = {
            username,
            solved: stats.totalSolved,
            rating: stats.rating || 0,
            maxRating: stats.maxRating || 0,
            rank: stats.rank || "N/A",
          };
          aggregatedTotalSolved += stats.totalSolved;
        }
      } catch (e: any) {
        console.warn("Codeforces fetch error:", e.message);
        results.codeforces = { username, solved: 0, rating: 0, maxRating: 0, rank: "N/A" };
      }
    } else {
      results.codeforces = { username: "None", solved: 0, rating: 0, maxRating: 0, rank: "N/A" };
    }

    // Fetch CodeChef live stats
    if (handles.CODECHEF || handles.codechef) {
      const username = handles.CODECHEF || handles.codechef;
      try {
        const adapter = getAdapter(Platform.CODECHEF);
        if (adapter) {
          const stats = await adapter.fetchStats(username);
          results.codechef = {
            username,
            solved: stats.totalSolved,
            rating: stats.rating || 0,
            stars: (stats as any).stars || "0★",
          };
          aggregatedTotalSolved += stats.totalSolved;
        }
      } catch (e: any) {
        results.codechef = { username, solved: 0, rating: 0, stars: "0★" };
      }
    } else {
      results.codechef = { username: "None", solved: 0, rating: 0, stars: "0★" };
    }

    // Calculate aggregated CodeScore rating formula
    const leetcodeRating = results.leetcode?.rating || 0;
    const codeforcesRating = results.codeforces?.rating || 0;
    const codeScore = Math.round(aggregatedTotalSolved * 1.5 + leetcodeRating * 0.3 + codeforcesRating * 0.4);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        leetcode: results.leetcode,
        codeforces: results.codeforces,
        codechef: results.codechef,
        totalSolved: aggregatedTotalSolved,
        codeScore: codeScore || 0,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/sync:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync platform stats" },
      { status: 500 }
    );
  }
}
