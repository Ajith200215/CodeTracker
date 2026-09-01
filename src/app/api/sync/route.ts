import { NextResponse } from "next/server";
import { getAdapter } from "@/lib/adapters";
import { Platform, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { calculateCodeScore } from "@/lib/platforms/stats-aggregator";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PLATFORMS_LIST: Platform[] = [
  Platform.LEETCODE,
  Platform.CODEFORCES,
  Platform.CODECHEF,
  Platform.GEEKSFORGEEKS,
  Platform.HACKERRANK,
  Platform.ATCODER,
  Platform.NEETCODE,
];

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null);

  const handles: Record<string, string> = {
    LEETCODE: "",
    CODEFORCES: "",
    CODECHEF: "",
    GEEKSFORGEEKS: "",
    HACKERRANK: "",
    ATCODER: "",
    NEETCODE: "",
  };

  if (session?.user?.email) {
    const userEmail = session.user.email.toLowerCase().trim();

    try {
      let user = await db.user.findUnique({
        where: { email: userEmail },
        include: { platformHandles: true, college: true },
      }).catch(() => null);

      if (!user) {
        user = await db.user.create({
          data: {
            email: userEmail,
            name: session.user.name || userEmail.split("@")[0],
            role: Role.STUDENT,
            regNo: "2026-CS-0142",
          },
          include: { platformHandles: true, college: true },
        }).catch(() => null);
      }

      if (user && user.platformHandles) {
        user.platformHandles.forEach((h) => {
          if (h.username && h.username.trim() !== "") {
            handles[h.platform] = h.username.trim();
          }
        });
      }
    } catch (dbError) {
      console.warn("DB error in GET /api/sync:", dbError);
    }
  }

  return fetchAndAggregateAllStats(handles);
}

export async function POST(req: Request) {
  let inputHandles: Record<string, string> = {};
  try {
    const body = await req.json().catch(() => ({}));
    const raw = body.handles || body;

    inputHandles = {
      LEETCODE: (raw.leetcode || raw.LEETCODE || "").trim(),
      CODEFORCES: (raw.codeforces || raw.CODEFORCES || "").trim(),
      CODECHEF: (raw.codechef || raw.CODECHEF || "").trim(),
      GEEKSFORGEEKS: (raw.geeksforgeeks || raw.GEEKSFORGEEKS || raw.gfg || "").trim(),
      HACKERRANK: (raw.hackerrank || raw.HACKERRANK || "").trim(),
      ATCODER: (raw.atcoder || raw.ATCODER || "").trim(),
      NEETCODE: (raw.neetcode || raw.NEETCODE || "").trim(),
    };

    const session = await getServerSession(authOptions).catch(() => null);
    if (session?.user?.email) {
      let user = await db.user.findUnique({
        where: { email: session.user.email },
      }).catch(() => null);

      if (!user) {
        user = await db.user.create({
          data: {
            email: session.user.email,
            name: session.user.name || session.user.email.split("@")[0],
            role: Role.STUDENT,
            regNo: "2026-CS-0142",
          },
        }).catch(() => null);
      }

      if (user) {
        for (const platform of PLATFORMS_LIST) {
          const usernameStr = inputHandles[platform] || "";

          if (usernameStr !== "") {
            await db.platformHandle.upsert({
              where: {
                userId_platform: {
                  userId: user.id,
                  platform,
                },
              },
              update: { username: usernameStr },
              create: {
                userId: user.id,
                platform,
                username: usernameStr,
              },
            }).catch((err) => console.warn(`Failed upserting ${platform}:`, err));
          } else {
            // If user explicitly saved empty string, delete handle to persist empty state
            await db.platformHandle.deleteMany({
              where: {
                userId: user.id,
                platform,
              },
            }).catch(() => null);
          }
        }
      }
    }
  } catch (err: any) {
    console.warn("Warning in POST /api/sync:", err);
  }

  return fetchAndAggregateAllStats(inputHandles);
}

async function fetchAndAggregateAllStats(handles: Record<string, string>) {
  const results: Record<string, any> = {};
  const snapshotsForScore: any[] = [];
  let totalSolvedCount = 0;

  for (const platform of PLATFORMS_LIST) {
    const handleStr = (handles[platform] || "").trim();

    if (!handleStr) {
      results[platform.toLowerCase()] = {
        username: "",
        solved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        rating: 0,
        rank: "Unlinked",
      };
      continue;
    }

    try {
      const adapter = getAdapter(platform);
      if (adapter) {
        const stats = await adapter.fetchStats(handleStr);
        const solved = stats.totalSolved || 0;
        totalSolvedCount += solved;

        results[platform.toLowerCase()] = {
          username: handleStr,
          solved,
          easy: stats.easySolved || 0,
          medium: stats.mediumSolved || 0,
          hard: stats.hardSolved || 0,
          rating: stats.rating || 0,
          maxRating: stats.maxRating || stats.rating || 0,
          rank: stats.rank || (stats as any).stars || "API Verified",
          stars: (stats as any).stars || undefined,
        };

        snapshotsForScore.push({
          platform,
          totalSolved: solved,
          easySolved: stats.easySolved,
          mediumSolved: stats.mediumSolved,
          hardSolved: stats.hardSolved,
          rating: stats.rating,
        });
      } else {
        // Platform without active adapter (e.g. NeetCode manual)
        results[platform.toLowerCase()] = {
          username: handleStr,
          solved: 0,
          rating: 0,
          rank: "Manual Handle Saved",
        };
      }
    } catch (e: any) {
      console.warn(`Fetch error for platform ${platform}:`, e.message);
      results[platform.toLowerCase()] = {
        username: handleStr,
        solved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        rating: 0,
        rank: "Error",
      };
    }
  }

  const codeScore = calculateCodeScore(snapshotsForScore);

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    stats: {
      ...results,
      totalSolved: totalSolvedCount,
      codeScore,
    },
  });
}
