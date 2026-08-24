import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, GraduationCap, ArrowRight } from "lucide-react";

export default async function StudentClassroomsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/unauthorized");
  }

  const studentId = (session.user as any).id;

  const enrollments = await db.enrollment.findMany({
    where: { studentId },
    include: {
      classroom: {
        include: {
          teacher: true
        }
      }
    },
    orderBy: { joinedAt: "desc" }
  });

  return (
    <div className="py-8 px-4 lg:px-12 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif-display text-3xl font-extrabold text-[#1E1F2B]">
          My Enrolled Classes
        </h1>
        <p className="text-sm text-[#6A6C88] font-medium mt-1">
          Access your classroom dashboards and upcoming assessments.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-[#8B8CF6]/20 shadow-xl shadow-[#8B8CF6]/5 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F0F2FF] text-[#6C5CE7] flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="font-serif-display text-2xl font-bold text-[#1E1F2B]">Not enrolled yet</h3>
          <p className="text-sm text-[#6A6C88] mt-2 max-w-md">
            Your teachers will add your college email to their classrooms. Check back later or ask your instructor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(({ classroom }) => (
            <Link key={classroom.id} href={`/student/dashboard`}>
              <div className="bg-white rounded-3xl p-6 border border-[#8B8CF6]/20 shadow-lg shadow-[#8B8CF6]/5 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#8B8CF6] text-white flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold bg-[#F6F7FF] text-[#6C5CE7] px-3 py-1 rounded-full uppercase tracking-wider">
                      {classroom.section || "General"}
                    </span>
                  </div>
                  <h3 className="font-serif-display text-xl font-bold text-[#1E1F2B] group-hover:text-[#6C5CE7] transition-colors">
                    {classroom.name}
                  </h3>
                  <p className="text-xs text-[#6A6C88] font-medium mt-2">
                    Instructor: <span className="font-bold text-[#1E1F2B]">{classroom.teacher.name}</span>
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-[#F0F2FF] flex items-center justify-end">
                  <div className="w-8 h-8 rounded-full bg-[#F6F7FF] group-hover:bg-[#6C5CE7] group-hover:text-white flex items-center justify-center text-[#6A6C88] transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
