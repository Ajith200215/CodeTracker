import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateCodeScore } from "@/lib/platforms/stats-aggregator";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || req.headers.get("X-Recruiter-Token");

    // Optional recruiter token verification
    if (token) {
      const access = await prisma.recruiterAccess.findUnique({
        where: { token },
      });
      if (!access || new Date() > access.expiresAt) {
        return NextResponse.json({ error: "Invalid or expired recruiter token" }, { status: 403 });
      }
    }

    const yearParam = searchParams.get("year");
    const branchParam = searchParams.get("branch");
    const searchParam = searchParams.get("search");

    const whereClause: any = {
      role: "STUDENT",
    };

    if (yearParam) whereClause.passoutYear = parseInt(yearParam);
    if (branchParam) whereClause.branch = branchParam;
    if (searchParam) {
      whereClause.OR = [
        { name: { contains: searchParam, mode: "insensitive" } },
        { email: { contains: searchParam, mode: "insensitive" } },
        { regNo: { contains: searchParam, mode: "insensitive" } },
      ];
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        platformHandles: {
          include: {
            snapshots: {
              orderBy: { fetchedAt: "desc" },
              take: 1,
            },
          },
        },
        college: true,
      },
    });

    const formatted = students.map((st: any) => {
      const snapshotsList = st.platformHandles
        .map((h: any) => {
          const snap = h.snapshots[0];
          if (!snap) return null;
          return {
            platform: h.platform,
            totalSolved: snap.totalSolved,
            easySolved: snap.easySolved,
            mediumSolved: snap.mediumSolved,
            hardSolved: snap.hardSolved,
            rating: snap.rating,
          };
        })
        .filter(Boolean) as any[];

      const codeScore = calculateCodeScore(snapshotsList, (st.college?.scoreWeights as any) || null);

      const getPlatformInfo = (pName: string) => {
        const h = st.platformHandles.find((ph: any) => ph.platform === pName);
        const snap = h?.snapshots[0];
        return {
          username: h?.username || null,
          verified: h?.verified || false,
          totalSolved: snap?.totalSolved || 0,
          rating: snap?.rating || null,
        };
      };

      return {
        id: st.id,
        name: st.name,
        email: st.email,
        regNo: st.regNo,
        branch: st.branch || "CSE",
        passoutYear: st.passoutYear || 2026,
        college: st.college?.name || "Engineering College",
        codeScore,
        leetcode: getPlatformInfo("LEETCODE"),
        codeforces: getPlatformInfo("CODEFORCES"),
        codechef: getPlatformInfo("CODECHEF"),
        geeksforgeeks: getPlatformInfo("GEEKSFORGEEKS"),
        hackerrank: getPlatformInfo("HACKERRANK"),
        atcoder: getPlatformInfo("ATCODER"),
      };
    });

    // Sort candidates by CodeScore descending
    formatted.sort((a: any, b: any) => b.codeScore - a.codeScore);

    return NextResponse.json({
      success: true,
      total: formatted.length,
      students: formatted,
    });
  } catch (error) {
    console.error("[Recruiter Students API Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
