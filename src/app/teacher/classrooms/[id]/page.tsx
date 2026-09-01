import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { Users, Code2, TrendingUp, Award, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ClassroomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).role !== Role.TEACHER) {
    redirect("/unauthorized");
  }

  const classroom = await db.classroom.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          student: {
            include: {
              platformHandles: {
                include: {
                  // Phase 5 requires historical snapshots, but for the table we just need the latest.
                  // Prisma doesn't support easily querying "latest 1 related row" inside an include,
                  // so we'll fetch all snapshots or calculate live if they don't exist?
                  // We can fetch snapshots and sort them in JS since this is MVP.
                }
              }
            }
          }
        }
      }
    }
  });

  if (!classroom || classroom.teacherId !== (session.user as any).id) {
    redirect("/unauthorized");
  }

  // Phase 5: Calculate stats for the roster table
  // For each student, get their latest stats. If they haven't synced, show 0.
  
  // Since we couldn't easily include latest snapshot in the big nested query, let's manually fetch all snapshots for these handles.
  const handleIds = classroom.enrollments.flatMap(e => e.student.platformHandles.map(h => h.id));
  
  const latestSnapshots = await db.platformStatSnapshot.findMany({
    where: { handleId: { in: handleIds } },
    orderBy: { fetchedAt: 'desc' },
    distinct: ['handleId']
  });

  const snapshotMap = new Map(latestSnapshots.map(s => [s.handleId, s]));

  const rosterData = classroom.enrollments.map(e => {
    const student = e.student;
    
    let leetcode = 0, codeforces = 0, codechef = 0;
    let lcRating = 0, cfRating = 0;

    student.platformHandles.forEach(handle => {
      const snap = snapshotMap.get(handle.id);
      if (snap) {
        if (handle.platform === "LEETCODE") {
          leetcode = snap.totalSolved;
          lcRating = snap.rating || 0;
        }
        if (handle.platform === "CODEFORCES") {
          codeforces = snap.totalSolved;
          cfRating = snap.rating || 0;
        }
        if (handle.platform === "CODECHEF") {
          codechef = snap.totalSolved;
        }
      }
    });

    const totalSolved = leetcode + codeforces + codechef;
    const codeScore = Math.round(totalSolved * 1.5 + lcRating * 0.3 + cfRating * 0.4);

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      regNo: student.regNo || "N/A",
      leetcode,
      codeforces,
      codechef,
      totalSolved,
      codeScore
    };
  });

  // Sort by CodeScore descending initially
  rosterData.sort((a, b) => b.codeScore - a.codeScore);

  return (
    <div className="py-8 px-4 lg:px-12 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/teacher/classrooms" className="w-10 h-10 rounded-full bg-white border border-[#8B8CF6]/20 flex items-center justify-center text-[#6A6C88] hover:bg-[#F6F7FF] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif-display text-3xl font-extrabold text-[#1E1F2B]">
              {classroom.name}
            </h1>
            {classroom.section && (
              <span className="text-[10px] font-bold bg-[#F6F7FF] text-[#6C5CE7] px-3 py-1 rounded-full uppercase tracking-wider border border-[#8B8CF6]/20">
                {classroom.section}
              </span>
            )}
          </div>
          <p className="text-sm text-[#6A6C88] font-medium mt-1">
            Classroom Roster & Progress Analytics
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-[#8B8CF6]/20 shadow-xl shadow-[#8B8CF6]/5 overflow-hidden">
        <div className="p-6 border-b border-[#F0F2FF] flex items-center justify-between">
          <h2 className="font-serif-display text-xl font-bold text-[#1E1F2B] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#6C5CE7]" /> Student Progress Leaderboard
          </h2>
          <span className="text-xs font-bold text-[#6A6C88] bg-[#F6F7FF] px-3 py-1 rounded-full">
            {rosterData.length} Enrolled
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F9FF] border-b border-[#F0F2FF]">
                <th className="p-4 pl-6 text-[10px] font-extrabold uppercase text-[#6C5CE7] tracking-wider whitespace-nowrap">Student</th>
                <th className="p-4 text-[10px] font-extrabold uppercase text-[#6A6C88] tracking-wider whitespace-nowrap">Reg No</th>
                <th className="p-4 text-[10px] font-extrabold uppercase text-[#16A34A] tracking-wider whitespace-nowrap">CodeScore</th>
                <th className="p-4 text-[10px] font-extrabold uppercase text-[#6A6C88] tracking-wider whitespace-nowrap">Total Solved</th>
                <th className="p-4 text-[10px] font-extrabold uppercase text-[#6C5CE7] tracking-wider whitespace-nowrap flex items-center gap-1"><Code2 className="w-3 h-3"/> LeetCode</th>
                <th className="p-4 text-[10px] font-extrabold uppercase text-[#3B82F6] tracking-wider whitespace-nowrap"><div className="flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Codeforces</div></th>
                <th className="p-4 pr-6 text-[10px] font-extrabold uppercase text-[#F59E0B] tracking-wider whitespace-nowrap"><div className="flex items-center gap-1"><Award className="w-3 h-3"/> CodeChef</div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2FF]">
              {rosterData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-[#6A6C88] font-medium">
                    No students enrolled yet.
                  </td>
                </tr>
              ) : (
                rosterData.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-[#F6F7FF]/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-[#1E1F2B] group-hover:text-[#6C5CE7] transition-colors">{student.name}</div>
                      <div className="text-[10px] text-[#6A6C88]">{student.email}</div>
                    </td>
                    <td className="p-4 text-xs font-mono font-medium text-[#6A6C88]">{student.regNo}</td>
                    <td className="p-4 text-sm font-black text-[#1E1F2B] font-serif-display">{student.codeScore || "-"}</td>
                    <td className="p-4 text-xs font-bold text-[#6A6C88]">{student.totalSolved || "-"}</td>
                    <td className="p-4 text-xs font-bold text-[#1E1F2B]">{student.leetcode || "-"}</td>
                    <td className="p-4 text-xs font-bold text-[#1E1F2B]">{student.codeforces || "-"}</td>
                    <td className="p-4 pr-6 text-xs font-bold text-[#1E1F2B]">{student.codechef || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
