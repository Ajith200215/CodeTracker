"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Code2, 
  TrendingUp, 
  Award, 
  Search, 
  Sparkles, 
  Crown, 
  Zap, 
  RefreshCw, 
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Medal
} from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  regNo: string;
  email: string;
  codeScore: number;
  totalSolved: number;
  leetcode: { username: string; solved: number; easy: number; medium: number; hard: number; rating: number };
  codeforces: { username: string; solved: number; rating: number; maxRating: number; rank: string };
  codechef: { username: string; solved: number; rating: number; stars: string };
  hackerrank: { username: string; solved: number; rating: number; rank: string };
}

export const UnifiedLeaderboardView: React.FC = () => {
  const [rawLeaderboard, setRawLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"codeScore" | "totalSolved" | "leetcode" | "codeforces" | "codechef">("codeScore");

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard`);
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setRawLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const processedLeaderboard = React.useMemo(() => {
    let filtered = rawLeaderboard;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.regNo.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }
    
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "totalSolved") return b.totalSolved - a.totalSolved;
      if (sortBy === "leetcode") return b.leetcode.solved - a.leetcode.solved;
      if (sortBy === "codeforces") return b.codeforces.rating - a.codeforces.rating;
      if (sortBy === "codechef") return b.codechef.rating - a.codechef.rating;
      return b.codeScore - a.codeScore;
    });

    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }, [rawLeaderboard, searchQuery, sortBy]);

  const top3 = processedLeaderboard.slice(0, 3);

  return (
    <div className="py-8 px-4 lg:px-12 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1E1F2B] via-[#2A2B3F] to-[#1E1F2B] rounded-[36px] p-8 text-white border border-[#8B8CF6]/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-left z-10">
          <div className="inline-flex items-center gap-2 bg-[#6C5CE7]/30 text-[#F8A195] px-3.5 py-1 rounded-full text-xs font-extrabold border border-[#6C5CE7]/40">
            <Trophy className="w-3.5 h-3.5" />
            <span>Cross-Platform College Leaderboard</span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-extrabold text-white">
            Unified Competitive Programming Rank
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
            Real-time multi-platform leaderboard aggregating student performance across LeetCode, Codeforces, CodeChef, and HackerRank.
          </p>
        </div>

        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="px-6 py-3.5 rounded-full bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 hover:scale-105 z-10 whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Updating Ranks..." : "Refresh Ranks"}</span>
        </button>
      </div>

      {/* Top 3 Podium Stand Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <div className="bg-white rounded-[32px] p-6 border-2 border-slate-200 shadow-xl relative flex flex-col justify-between order-2 md:order-1 hover:scale-105 transition-transform">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-800 text-xs font-black px-4 py-1 rounded-full shadow-md flex items-center gap-1">
                <Medal className="w-3.5 h-3.5" /> #2 Silver
              </div>
              <div className="text-center pt-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 border-4 border-slate-300 mx-auto flex items-center justify-center font-bold text-xl text-slate-700 font-serif-display shadow-inner">
                  {top3[1].name.charAt(0)}
                </div>
                <h3 className="font-serif-display font-extrabold text-lg text-[#1E1F2B] mt-3">{top3[1].name}</h3>
                <span className="text-[11px] font-mono text-[#6A6C88] font-bold">{top3[1].regNo}</span>
              </div>
              <div className="bg-[#F6F7FF] rounded-2xl p-4 my-4 space-y-2 text-xs font-bold">
                <div className="flex justify-between text-slate-600"><span>CodeScore:</span> <span className="text-[#6C5CE7] font-black">{top3[1].codeScore}</span></div>
                <div className="flex justify-between text-slate-600"><span>Total Solved:</span> <span className="text-[#1E1F2B]">{top3[1].totalSolved}</span></div>
                <div className="flex justify-between text-slate-600"><span>LeetCode:</span> <span className="text-[#8B8CF6]">{top3[1].leetcode.solved}</span></div>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {top3[0] && (
            <div className="bg-gradient-to-b from-amber-50 to-white rounded-[36px] p-7 border-2 border-amber-300 shadow-2xl relative flex flex-col justify-between order-1 md:order-2 md:-translate-y-3 hover:scale-105 transition-transform">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 tracking-wider uppercase">
                <Crown className="w-4 h-4 fill-white" /> #1 Champion
              </div>
              <div className="text-center pt-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-300 to-amber-100 border-4 border-amber-400 mx-auto flex items-center justify-center font-bold text-2xl text-amber-900 font-serif-display shadow-md">
                  {top3[0].name.charAt(0)}
                </div>
                <h3 className="font-serif-display font-extrabold text-xl text-[#1E1F2B] mt-3">{top3[0].name}</h3>
                <span className="text-xs font-mono text-amber-700 font-bold">{top3[0].regNo}</span>
              </div>
              <div className="bg-amber-100/60 rounded-2xl p-4 my-4 space-y-2 text-xs font-bold border border-amber-200">
                <div className="flex justify-between text-amber-900"><span>CodeScore:</span> <span className="text-[#6C5CE7] font-black text-sm">{top3[0].codeScore}</span></div>
                <div className="flex justify-between text-amber-900"><span>Total Solved:</span> <span className="text-[#1E1F2B] font-extrabold">{top3[0].totalSolved}</span></div>
                <div className="flex justify-between text-amber-900"><span>Codeforces Rating:</span> <span className="text-blue-600 font-bold">{top3[0].codeforces.rating}</span></div>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <div className="bg-white rounded-[32px] p-6 border-2 border-amber-800/20 shadow-xl relative flex flex-col justify-between order-3 hover:scale-105 transition-transform">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-xs font-black px-4 py-1 rounded-full shadow-md flex items-center gap-1">
                <Medal className="w-3.5 h-3.5" /> #3 Bronze
              </div>
              <div className="text-center pt-3">
                <div className="w-16 h-16 rounded-full bg-amber-50 border-4 border-amber-600/40 mx-auto flex items-center justify-center font-bold text-xl text-amber-800 font-serif-display shadow-inner">
                  {top3[2].name.charAt(0)}
                </div>
                <h3 className="font-serif-display font-extrabold text-lg text-[#1E1F2B] mt-3">{top3[2].name}</h3>
                <span className="text-[11px] font-mono text-[#6A6C88] font-bold">{top3[2].regNo}</span>
              </div>
              <div className="bg-[#F6F7FF] rounded-2xl p-4 my-4 space-y-2 text-xs font-bold">
                <div className="flex justify-between text-slate-600"><span>CodeScore:</span> <span className="text-[#6C5CE7] font-black">{top3[2].codeScore}</span></div>
                <div className="flex justify-between text-slate-600"><span>Total Solved:</span> <span className="text-[#1E1F2B]">{top3[2].totalSolved}</span></div>
                <div className="flex justify-between text-slate-600"><span>CodeChef:</span> <span className="text-amber-600">{top3[2].codechef.stars}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#8B8CF6]/20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex items-center gap-2 bg-[#F6F7FF] px-4 py-3 rounded-2xl border border-[#8B8CF6]/30 w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8B8CF6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or Reg. No..."
            className="bg-transparent outline-none text-xs font-bold text-[#1E1F2B] w-full"
          />
        </div>

        {/* Sorting Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-extrabold text-[#6A6C88] mr-1 hidden lg:inline">Sort By:</span>
          <button
            onClick={() => setSortBy("codeScore")}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              sortBy === "codeScore" ? "bg-[#6C5CE7] text-white shadow-md" : "bg-[#F6F7FF] text-[#6A6C88] hover:bg-[#EAEBFF]"
            }`}
          >
            CodeScore
          </button>
          <button
            onClick={() => setSortBy("totalSolved")}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              sortBy === "totalSolved" ? "bg-[#6C5CE7] text-white shadow-md" : "bg-[#F6F7FF] text-[#6A6C88] hover:bg-[#EAEBFF]"
            }`}
          >
            Total Solved
          </button>
          <button
            onClick={() => setSortBy("leetcode")}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              sortBy === "leetcode" ? "bg-[#6C5CE7] text-white shadow-md" : "bg-[#F6F7FF] text-[#6A6C88] hover:bg-[#EAEBFF]"
            }`}
          >
            LeetCode
          </button>
          <button
            onClick={() => setSortBy("codeforces")}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              sortBy === "codeforces" ? "bg-[#6C5CE7] text-white shadow-md" : "bg-[#F6F7FF] text-[#6A6C88] hover:bg-[#EAEBFF]"
            }`}
          >
            Codeforces
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-[32px] border border-[#8B8CF6]/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6F7FF] border-b border-[#8B8CF6]/15 text-[11px] font-extrabold text-[#6A6C88] uppercase tracking-wider">
                <th className="p-4 pl-6">Rank</th>
                <th className="p-4">Student</th>
                <th className="p-4">LeetCode</th>
                <th className="p-4">Codeforces</th>
                <th className="p-4">CodeChef</th>
                <th className="p-4">Total Solved</th>
                <th className="p-4 pr-6 text-right">CodeScore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8B8CF6]/10 text-xs font-semibold">
              {processedLeaderboard.map((student) => (
                <tr key={student.id} className="hover:bg-[#F0F2FF]/60 transition-colors">
                  <td className="p-4 pl-6">
                    <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-extrabold font-mono text-xs ${
                      student.rank === 1 ? "bg-amber-400 text-amber-950 font-black shadow-md" :
                      student.rank === 2 ? "bg-slate-300 text-slate-900 font-bold" :
                      student.rank === 3 ? "bg-amber-700 text-white font-bold" : "bg-slate-100 text-slate-700"
                    }`}>
                      {student.rank}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-extrabold text-[#1E1F2B] text-sm">{student.name}</div>
                    <div className="text-[10px] font-mono text-[#8B8CF6]">{student.regNo}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#6C5CE7]">{student.leetcode.solved} Solved</div>
                    <div className="text-[10px] text-slate-500 font-mono">@{student.leetcode.username}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-blue-600">{student.codeforces.rating} Rating</div>
                    <div className="text-[10px] text-slate-500 font-mono">@{student.codeforces.username}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-amber-600">{student.codechef.stars}</div>
                    <div className="text-[10px] text-slate-500 font-mono">@{student.codechef.username}</div>
                  </td>
                  <td className="p-4 font-black text-[#1E1F2B] text-sm">
                    {student.totalSolved}
                  </td>
                  <td className="p-4 pr-6 text-right font-black text-[#6C5CE7] text-base font-serif-display">
                    {student.codeScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
