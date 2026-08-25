import { NextResponse } from "next/server";
import { getAdapter } from "@/lib/adapters";
import { Platform } from "@prisma/client";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    let defaultLeetcode = "Ajith0406";
    if (process.env.LEETCODE_SESSION) {
      try {
        const parts = process.env.LEETCODE_SESSION.split(".");
        if (parts.length >= 2) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
          if (payload.username) {
            defaultLeetcode = payload.username;
          }
        }
      } catch (e) {}
    }

    let emailPrefix = "";
    if (session?.user?.email) {
      emailPrefix = session.user.email.split("@")[0].replace(".", "_");
    }

    let handles: Record<string, string> = {
      LEETCODE: defaultLeetcode,
      CODEFORCES: emailPrefix || "tourist",
      CODECHEF: emailPrefix || "tourist",
    };

    if (session?.user?.email) {
      const user = await db.user.findUnique({
        where: { email: session.user.email },
        include: { platformHandles: true },
      });

      if (user) {
        if (user.platformHandles.length > 0) {
          user.platformHandles.forEach((h) => {
            handles[h.platform] = h.username;
          });
        } else {
          // Auto-bind default detected handle for new logged in student
          await db.platformHandle.createMany({
            data: [
              { userId: user.id, platform: Platform.LEETCODE, username: defaultLeetcode },
              { userId: user.id, platform: Platform.CODEFORCES, username: handles.CODEFORCES },
              { userId: user.id, platform: Platform.CODECHEF, username: handles.CODECHEF },
            ],
            skipDuplicates: true,
          }).catch(() => {});
        }
      }
    }

    return fetchAndAggregateStats(handles);
  } catch (error: any) {
    console.error("Error in GET /api/sync:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch platform stats" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const handles = body.handles || {
      LEETCODE: body.leetcode || "",
      CODEFORCES: body.codeforces || "",
      CODECHEF: body.codechef || "",
    };

    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const user = await db.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        const platformMappings: Record<string, Platform> = {
          leetcode: Platform.LEETCODE,
          LEETCODE: Platform.LEETCODE,
          codeforces: Platform.CODEFORCES,
          CODEFORCES: Platform.CODEFORCES,
          codechef: Platform.CODECHEF,
          CODECHEF: Platform.CODECHEF,
        };

        for (const [key, val] of Object.entries(handles)) {
          const platformEnum = platformMappings[key];
          const usernameStr = (val as string)?.trim();
          if (platformEnum && usernameStr) {
            await db.platformHandle.upsert({
              where: {
                userId_platform: {
                  userId: user.id,
                  platform: platformEnum,
                },
              },
              update: { username: usernameStr },
              create: {
                userId: user.id,
                platform: platformEnum,
                username: usernameStr,
              },
            }).catch((err) => console.warn("Failed to save handle:", err));
          }
        }
      }
    }

    return fetchAndAggregateStats(handles);
  } catch (error: any) {
    console.error("Error in POST /api/sync:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync platform stats" },
      { status: 500 }
    );
  }
}

async function fetchAndAggregateStats(handles: Record<string, any>) {
  const results: Record<string, any> = {};
  let aggregatedTotalSolved = 0;

  // Fetch LeetCode live stats
  const leetcodeHandle = handles.LEETCODE || handles.leetcode || "";
  if (leetcodeHandle) {
    try {
      const adapter = getAdapter(Platform.LEETCODE);
      if (adapter) {
        const stats = await adapter.fetchStats(leetcodeHandle);
        results.leetcode = {
          username: leetcodeHandle,
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
      results.leetcode = { username: leetcodeHandle, solved: 0, easy: 0, medium: 0, hard: 0, rating: 0 };
    }
  } else {
    results.leetcode = { username: "None", solved: 0, easy: 0, medium: 0, hard: 0, rating: 0 };
  }

  // Fetch Codeforces live stats
  const codeforcesHandle = handles.CODEFORCES || handles.codeforces || "";
  if (codeforcesHandle) {
    try {
      const adapter = getAdapter(Platform.CODEFORCES);
      if (adapter) {
        const stats = await adapter.fetchStats(codeforcesHandle);
        results.codeforces = {
          username: codeforcesHandle,
          solved: stats.totalSolved,
          rating: stats.rating || 0,
          maxRating: stats.maxRating || 0,
          rank: stats.rank || "N/A",
        };
        aggregatedTotalSolved += stats.totalSolved;
      }
    } catch (e: any) {
      console.warn("Codeforces fetch error:", e.message);
      results.codeforces = { username: codeforcesHandle, solved: 0, rating: 0, maxRating: 0, rank: "N/A" };
    }
  } else {
    results.codeforces = { username: "None", solved: 0, rating: 0, maxRating: 0, rank: "N/A" };
  }

  // Fetch CodeChef live stats
  const codechefHandle = handles.CODECHEF || handles.codechef || "";
  if (codechefHandle) {
    try {
      const adapter = getAdapter(Platform.CODECHEF);
      if (adapter) {
        const stats = await adapter.fetchStats(codechefHandle);
        results.codechef = {
          username: codechefHandle,
          solved: stats.totalSolved,
          rating: stats.rating || 0,
          stars: (stats as any).stars || "0★",
        };
        aggregatedTotalSolved += stats.totalSolved;
      }
    } catch (e: any) {
      results.codechef = { username: codechefHandle, solved: 0, rating: 0, stars: "0★" };
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
}
