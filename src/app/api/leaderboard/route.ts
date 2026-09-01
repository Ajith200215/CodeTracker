import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdapter } from "@/lib/adapters";
import { Platform, Role } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "codeScore"; // codeScore | totalSolved | leetcode | codeforces | codechef
    const queryStr = searchParams.get("q") || "";

    // Fetch students from database
    let dbStudents = await db.user.findMany({
      where: {
        role: Role.STUDENT,
        ...(queryStr
          ? {
              OR: [
                { name: { contains: queryStr, mode: "insensitive" } },
                { email: { contains: queryStr, mode: "insensitive" } },
                { regNo: { contains: queryStr, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        platformHandles: true,
      },
      take: 50,
    }).catch(() => []);

    let leaderboardEntries: any[] = [];

    for (const student of dbStudents) {
      const studentHandles: Record<string, string> = {};
      student.platformHandles.forEach((h) => {
        studentHandles[h.platform] = h.username;
      });

      const entry = await computeStudentMetrics(
        student.id,
        student.name,
        student.regNo || "N/A",
        student.email,
        studentHandles
      );
      leaderboardEntries.push(entry);
    }

    // Sort leaderboard based on sortBy parameter
    leaderboardEntries.sort((a, b) => {
      if (sortBy === "totalSolved") return b.totalSolved - a.totalSolved;
      if (sortBy === "leetcode") return b.leetcode.solved - a.leetcode.solved;
      if (sortBy === "codeforces") return b.codeforces.rating - a.codeforces.rating;
      if (sortBy === "codechef") return b.codechef.rating - a.codechef.rating;
      return b.codeScore - a.codeScore; // default codeScore
    });

    // Assign rank positions
    leaderboardEntries = leaderboardEntries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      leaderboard: leaderboardEntries,
      totalStudents: leaderboardEntries.length,
    });
  } catch (error: any) {
    console.error("Error in GET /api/leaderboard:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate leaderboard" },
      { status: 500 }
    );
  }
}

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

async function computeStudentMetrics(
  id: string,
  name: string,
  regNo: string,
  email: string,
  handles: Record<string, string>
) {
  const lcHandle = cleanHandle(handles.LEETCODE, "");
  const cfHandle = cleanHandle(handles.CODEFORCES, "");
  const ccHandle = cleanHandle(handles.CODECHEF, "");
  const hrHandle = cleanHandle(handles.HACKERRANK, "");

  let lcStats = { username: lcHandle || "N/A", solved: 0, easy: 0, medium: 0, hard: 0, rating: 0 };
  let cfStats = { username: cfHandle || "N/A", solved: 0, rating: 0, maxRating: 0, rank: "N/A" };
  let ccStats = { username: ccHandle || "N/A", solved: 0, rating: 0, stars: "N/A" };
  let hrStats = { username: hrHandle || "N/A", solved: 0, rating: 0, rank: "N/A" };

  try {
    const lcAdapter = getAdapter(Platform.LEETCODE);
    if (lcAdapter && lcHandle) {
      const stats = await lcAdapter.fetchStats(lcHandle);
      lcStats = {
        username: lcHandle,
        solved: stats.totalSolved || 0,
        easy: stats.easySolved || 0,
        medium: stats.mediumSolved || 0,
        hard: stats.hardSolved || 0,
        rating: stats.rating || 0,
      };
    }
  } catch (e) {}

  try {
    const cfAdapter = getAdapter(Platform.CODEFORCES);
    if (cfAdapter && cfHandle) {
      const stats = await cfAdapter.fetchStats(cfHandle);
      cfStats = {
        username: cfHandle,
        solved: stats.totalSolved || 0,
        rating: stats.rating || 0,
        maxRating: stats.maxRating || 0,
        rank: stats.rank || "N/A",
      };
    }
  } catch (e) {}

  try {
    const ccAdapter = getAdapter(Platform.CODECHEF);
    if (ccAdapter && ccHandle) {
      const stats = await ccAdapter.fetchStats(ccHandle);
      ccStats = {
        username: ccHandle,
        solved: stats.totalSolved || 0,
        rating: stats.rating || 0,
        stars: (stats as any).stars || "N/A",
      };
    }
  } catch (e) {}

  const totalSolved = lcStats.solved + cfStats.solved + ccStats.solved + hrStats.solved;
  const codeScore = Math.round(totalSolved * 1.5 + lcStats.rating * 0.1 + cfStats.rating * 0.4 + ccStats.rating * 0.3);

  return {
    id,
    name,
    regNo,
    email,
    codeScore,
    totalSolved,
    leetcode: lcStats,
    codeforces: cfStats,
    codechef: ccStats,
    hackerrank: hrStats,
    handles,
  };
}
