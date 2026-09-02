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
  Zap, 
  ShieldCheck, 
  Edit3, 
  X, 
  ArrowUpRight,
  Globe,
  Terminal,
  Layers,
  Sparkles
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
  const [inspectPlatform, setInspectPlatform] = useState<string | null>(null);

  // All 7 platform usernames state
  const [handles, setHandles] = useState({
    leetcode: "",
    codeforces: "",
    codechef: "",
    geeksforgeeks: "",
    hackerrank: "",
    atcoder: "",
    neetcode: "",
  });

  const studentName = session?.user?.name || "Student Coder";
  const studentRegNo = (session?.user as any)?.regNo || "2026-CS-0142";

  // All 7 dynamic live platform stats state
  const [stats, setStats] = useState({
    leetcode: { username: "", solved: 0, easy: 0, medium: 0, hard: 0, rating: 0 },
    codeforces: { username: "", solved: 0, rating: 0, maxRating: 0 },
    codechef: { username: "", solved: 0, rating: 0, stars: "0★" },
    geeksforgeeks: { username: "", solved: 0, rating: 0 },
    hackerrank: { username: "", solved: 0, rating: 0, rank: "Unlinked" },
    atcoder: { username: "", solved: 0, rating: 0 },
    neetcode: { username: "", solved: 0 },
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
    { week: "Wk 6 (Live)", solved: stats.totalSolved },
  ];

  const fetchLivePlatformStats = async (customHandles?: typeof handles) => {
    setIsSyncing(true);
    setSyncStatus("Connecting to live platform APIs across 7 platforms...");

    try {
      let response;
      if (customHandles) {
        response = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customHandles),
        });
      } else {
        response = await fetch("/api/sync");
      }

      const data = await response.json();
      if (data.success && data.stats) {
        const s = data.stats;

        setStats({
          leetcode: {
            username: s.leetcode?.username || "",
            solved: s.leetcode?.solved || 0,
            easy: s.leetcode?.easy || 0,
            medium: s.leetcode?.medium || 0,
            hard: s.leetcode?.hard || 0,
            rating: s.leetcode?.rating || 0,
          },
          codeforces: {
            username: s.codeforces?.username || "",
            solved: s.codeforces?.solved || 0,
            rating: s.codeforces?.rating || 0,
            maxRating: s.codeforces?.maxRating || 0,
          },
          codechef: {
            username: s.codechef?.username || "",
            solved: s.codechef?.solved || 0,
            rating: s.codechef?.rating || 0,
            stars: s.codechef?.stars || "0★",
          },
          geeksforgeeks: {
            username: s.geeksforgeeks?.username || "",
            solved: s.geeksforgeeks?.solved || 0,
            rating: s.geeksforgeeks?.rating || 0,
          },
          hackerrank: {
            username: s.hackerrank?.username || "",
            solved: s.hackerrank?.solved || 0,
            rating: s.hackerrank?.rating || 0,
            rank: s.hackerrank?.rank || "Unlinked",
          },
          atcoder: {
            username: s.atcoder?.username || "",
            solved: s.atcoder?.solved || 0,
            rating: s.atcoder?.rating || 0,
          },
          neetcode: {
            username: s.neetcode?.username || "",
            solved: s.neetcode?.solved || 0,
          },
          totalSolved: s.totalSolved || 0,
          codeScore: s.codeScore || 0,
          lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        setHandles({
          leetcode: s.leetcode?.username || "",
          codeforces: s.codeforces?.username || "",
          codechef: s.codechef?.username || "",
          geeksforgeeks: s.geeksforgeeks?.username || "",
          hackerrank: s.hackerrank?.username || "",
          atcoder: s.atcoder?.username || "",
          neetcode: s.neetcode?.username || "",
        });

        setSyncStatus(`Live stats synced! Total Solved: ${s.totalSolved} across active platforms.`);
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
            College Competitive Programming Dashboard (7 Platforms Integrated)
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => setShowHandlesModal(true)}
            className="px-5 py-3 rounded-full bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-[#F8A195]" />
            <span>Configure 7 Usernames</span>
          </button>

          <button
            onClick={() => fetchLivePlatformStats()}
            disabled={isSyncing}
            className="px-6 py-3 rounded-full bg-white text-[#1E1F2B] hover:bg-[#F0F2FF] font-extrabold text-xs shadow-md transition-all flex items-center gap-2 hover:scale-105"
          >
            <RefreshCw className={`w-4 h-4 text-[#6C5CE7] ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Refresh All Live Stats"}</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="bg-[#4ADE80]/15 border border-[#4ADE80]/40 p-4 rounded-2xl text-xs font-bold text-[#1E1F2B] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* CodeScore Summary Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#8B8CF6]/20 shadow-lg shadow-[#8B8CF6]/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#6A6C88] uppercase tracking-wider">Overall Unified CodeScore</div>
            <div className="text-3xl font-black text-[#1E1F2B] font-serif-display">{stats.codeScore}</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
          <div>Total Solved: <strong className="text-slate-900 text-sm font-mono">{stats.totalSolved}</strong></div>
          <div>Last Synced: <strong className="text-slate-900">{stats.lastSynced}</strong></div>
        </div>
      </div>

      {/* Grid of All Connected Platforms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {!stats.leetcode.username && !stats.codeforces.username && !stats.codechef.username && !stats.geeksforgeeks.username && !stats.hackerrank.username && !stats.atcoder.username && !stats.neetcode.username && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-[#8B8CF6]/30 rounded-3xl">
            <h3 className="text-lg font-bold text-[#1E1F2B] mb-2">No platforms connected</h3>
            <p className="text-sm text-slate-500 mb-4">Connect your competitive programming accounts to see your stats here.</p>
            <button onClick={() => setShowHandlesModal(true)} className="px-5 py-2 bg-[#F0F2FF] text-[#6C5CE7] font-bold rounded-full text-xs">Configure Usernames</button>
          </div>
        )}

        {/* 1. LeetCode */}
        {stats.leetcode.username && (
        <div className="bg-white rounded-3xl p-5 border border-[#8B8CF6]/20 shadow-lg shadow-[#8B8CF6]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-amber-500 text-xs">
              <Code2 className="w-4 h-4" /> LEETCODE
            </div>
            <span className="text-[10px] font-mono text-slate-500">@{stats.leetcode.username}</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-[#1E1F2B]">
              {stats.leetcode.solved} Solved
            </div>
            <div className="flex gap-1 text-[10px] font-bold mt-1">
              <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{stats.leetcode.easy} Easy</span>
              <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{stats.leetcode.medium} Med</span>
              <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{stats.leetcode.hard} Hard</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Rating: {stats.leetcode.rating}</span>
            <button onClick={() => setInspectPlatform('leetcode')} className="text-[#6C5CE7] hover:underline flex items-center gap-1">Inspect <ArrowUpRight className="w-3 h-3" /></button>
          </div>
        </div>
        )}

        {/* 2. Codeforces */}
        {stats.codeforces.username && (
        <div className="bg-white rounded-3xl p-5 border border-[#8B8CF6]/20 shadow-lg shadow-[#8B8CF6]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-sky-500 text-xs">
              <TrendingUp className="w-4 h-4" /> CODEFORCES
            </div>
            <span className="text-[10px] font-mono text-slate-500">@{stats.codeforces.username}</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-[#1E1F2B]">
              {stats.codeforces.rating} Rating
            </div>
            <div className="text-xs font-semibold text-sky-600 mt-1">
              {stats.codeforces.solved} Solved
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Max: {stats.codeforces.maxRating}</span>
            <button onClick={() => setInspectPlatform('codeforces')} className="text-[#6C5CE7] hover:underline flex items-center gap-1">Inspect <ArrowUpRight className="w-3 h-3" /></button>
          </div>
        </div>
        )}

        {/* 3. CodeChef */}
        {stats.codechef.username && (
        <div className="bg-white rounded-3xl p-5 border border-[#8B8CF6]/20 shadow-lg shadow-[#8B8CF6]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-amber-600 text-xs">
              <Award className="w-4 h-4" /> CODECHEF
            </div>
            <span className="text-[10px] font-mono text-slate-500">@{stats.codechef.username}</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-[#1E1F2B]">
              {stats.codechef.rating} {stats.codechef.stars}
            </div>
            <div className="text-xs font-semibold text-amber-600 mt-1">
              {stats.codechef.solved} Solved
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>API Verified</span>
            <button onClick={() => setInspectPlatform('codechef')} className="text-[#6C5CE7] hover:underline flex items-center gap-1">Inspect <ArrowUpRight className="w-3 h-3" /></button>
          </div>
        </div>
        )}

        {/* 4. GeeksForGeeks */}
        {stats.geeksforgeeks.username && (
        <div className="bg-white rounded-3xl p-5 border border-[#8B8CF6]/20 shadow-lg shadow-[#8B8CF6]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 text-xs">
              <Globe className="w-4 h-4" /> GEEKSFORGEEKS
            </div>
            <span className="text-[10px] font-mono text-slate-500">@{stats.geeksforgeeks.username}</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-[#1E1F2B]">
              {stats.geeksforgeeks.solved} Solved
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Score: {stats.geeksforgeeks.rating}</span>
            <button onClick={() => setInspectPlatform('geeksforgeeks')} className="text-[#6C5CE7] hover:underline flex items-center gap-1">Inspect <ArrowUpRight className="w-3 h-3" /></button>
          </div>
        </div>
        )}

        {/* 5. HackerRank */}
        {stats.hackerrank.username && (
        <div className="bg-white rounded-3xl p-5 border border-[#8B8CF6]/20 shadow-lg shadow-[#8B8CF6]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-emerald-500 text-xs">
              <Terminal className="w-4 h-4" /> HACKERRANK
            </div>
            <span className="text-[10px] font-mono text-slate-500">@{stats.hackerrank.username}</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-[#1E1F2B]">
              {stats.hackerrank.solved} Solved
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>{stats.hackerrank.rank}</span>
            <button onClick={() => setInspectPlatform('hackerrank')} className="text-[#6C5CE7] hover:underline flex items-center gap-1">Inspect <ArrowUpRight className="w-3 h-3" /></button>
          </div>
        </div>
        )}

        {/* 6. AtCoder */}
        {stats.atcoder.username && (
        <div className="bg-white rounded-3xl p-5 border border-[#8B8CF6]/20 shadow-lg shadow-[#8B8CF6]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs">
              <Layers className="w-4 h-4" /> ATCODER
            </div>
            <span className="text-[10px] font-mono text-slate-500">@{stats.atcoder.username}</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-[#1E1F2B]">
              {stats.atcoder.solved} Solved
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Rating: {stats.atcoder.rating}</span>
            <button onClick={() => setInspectPlatform('atcoder')} className="text-[#6C5CE7] hover:underline flex items-center gap-1">Inspect <ArrowUpRight className="w-3 h-3" /></button>
          </div>
        </div>
        )}

        {/* 7. NeetCode */}
        {stats.neetcode.username && (
        <div className="bg-white rounded-3xl p-5 border border-[#8B8CF6]/20 shadow-lg shadow-[#8B8CF6]/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-purple-600 text-xs">
              <Sparkles className="w-4 h-4" /> NEETCODE
            </div>
            <span className="text-[10px] font-mono text-slate-500">@{stats.neetcode.username}</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-black text-[#1E1F2B]">
              Saved Handle
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>@{stats.neetcode.username}</span>
            <button onClick={() => setInspectPlatform('neetcode')} className="text-[#6C5CE7] hover:underline flex items-center gap-1">Inspect <ArrowUpRight className="w-3 h-3" /></button>
          </div>
        </div>
        )}
      </div>

      {/* Main Content: Solve Progress Chart */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#8B8CF6]/20 shadow-xl shadow-[#8B8CF6]/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif-display text-2xl font-bold text-[#1E1F2B]">
              Solve Progress Over Time
            </h3>
            <p className="text-xs text-[#6A6C88] font-medium">
              Combined platform solved trend
            </p>
          </div>
          <span className="text-xs font-extrabold text-[#6C5CE7] bg-[#F0F2FF] px-3.5 py-1.5 rounded-full">
            7 Platforms Active
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

      {/* Handles Configuration Modal for All 7 Platforms */}
      {showHandlesModal && (
        <div className="fixed inset-0 z-50 bg-[#161723]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[36px] p-6 sm:p-8 max-w-lg w-full border border-[#8B8CF6]/20 shadow-2xl relative space-y-4 text-center max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowHandlesModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F6F7FF] hover:bg-[#EAEBFF] flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#8B8CF6] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#6C5CE7]/30">
              <Code2 className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-serif-display text-2xl font-extrabold text-[#1E1F2B]">
                Configure 7 Platform Usernames
              </h2>
              <p className="text-xs text-[#5A5C75] font-medium mt-1">
                Enter your real handles for all 7 platforms. Leave blank to set unlinked.
              </p>
            </div>

            <div className="space-y-2.5 text-left">
              <div>
                <label className="text-[11px] font-extrabold uppercase text-[#6C5CE7] tracking-wider block mb-1">
                  LeetCode Username
                </label>
                <input
                  type="text"
                  value={handles.leetcode}
                  onChange={(e) => setHandles({ ...handles, leetcode: e.target.value })}
                  placeholder="LeetCode username"
                  className="w-full bg-[#F6F7FF] p-2.5 rounded-xl border border-[#8B8CF6]/30 text-xs font-mono font-bold text-[#1E1F2B] outline-none"
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
                  placeholder="Codeforces handle"
                  className="w-full bg-[#F6F7FF] p-2.5 rounded-xl border border-[#8B8CF6]/30 text-xs font-mono font-bold text-[#1E1F2B] outline-none"
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
                  placeholder="CodeChef username"
                  className="w-full bg-[#F6F7FF] p-2.5 rounded-xl border border-[#8B8CF6]/30 text-xs font-mono font-bold text-[#1E1F2B] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase text-[#16A34A] tracking-wider block mb-1">
                  GeeksForGeeks Username
                </label>
                <input
                  type="text"
                  value={handles.geeksforgeeks}
                  onChange={(e) => setHandles({ ...handles, geeksforgeeks: e.target.value })}
                  placeholder="GeeksForGeeks username"
                  className="w-full bg-[#F6F7FF] p-2.5 rounded-xl border border-[#8B8CF6]/30 text-xs font-mono font-bold text-[#1E1F2B] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase text-emerald-600 tracking-wider block mb-1">
                  HackerRank Username
                </label>
                <input
                  type="text"
                  value={handles.hackerrank}
                  onChange={(e) => setHandles({ ...handles, hackerrank: e.target.value })}
                  placeholder="HackerRank username"
                  className="w-full bg-[#F6F7FF] p-2.5 rounded-xl border border-[#8B8CF6]/30 text-xs font-mono font-bold text-[#1E1F2B] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase text-slate-700 tracking-wider block mb-1">
                  AtCoder Username
                </label>
                <input
                  type="text"
                  value={handles.atcoder}
                  onChange={(e) => setHandles({ ...handles, atcoder: e.target.value })}
                  placeholder="AtCoder username"
                  className="w-full bg-[#F6F7FF] p-2.5 rounded-xl border border-[#8B8CF6]/30 text-xs font-mono font-bold text-[#1E1F2B] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase text-purple-600 tracking-wider block mb-1">
                  NeetCode Username
                </label>
                <input
                  type="text"
                  value={handles.neetcode}
                  onChange={(e) => setHandles({ ...handles, neetcode: e.target.value })}
                  placeholder="NeetCode username"
                  className="w-full bg-[#F6F7FF] p-2.5 rounded-xl border border-[#8B8CF6]/30 text-xs font-mono font-bold text-[#1E1F2B] outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveHandles}
              className="w-full py-3.5 rounded-full bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white font-extrabold text-xs shadow-lg transition-all mt-2"
            >
              Save 7 Handles & Fetch Live Stats
            </button>
          </div>
        </div>
      )}
      {/* Inspect Platform Modal */}
      {inspectPlatform && (
        <div className="fixed inset-0 z-[60] bg-[#161723]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[36px] p-6 sm:p-8 max-w-sm w-full border border-[#8B8CF6]/20 shadow-2xl relative">
            <button
              onClick={() => setInspectPlatform(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F6F7FF] hover:bg-[#EAEBFF] flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-serif-display text-2xl font-extrabold text-[#1E1F2B] capitalize mb-4">
              {inspectPlatform} Details
            </h2>
            <div className="space-y-3">
              {inspectPlatform === 'leetcode' && (
                <>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Username</span>
                    <span className="font-mono text-gray-900">{stats.leetcode.username}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Total Solved</span>
                    <span className="font-black text-gray-900">{stats.leetcode.solved}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-emerald-50 rounded-xl">
                    <span className="font-bold text-emerald-700">Easy Solved</span>
                    <span className="font-black text-emerald-900">{stats.leetcode.easy}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-amber-50 rounded-xl">
                    <span className="font-bold text-amber-700">Medium Solved</span>
                    <span className="font-black text-amber-900">{stats.leetcode.medium}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-rose-50 rounded-xl">
                    <span className="font-bold text-rose-700">Hard Solved</span>
                    <span className="font-black text-rose-900">{stats.leetcode.hard}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Rating</span>
                    <span className="font-black text-gray-900">{stats.leetcode.rating}</span>
                  </div>
                </>
              )}
              {inspectPlatform === 'codeforces' && (
                <>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Handle</span>
                    <span className="font-mono text-gray-900">{stats.codeforces.username}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Total Solved</span>
                    <span className="font-black text-gray-900">{stats.codeforces.solved}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-sky-50 rounded-xl">
                    <span className="font-bold text-sky-700">Current Rating</span>
                    <span className="font-black text-sky-900">{stats.codeforces.rating}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-sky-50 rounded-xl">
                    <span className="font-bold text-sky-700">Max Rating</span>
                    <span className="font-black text-sky-900">{stats.codeforces.maxRating}</span>
                  </div>
                </>
              )}
              {inspectPlatform === 'codechef' && (
                <>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Username</span>
                    <span className="font-mono text-gray-900">{stats.codechef.username}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Total Solved</span>
                    <span className="font-black text-gray-900">{stats.codechef.solved}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-amber-50 rounded-xl">
                    <span className="font-bold text-amber-700">Current Rating</span>
                    <span className="font-black text-amber-900">{stats.codechef.rating}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-amber-50 rounded-xl">
                    <span className="font-bold text-amber-700">Stars</span>
                    <span className="font-black text-amber-900">{stats.codechef.stars}</span>
                  </div>
                </>
              )}
              {inspectPlatform === 'hackerrank' && (
                <>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Username</span>
                    <span className="font-mono text-gray-900">{stats.hackerrank.username}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Total Solved</span>
                    <span className="font-black text-gray-900">{stats.hackerrank.solved}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-emerald-50 rounded-xl">
                    <span className="font-bold text-emerald-700">Rank</span>
                    <span className="font-black text-emerald-900">{stats.hackerrank.rank}</span>
                  </div>
                </>
              )}
              {inspectPlatform === 'geeksforgeeks' && (
                <>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Username</span>
                    <span className="font-mono text-gray-900">{stats.geeksforgeeks.username}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Total Solved</span>
                    <span className="font-black text-gray-900">{stats.geeksforgeeks.solved}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-emerald-50 rounded-xl">
                    <span className="font-bold text-emerald-700">Coding Score</span>
                    <span className="font-black text-emerald-900">{stats.geeksforgeeks.rating}</span>
                  </div>
                </>
              )}
              {inspectPlatform === 'atcoder' && (
                <>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Username</span>
                    <span className="font-mono text-gray-900">{stats.atcoder.username}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Total Solved</span>
                    <span className="font-black text-gray-900">{stats.atcoder.solved}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-slate-100 rounded-xl">
                    <span className="font-bold text-slate-700">Rating</span>
                    <span className="font-black text-slate-900">{stats.atcoder.rating}</span>
                  </div>
                </>
              )}
              {inspectPlatform === 'neetcode' && (
                <>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Username</span>
                    <span className="font-mono text-gray-900">{stats.neetcode.username}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-gray-600">Total Solved</span>
                    <span className="font-black text-gray-900">{stats.neetcode.solved}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
