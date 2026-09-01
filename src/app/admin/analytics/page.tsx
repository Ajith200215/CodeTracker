"use client";

import { useEffect, useState } from "react";
import { BarChart3, Activity, Users, ShieldCheck, Zap, Award, RefreshCw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";

const MOCK_BRANCH_DATA = [
  { branch: "CSE", totalSolved: 14200, avgRating: 1540 },
  { branch: "ECE", totalSolved: 8900, avgRating: 1410 },
  { branch: "EEE", totalSolved: 4500, avgRating: 1320 },
  { branch: "MECH", totalSolved: 2800, avgRating: 1250 },
];

const MOCK_WEEKLY_TREND = [
  { week: "Week 1", submissions: 340, solved: 290 },
  { week: "Week 2", submissions: 480, solved: 410 },
  { week: "Week 3", submissions: 620, solved: 550 },
  { week: "Week 4", submissions: 890, solved: 780 },
];

export default function AdminAnalyticsPage() {
  const [refreshing, setRefreshing] = useState(false);

  async function handleTriggerRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <BarChart3 className="w-5 h-5" /> College CP Analytics & Sync Health
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Admin Analytics Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Branch performance, multi-platform solve rates, weekly activity trends, and sync status.
          </p>
        </div>

        <button
          onClick={handleTriggerRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-lg shadow-indigo-600/20"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing Scores..." : "Trigger Global Score Sync"}
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Total Enrolled Coders</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">1,248</div>
          <span className="text-xs text-emerald-400 mt-1 inline-block">+14% passout 2026 growth</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Total Problems Solved</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">30,400</div>
          <span className="text-xs text-slate-400 mt-1 inline-block">Across all 7 platforms</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Highest Codeforces Rating</span>
            <Award className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-sky-400 font-mono">1,942</div>
          <span className="text-xs text-slate-400 mt-1 inline-block">Candidate Master badge</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase mb-2">
            <span>Sync Engine Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono">100% Operational</div>
          <span className="text-xs text-slate-400 mt-1 inline-block">Cron sync active (6h cycle)</span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branch-wise Solved Bar Chart */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-base font-bold text-white mb-4">Branch Solved Volume</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_BRANCH_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="branch" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
                <Bar dataKey="totalSolved" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Solve Activity Line Chart */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-base font-bold text-white mb-4">Weekly Solve Rate Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_WEEKLY_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
                <Line type="monotone" dataKey="solved" stroke="#10b981" strokeWidth={3} />
                <Line type="monotone" dataKey="submissions" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
