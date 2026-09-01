import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateCodeScore } from "@/lib/platforms/stats-aggregator";

export async function GET(req: Request) {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
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

    const rows = students.map((st: any) => {
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

      const score = calculateCodeScore(snapshotsList, (st.college?.scoreWeights as any) || null);

      const getStat = (pName: string) => {
        const h = st.platformHandles.find((ph: any) => ph.platform === pName);
        const snap = h?.snapshots[0];
        return {
          solved: snap?.totalSolved || 0,
          rating: snap?.rating || "N/A",
        };
      };

      const lc = getStat("LEETCODE");
      const cf = getStat("CODEFORCES");
      const cc = getStat("CODECHEF");
      const gfg = getStat("GEEKSFORGEEKS");

      return [
        `"${st.name}"`,
        `"${st.email}"`,
        `"${st.regNo || "N/A"}"`,
        `"${st.branch || "CSE"}"`,
        st.passoutYear || 2026,
        score,
        lc.solved,
        lc.rating,
        cf.solved,
        cf.rating,
        cc.solved,
        cc.rating,
        gfg.solved,
      ].join(",");
    });

    const csvHeader = "Name,Email,Register No,Branch,Passout Year,CodeScore,LeetCode Solved,LeetCode Rating,Codeforces Solved,Codeforces Rating,CodeChef Solved,CodeChef Rating,GFG Solved\n";
    const csvContent = csvHeader + rows.join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="student_coding_profiles_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("[Recruiter CSV Export Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
