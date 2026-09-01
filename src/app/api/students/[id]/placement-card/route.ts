import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateCodeScore } from "@/lib/platforms/stats-aggregator";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.user.findUnique({
      where: { id },
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

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const snapshotsList = student.platformHandles
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

    const codeScore = calculateCodeScore(snapshotsList, (student.college?.scoreWeights as any) || null);

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Placement Card - ${student.name}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body class="bg-slate-950 text-slate-100 font-sans p-8 min-h-screen flex flex-col items-center justify-center">
      <div class="no-print mb-6">
        <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg cursor-pointer transition">
          🖨️ Print / Save as PDF Placement Card
        </button>
      </div>

      <div class="w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div class="absolute -right-16 -top-16 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl"></div>

        <div class="flex items-center justify-between border-b border-slate-800 pb-6 mb-6">
          <div>
            <span class="text-xs font-bold text-indigo-400 tracking-widest uppercase bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800">
              Verified Coding Placement Card
            </span>
            <h1 class="text-3xl font-extrabold text-white mt-2">${student.name}</h1>
            <p class="text-slate-400 text-sm font-mono mt-0.5">${student.regNo || student.email} • ${student.branch || "CSE"} (${student.passoutYear || 2026})</p>
          </div>
          <div class="text-right bg-slate-950 px-5 py-3 rounded-xl border border-slate-800">
            <div class="text-xs font-semibold text-slate-400 uppercase">CodeScore</div>
            <div class="text-3xl font-black text-indigo-400 font-mono">${codeScore}</div>
          </div>
        </div>

        <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Competitive Programming Matrix</h3>
        <div class="grid grid-cols-2 gap-4 mb-6">
          ${student.platformHandles
            .map((h: any) => {
              const snap = h.snapshots[0];
              return `
              <div class="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-slate-200">${h.platform}</span>
                  <span class="text-xs font-mono text-indigo-400">@${h.username}</span>
                </div>
                <div class="text-xs text-slate-400 flex justify-between mt-2">
                  <span>Solved: <strong class="text-white">${snap?.totalSolved || 0}</strong></span>
                  ${snap?.rating ? `<span>Rating: <strong class="text-amber-400">${snap.rating}</strong></span>` : ""}
                </div>
              </div>
            `;
            })
            .join("")}
        </div>

        <div class="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>College: <strong>${student.college?.name || "Engineering College"}</strong></span>
          <span>Generated via <strong>CodeTracker.in</strong></span>
        </div>
      </div>
    </body>
    </html>
    `;

    return new Response(htmlContent, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("[Placement Card API Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
