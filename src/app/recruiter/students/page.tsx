"use client";

import { useEffect, useState } from "react";
import { Download, Search, Award, Code, CheckCircle, ExternalLink, ShieldCheck, Filter } from "lucide-react";

interface StudentCandidate {
  id: string;
  name: string;
  email: string;
  regNo: string | null;
  branch: string;
  passoutYear: number;
  college: string;
  codeScore: number;
  leetcode: { username: string | null; totalSolved: number; rating: number | null };
  codeforces: { username: string | null; totalSolved: number; rating: number | null };
  codechef: { username: string | null; totalSolved: number; rating: number | null };
  geeksforgeeks: { username: string | null; totalSolved: number; rating: number | null };
  hackerrank: { username: string | null; totalSolved: number; rating: number | null };
  atcoder: { username: string | null; totalSolved: number; rating: number | null };
}

export default function RecruiterStudentsPage() {
  const [students, setStudents] = useState<StudentCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");

  useEffect(() => {
    fetchStudents();
  }, [selectedBranch, selectedYear]);

  async function fetchStudents() {
    setLoading(true);
    try {
      let url = `/api/recruiter/students?`;
      if (selectedBranch !== "ALL") url += `branch=${encodeURIComponent(selectedBranch)}&`;
      if (selectedYear !== "ALL") url += `year=${encodeURIComponent(selectedYear)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
      }
    } catch (e) {
      console.error("Failed to load recruiter students:", e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = students.filter((s) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      (s.regNo && s.regNo.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
              <ShieldCheck className="w-5 h-5" /> Verified Recruiter Portal
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Campus Developer Talent Pool
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Unified competitive programming performance metrics across LeetCode, Codeforces, CodeChef & GFG.
            </p>
          </div>

          <a
            href="/api/recruiter/export-csv"
            download
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" /> Export CSV Candidates
          </a>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="max-w-7xl mx-auto mb-8 bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Filter className="w-4 h-4" /> Filters:
          </div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Passout Years</option>
            <option value="2025">Passout 2025</option>
            <option value="2026">Passout 2026</option>
            <option value="2027">Passout 2027</option>
          </select>
        </div>
      </div>

      {/* Candidate Roster Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading verified student candidates...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-xl border border-slate-800">
            <Award className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-300">No candidates match search filters</h3>
            <p className="text-slate-500 text-sm mt-1">Try resetting the branch or passout year filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((st, idx) => (
              <div
                key={st.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 transition-all shadow-md hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100 text-base">{st.name}</h3>
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                          Rank #{idx + 1}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {st.regNo || st.email}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                        CodeScore
                      </div>
                      <div className="text-xl font-extrabold text-white font-mono">
                        {st.codeScore}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-0.5 rounded-full font-medium">
                      {st.branch}
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-medium">
                      Class of {st.passoutYear}
                    </span>
                  </div>

                  {/* Multi-Platform Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-850 mb-4 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-medium text-amber-400">LeetCode</span>
                      <span className="font-mono font-bold">{st.leetcode.totalSolved} solved</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-medium text-sky-400">Codeforces</span>
                      <span className="font-mono font-bold">
                        {st.codeforces.rating ? `${st.codeforces.rating} rating` : `${st.codeforces.totalSolved} solved`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-medium text-amber-600">CodeChef</span>
                      <span className="font-mono font-bold">
                        {st.codechef.rating ? `${st.codechef.rating} rating` : `${st.codechef.totalSolved} solved`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-medium text-emerald-400">GFG</span>
                      <span className="font-mono font-bold">{st.geeksforgeeks.totalSolved} solved</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Verified CP Handles
                  </span>
                  <a
                    href={`/api/students/${st.id}/placement-card`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    View Card <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
