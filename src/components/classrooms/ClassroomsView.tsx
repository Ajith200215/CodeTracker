"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, ChevronRight, Trophy, Download, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";

interface Classroom {
  id: string;
  name: string;
  section: string | null;
  _count: { enrollments: number };
}

interface StudentStat {
  studentId: string;
  name: string;
  regNo: string;
  totalSolved: number;
  platforms: Record<string, number>;
}

export const ClassroomsView: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sectionData, setSectionData] = useState<StudentStat[]>([]);
  const [loadingSection, setLoadingSection] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();
  const [showOnlyMyClass, setShowOnlyMyClass] = useState(true);

  const userSection = (session?.user as any)?.section;

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await fetch("/api/classrooms");
      const data = await res.json();
      if (data.success) {
        setClassrooms(data.classrooms);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSection = async (sectionName: string) => {
    setSelectedSection(sectionName);
    setLoadingSection(true);
    try {
      const res = await fetch(`/api/classrooms/${encodeURIComponent(sectionName)}`);
      const data = await res.json();
      if (data.success && data.classroom) {
        const stats: StudentStat[] = data.classroom.enrollments.map((enr: any) => {
          let total = 0;
          const platforms: Record<string, number> = {
            LEETCODE: 0,
            HACKERRANK: 0,
            CODEFORCES: 0,
            GEEKSFORGEEKS: 0,
            CODECHEF: 0
          };

          enr.student.platformHandles.forEach((handle: any) => {
            if (handle.snapshots && handle.snapshots.length > 0) {
              const solved = handle.snapshots[0].totalSolved || 0;
              total += solved;
              if (handle.platform in platforms) {
                platforms[handle.platform] = solved;
              }
            }
          });
          return {
            studentId: enr.student.id,
            name: enr.student.name,
            regNo: enr.student.regNo || "N/A",
            totalSolved: total,
            platforms
          };
        });
        
        // Sort by total solved desc
        stats.sort((a, b) => b.totalSolved - a.totalSolved);
        setSectionData(stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSection(false);
    }
  };

  const exportToCSV = () => {
    if (!sectionData.length) return;
    
    // Headers
    let csvContent = "Rank,Registration No,Student Name,Total Solved,LeetCode,HackerRank,Codeforces,GeeksForGeeks,CodeChef\n";
    
    // Rows
    sectionData.forEach((student, index) => {
      // Escape names with quotes if they contain commas
      const safeName = student.name.includes(',') ? `"${student.name}"` : student.name;
      csvContent += `${index + 1},${student.regNo},${safeName},${student.totalSolved},${student.platforms.LEETCODE},${student.platforms.HACKERRANK},${student.platforms.CODEFORCES},${student.platforms.GEEKSFORGEEKS},${student.platforms.CODECHEF}\n`;
    });

    // Create Blob & Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Section_${selectedSection}_Leaderboard.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredClassrooms = classrooms.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    if (session?.user && showOnlyMyClass && userSection) {
      return c.name.toLowerCase() === userSection.toLowerCase();
    }
    return true;
  });

  if (selectedSection) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-[#8B8CF6]/20 shadow-xl min-h-[60vh] transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => setSelectedSection(null)}
              className="text-[#6C5CE7] hover:text-[#5A4AD1] dark:text-[#8B8CF6] flex items-center gap-1 text-sm font-bold mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </button>
            <h2 className="font-serif-display text-3xl font-bold text-[#1E1F2B] dark:text-white flex items-center gap-3">
              Section {selectedSection}
              <span className="text-sm px-3 py-1 bg-[#F0F2FF] dark:bg-gray-700 text-[#6C5CE7] dark:text-[#8B8CF6] rounded-full font-sans font-bold">
                {sectionData.length} Students
              </span>
            </h2>
          </div>
          
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-full text-sm font-bold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export as Excel (CSV)
          </button>
        </div>

        {loadingSection ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6F7FF] dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-xs font-extrabold text-[#5A5C75] dark:text-gray-400 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-[#5A5C75] dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-[#5A5C75] dark:text-gray-400 uppercase tracking-wider">Reg. No</th>
                  <th className="px-4 py-4 text-xs font-extrabold text-[#5A5C75] dark:text-gray-400 uppercase tracking-wider text-center" title="LeetCode">LC</th>
                  <th className="px-4 py-4 text-xs font-extrabold text-[#5A5C75] dark:text-gray-400 uppercase tracking-wider text-center" title="HackerRank">HR</th>
                  <th className="px-4 py-4 text-xs font-extrabold text-[#5A5C75] dark:text-gray-400 uppercase tracking-wider text-center" title="Codeforces">CF</th>
                  <th className="px-4 py-4 text-xs font-extrabold text-[#5A5C75] dark:text-gray-400 uppercase tracking-wider text-center" title="GeeksForGeeks">GFG</th>
                  <th className="px-4 py-4 text-xs font-extrabold text-[#5A5C75] dark:text-gray-400 uppercase tracking-wider text-center" title="CodeChef">CC</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-[#5A5C75] dark:text-gray-400 uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {sectionData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No students found in this section.
                    </td>
                  </tr>
                ) : (
                  sectionData.map((student, idx) => (
                    <tr 
                      key={student.studentId} 
                      className="hover:bg-[#F0F2FF]/50 dark:hover:bg-gray-700/30 transition-colors cursor-context-menu"
                      title="Right click to view full detailed stats"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        window.open('/api/students/' + student.studentId + '/placement-card', '_blank');
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          idx === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          idx === 1 ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300" :
                          idx === 2 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" :
                          "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          {idx === 0 || idx === 1 || idx === 2 ? <Trophy className="w-4 h-4" /> : idx + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1E1F2B] dark:text-white">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#5A5C75] dark:text-gray-400">
                        {student.regNo}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {student.platforms.LEETCODE}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {student.platforms.HACKERRANK}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {student.platforms.CODEFORCES}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {student.platforms.GEEKSFORGEEKS}
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {student.platforms.CODECHEF}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#E5E7EB] dark:bg-gray-700 text-[#1E1F2B] dark:text-white font-bold text-sm">
                          {student.totalSolved}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-[#8B8CF6]/20 shadow-xl min-h-[60vh] transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif-display text-3xl font-bold text-[#1E1F2B] dark:text-white mb-2">Classroom Directory</h2>
          <p className="text-[#5A5C75] dark:text-gray-400 text-sm">Select a section to view its unified student leaderboard.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {session?.user && userSection && (
            <label className="flex items-center gap-2 cursor-pointer bg-[#F6F7FF] dark:bg-gray-900 px-4 py-2 rounded-full border border-[#8B8CF6]/30 dark:border-gray-700">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={showOnlyMyClass}
                  onChange={() => setShowOnlyMyClass(!showOnlyMyClass)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${showOnlyMyClass ? 'bg-[#6C5CE7]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showOnlyMyClass ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <span className="text-xs font-bold text-[#1E1F2B] dark:text-white">Show only my class</span>
            </label>
          )}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search sections..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#F6F7FF] dark:bg-gray-900 border border-[#8B8CF6]/30 dark:border-gray-700 rounded-full text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] dark:text-white"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5CE7]"></div>
        </div>
      ) : filteredClassrooms.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No classrooms found</h3>
          <p className="text-gray-500 dark:text-gray-400">Classrooms are automatically created when students register.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClassrooms.map((cls) => (
            <button
              key={cls.id}
              onClick={() => handleSelectSection(cls.name)}
              className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-[#F0F2FF] dark:hover:bg-gray-700 hover:border-[#8B8CF6]/50 transition-all group text-left shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F6F7FF] dark:bg-gray-900 flex items-center justify-center text-[#6C5CE7] dark:text-[#8B8CF6] group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1E1F2B] dark:text-white text-lg">Section {cls.name}</h3>
                  <p className="text-xs font-semibold text-[#5A5C75] dark:text-gray-400 mt-0.5">
                    {cls._count?.enrollments || 0} Enrolled
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#6C5CE7] dark:group-hover:text-[#8B8CF6] transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
