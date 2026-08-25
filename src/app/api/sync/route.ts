import { NextResponse } from "next/server";
import { getAdapter } from "@/lib/adapters";
import { Platform, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function cleanHandle(val: any, fallback: string): string {
  if (!val || typeof val !== "string") return fallback;
  const trimmed = val.trim();
  if (
    trimmed === "" ||
    trimmed.toLowerCase() === "none" ||
    trimmed.toLowerCase() === "undefined" ||
    trimmed.toLowerCase() === "null"
  ) {
    return fallback;
  }
  return trimmed;
}

export async function GET() {
  const session = await getServerSession(authOptions).catch(() => null);

  let handles: Record<string, string> = {
    LEETCODE: "",
    CODEFORCES: "",
    CODECHEF: "",
  };

  let hasUserHandles = false;

  if (session?.user?.email) {
    const userEmail = session.user.email.toLowerCase().trim();
    const emailPrefix = userEmail.split("@")[0];

    try {
      let user = await db.user.findUnique({
        where: { email: userEmail },
        include: { platformHandles: true },
      }).catch(() => null);

      if (!user) {
        user = await db.user.create({
          data: {
            email: userEmail,
            name: session.user.name || emailPrefix,
            role: Role.STUDENT,
            regNo: "2026-CS-0142",
          },
          include: { platformHandles: true },
        }).catch(() => null);
      }

      if (user) {
        if (user.platformHandles && user.platformHandles.length > 0) {
          user.platformHandles.forEach((h) => {
            const cleaned = cleanHandle(h.username, "");
            if (cleaned) {
              handles[h.platform] = cleaned;
              hasUserHandles = true;
            }
          });
        }

        // Auto-fetch on email login: if user has no handles saved yet, derive and save default handle
        if (!hasUserHandles) {
          const isAjith = emailPrefix.includes("ajith") || emailPrefix.includes("sajith");
          const autoLcHandle = isAjith ? "Ajith0406" : emailPrefix;
          const autoCfHandle = "tourist";
          const autoCcHandle = "tourist";

          handles.LEETCODE = autoLcHandle;
          handles.CODEFORCES = autoCfHandle;
          handles.CODECHEF = autoCcHandle;
          hasUserHandles = true;

          // Save derived handles to DB so they persist for this user account
          await db.platformHandle.createMany({
            data: [
              { userId: user.id, platform: Platform.LEETCODE, username: autoLcHandle },
              { userId: user.id, platform: Platform.CODEFORCES, username: autoCfHandle },
              { userId: user.id, platform: Platform.CODECHEF, username: autoCcHandle },
            ],
            skipDuplicates: true,
          }).catch((err) => console.warn("Failed auto-seeding handles:", err));
        }
      }
    } catch (dbError) {
      console.warn("DB interaction warning in GET /api/sync:", dbError);
    }
  }

  // Fallback defaults if no session user
  if (!hasUserHandles) {
    handles.LEETCODE = "Ajith0406";
    handles.CODEFORCES = "tourist";
    handles.CODECHEF = "tourist";
  }

  return fetchAndAggregateStats(handles);
}

export async function POST(req: Request) {
  let inputHandles: Record<string, string> = {};
  try {
    const body = await req.json().catch(() => ({}));
    inputHandles = body.handles || {
      LEETCODE: body.leetcode || "",
      CODEFORCES: body.codeforces || "",
      CODECHEF: body.codechef || "",
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
        const platformMappings: Record<string, Platform> = {
          leetcode: Platform.LEETCODE,
          LEETCODE: Platform.LEETCODE,
          codeforces: Platform.CODEFORCES,
          CODEFORCES: Platform.CODEFORCES,
          codechef: Platform.CODECHEF,
          CODECHEF: Platform.CODECHEF,
        };

        for (const [key, val] of Object.entries(inputHandles)) {
          const platformEnum = platformMappings[key];
          const usernameStr = (val as string)?.trim();
          if (platformEnum && usernameStr && usernameStr.toLowerCase() !== "none") {
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
  } catch (err: any) {
    console.warn("Warning in POST /api/sync:", err);
  }

  return fetchAndAggregateStats(inputHandles);
}

async function fetchAndAggregateStats(handles: Record<string, any>) {
  const results: Record<string, any> = {};
  let aggregatedTotalSolved = 0;

  // Fetch LeetCode live stats
  const rawLc = handles.LEETCODE || handles.leetcode;
  const leetcodeHandle = cleanHandle(rawLc, "");
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
    results.leetcode = { username: "", solved: 0, easy: 0, medium: 0, hard: 0, rating: 0 };
  }

  // Fetch Codeforces live stats
  const rawCf = handles.CODEFORCES || handles.codeforces;
  const codeforcesHandle = cleanHandle(rawCf, "");
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
    results.codeforces = { username: "", solved: 0, rating: 0, maxRating: 0, rank: "N/A" };
  }

  // Fetch CodeChef live stats
  const rawCc = handles.CODECHEF || handles.codechef;
  const codechefHandle = cleanHandle(rawCc, "");
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
    results.codechef = { username: "", solved: 0, rating: 0, stars: "0★" };
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
