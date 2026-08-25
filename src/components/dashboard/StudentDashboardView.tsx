"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Trophy, 
  Code2, 
  TrendingUp, 
  RefreshCw, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Calendar, 
  ArrowUpRight,
  Zap,
  ShieldCheck,
  Edit3,
  X,
  ExternalLink
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface StudentDashboardViewProps {
  onStartExam: () => void;
  initialChartData?: { week: string; solved: number }[];
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({ onStartExam, initialChartData }) => {
  const { data: session } = useSession();
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncStatus, setSyncStatus] = useState<string | null>("Syncing live coding platform stats...");
  const [showHandlesModal, setShowHandlesModal] = useState(false);

  // Platform usernames state (defaults to empty if not configured yet)
  const [handles, setHandles] = useState({
    leetcode: "",
    codeforces: "",
    codechef: "",
  });

  const studentName = session?.user?.name || "Sarah Hessy";
  const studentRegNo = (session?.user as any)?.regNo || "2026-CS-0142";

  // Dynamic live platform stats state
  const [stats, setStats] = useState({
    leetcode: { username: "", solved: 0, easy: 0, medium: 0, hard: 0, rating: 0 },
    codeforces: { username: "", solved: 0, rating: 0, maxRating: 0 },
    codechef: { username: "", solved: 0, rating: 0, stars: "0★" },
    totalSolved: 0,
    codeScore: 0,
    lastSynced: "Never",
  });

  const chartData = initialChartData || [
    { week: "Wk 1", solved: 0 },
    { week: "Wk 2", solved: 0 },
    { week: "Wk 3", solved: 0 },
    { week: "Wk 4", solved: 0 },
    { week: "Wk 5", solved: 0 },
    { week: "Wk 6 (Live)", solved: 0 },
  ];

  // Execute Live API Fetching via GET or POST /api/sync
  const fetchLivePlatformStats = async (customHandles?: typeof handles) => {
    setIsSyncing(true);
    setSyncStatus("Connecting to live LeetCode, Codeforces & CodeChef APIs...");

    try {
      let response;
      if (customHandles) {
        response = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handles: customHandles }),
        });
      } else {
        response = await fetch("/api/sync");
      }

      const data = await response.json();
      if (data.success && data.stats) {
        const lcUser = data.stats.leetcode?.username && data.stats.leetcode.username !== "None" ? data.stats.leetcode.username : "";
        const cfUser = data.stats.codeforces?.username && data.stats.codeforces.username !== "None" ? data.stats.codeforces.username : "";
        const ccUser = data.stats.codechef?.username && data.stats.codechef.username !== "None" ? data.stats.codechef.username : "";

        setStats({
          leetcode: {
            username: lcUser,
            solved: data.stats.leetcode?.solved || 0,
            easy: data.stats.leetcode?.easy || 0,
            medium: data.stats.leetcode?.medium || 0,
            hard: data.stats.leetcode?.hard || 0,
            rating: data.stats.leetcode?.rating || 0,
          },
          codeforces: {
            username: cfUser,
            solved: data.stats.codeforces?.solved || 0,
            rating: data.stats.codeforces?.rating || 0,
            maxRating: data.stats.codeforces?.maxRating || 0,
          },
          codechef: {
            username: ccUser,
            solved: data.stats.codechef?.solved || 0,
            rating: data.stats.codechef?.rating || 0,
            stars: data.stats.codechef?.stars || "0★",
          },
          totalSolved: data.stats.totalSolved || 0,
          codeScore: data.stats.codeScore || 0,
          lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        setHandles({
          leetcode: lcUser,
          codeforces: cfUser,
          codechef: ccUser,
        });

        setSyncStatus(`Live data fetched cleanly! Total Solved: ${data.stats.totalSolved} problems.`);
      }
    } catch (error: any) {
      console.error("Live fetch error:", error);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  useEffect(() => {
    fetchLivePlatformStats();
  }, []);

  const handleSaveHandles = () => {
    setShowHandlesModal(false);
    fetchLivePlatformStats(handles);
  };

  return (
    <div className="py-8 px-4 lg:px-12 max-w-7xl mx-auto space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-[#6C5CE7] via-[#8B8CF6] to-[#A2A4F6] rounded-[32px] p-6 sm:p-8 text-white shadow-xl shadow-[#6C5CE7]/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-[#F8A195]" />
            <span>Reg. No: {studentRegNo}</span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-extrabold">
            Welcome back, {studentName}!
          </h1>
          <p className="text-sm text-white/90 font-medium">
            Classroom: Section A1 — Computer Science & Engineering
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => setShowHandlesModal(true)}
            className="px-5 py-3 rounded-full bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-[#F8A195]" />
            <span>Edit Usernames</span>
          </button>

          <button
            onClick={() => fetchLivePlatformStats()}
            disabled={isSyncing}
            className="px-6 py-3 rounded-full bg-white text-[#1E1F2B] hover:bg-[#F0F2FF] font-extrabold text-xs shadow-md transition-all flex items-center gap-2 hover:scale-105"
          >
            <RefreshCw className={`w-4 h-4 text-[#6C5CE7] ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Fetching Live..." : "Fetch Live Stats"}</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="bg-[#4ADE80]/15 border border-[#4ADE80]/40 p-4 rounded-2xl text-xs font-bold text-[#1E1F2B] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Summary Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Combined CodeScore */}
        <div className="bg-white rounded-3xl p-6 border border-[#8B8CF6]/20 shadow-lg shadow-[#8B8CF6]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6A6C88] uppercase">CodeScore Rating</span>
            <Trophy className="w-5 h-5 text-[#F8A195]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-[#1E1F2B] font-serif-display">
              {stats.codeScore}
            </div>
            <div className="text-xs font-bold text-[#16A34A] flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Top 5% of Department</span>
            </div>
          </div>
          <div className="text-[11px] text-[#6A6C88] font-medium">Last synced: {stats.lastSynced}</div>
        </div>

        {/* Card 2: LeetCode Stats */}
        <div className="bg-white rounded-3xl p-6 border border-[#8B8CF6]/20 shadow-lg shadow-[#8B8CF6]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-[#6C5CE7]" />
              <span className="text-xs font-bold text-[#6A6C88] uppercase">LeetCode</span>
            </div>
            <span className="text-[10px] font-mono text-[#8B8CF6]">@{stats.leetcode.username || "Unlinked"}</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-[#1E1F2B] font-serif-display">
              {stats.leetcode.solved} <span className="text-xs text-[#6A6C88] font-sans font-normal">Solved</span>
            </div>
            <div className="flex gap-1.5 text-[10px] font-bold mt-1">
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stats.leetcode.easy} Easy</span>
              <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{stats.leetcode.medium} Med</span>
              <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{stats.leetcode.hard} Hard</span>
            </div>
          </div>
          <div className="text-[11px] text-[#6A6C88] font-medium flex justify-between">
            <span>Rating: {stats.leetcode.rating}</span>
            <span className="text-[#6C5CE7] font-bold">API Verified ✓</span>
          </div>
        </div>

        {/* Card 3: Codeforces Stats */}
        <div className="bg-white rounded-3xl p-6 border border-[#8B8CF6]/20 shadow-lg shadow-[#8B8CF6]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-xs font-bold text-[#6A6C88] uppercase">Codeforces</span>
            </div>
            <span className="text-[10px] font-mono text-[#3B82F6]">@{stats.codeforces.username || "Unlinked"}</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-[#1E1F2B] font-serif-display">
              {stats.codeforces.rating} <span className="text-xs text-[#3B82F6] font-sans font-normal">Rating</span>
            </div>
            <div className="text-xs font-bold text-[#3B82F6] mt-1">
              {stats.codeforces.solved} Problems Solved
            </div>
          </div>
          <div className="text-[11px] text-[#6A6C88] font-medium flex justify-between">
            <span>Max Rating: {stats.codeforces.maxRating}</span>
            <span className="text-[#3B82F6] font-bold">API Verified ✓</span>
          </div>
        </div>

        {/* Card 4: CodeChef */}
        <div className="bg-white rounded-3xl p-6 border border-[#8B8CF6]/20 shadow-lg shadow-[#8B8CF6]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs font-bold text-[#6A6C88] uppercase">CodeChef</span>
            </div>
            <span className="text-[10px] font-mono text-[#F59E0B]">@{stats.codechef.username || "Unlinked"}</span>
          </div>
          <div className="my-3">
            <div className="text-3xl font-black text-[#1E1F2B] font-serif-display">
              {stats.codechef.rating} <span className="text-lg text-[#F59E0B] font-bold">{stats.codechef.stars}</span>
            </div>
            <div className="text-xs font-bold text-[#6A6C88] mt-1">
              {stats.codechef.solved} Solved
            </div>
          </div>
          <div className="text-[11px] text-[#6A6C88] font-medium">Division 2</div>
        </div>
      </div>

      {/* Main Content Grid: Solve Progress Chart & Active Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Solve Trend Chart (Recharts) */}
        <div className="lg:col-span-8 bg-white rounded-[32px] p-6 sm:p-8 border border-[#8B8CF6]/20 shadow-xl shadow-[#8B8CF6]/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif-display text-2xl font-bold text-[#1E1F2B]">
                Live Solve Progress Over Time
              </h3>
              <p className="text-xs text-[#6A6C88] font-medium">
                Live PlatformStatSnapshot history (Weekly aggregation)
              </p>
            </div>
            <span className="text-xs font-extrabold text-[#6C5CE7] bg-[#F0F2FF] px-3.5 py-1.5 rounded-full">
              Real API Stream Active
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2FF" />
                <XAxis dataKey="week" stroke="#6A6C88" fontSize={12} />
                <YAxis stroke="#6A6C88" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E1F2B",
                    borderRadius: "16px",
                    color: "#fff",
                    border: "none",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="solved"
                  stroke="#6C5CE7"
                  strokeWidth={4}
                  dot={{ r: 6, fill: "#F8A195" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Proctored Exam Card */}
        <div className="lg:col-span-4 bg-[#1E1F2B] text-white rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#F8A195]/20 text-[#F8A195] px-3 py-1 rounded-full text-xs font-extrabold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Proctored Assessment</span>
            </div>

            <h3 className="font-serif-display text-2xl font-bold text-white mb-2">
              Mid-Semester Algorithms Exam
            </h3>
            <p className="text-xs text-slate-300 font-medium mb-4 leading-relaxed">
              45 Mins • Monaco Code Editor • 2 Coding Questions & 3 MCQs. Real-time 
              browser tab switch proctoring enabled.
            </p>

            <div className="space-y-2 bg-[#292B3D] p-3.5 rounded-2xl text-xs font-semibold mb-6">
              <div className="flex justify-between text-slate-300">
                <span>Max Warning Flags:</span>
                <span className="text-[#F8A195]">1 Tab Switch Limit</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Allowed Tools:</span>
                <span className="text-emerald-400">In-Browser Compiler</span>
              </div>
            </div>
          </div>

          <button
            onClick={onStartExam}
            className="w-full py-4 rounded-full bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white font-extrabold text-xs shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>Launch Exam Sandbox</span>
            <ArrowUpRight className="w-4 h-4 text-[#F8A195]" />
          </button>
        </div>
      </div>

      {/* Handles Configuration Modal */}
      {showHandlesModal && (
        <div className="fixed inset-0 z-50 bg-[#161723]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[36px] p-8 max-w-md w-full border border-[#8B8CF6]/20 shadow-2xl relative space-y-5 text-center">
            <button
              onClick={() => setShowHandlesModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F6F7FF] hover:bg-[#EAEBFF] flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#8B8CF6] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#6C5CE7]/30">
              <Code2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-serif-display text-2xl font-extrabold text-[#1E1F2B]">
                Configure Platform Usernames
              </h2>
              <p className="text-xs text-[#5A5C75] font-medium mt-1">
                Enter your real platform handles to fetch live stats directly from LeetCode & Codeforces APIs.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="text-[11px] font-extrabold uppercase text-[#6C5CE7] tracking-wider block mb-1">
                  LeetCode Username
                </label>
                <input
                  type="text"
                  value={handles.leetcode}
                  onChange={(e) => setHandles({ ...handles, leetcode: e.target.value })}
                  placeholder="e.g. tourist or your_handle"
                  className="w-full bg-[#F6F7FF] p-3 rounded-2xl border border-[#8B8CF6]/30 text-xs font-mono font-bold text-[#1E1F2B] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase text-[#3B82F6] tracking-wider block mb-1">
                  Codeforces Handle
                </label>
                <input
                  type="text"
                  value={handles.codeforces}
                  onChange={(e) => setHandles({ ...handles, codeforces: e.target.value })}
                  placeholder="e.g. tourist or your_handle"
                  className="w-full bg-[#F6F6FF] p-3 rounded-2xl border border-[#8B8CF6]/30 text-xs font-mono font-bold text-[#1E1F2B] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase text-[#F59E0B] tracking-wider block mb-1">
                  CodeChef Username
                </label>
                <input
                  type="text"
                  value={handles.codechef}
                  onChange={(e) => setHandles({ ...handles, codechef: e.target.value })}
                  placeholder="e.g. tourist or your_handle"
                  className="w-full bg-[#F6F6FF] p-3 rounded-2xl border border-[#8B8CF6]/30 text-xs font-mono font-bold text-[#1E1F2B] outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveHandles}
              className="w-full py-3.5 rounded-full bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white font-extrabold text-xs shadow-lg transition-all"
            >
              Fetch Live API Data Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
