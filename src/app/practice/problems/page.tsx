"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Code2, Search, CheckCircle, Flame, Filter, ChevronRight } from "lucide-react";

interface ProblemItem {
  id: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string[];
  solved?: boolean;
}

const MOCK_PROBLEMS: ProblemItem[] = [
  {
    id: "p1",
    title: "Two Sum Target Index",
    slug: "two-sum",
    difficulty: "EASY",
    tags: ["Arrays", "Hash Table"],
  },
  {
    id: "p2",
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    difficulty: "MEDIUM",
    tags: ["Sliding Window", "String"],
  },
  {
    id: "p3",
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    difficulty: "HARD",
    tags: ["Two Pointers", "Dynamic Programming", "Stack"],
  },
  {
    id: "p4",
    title: "Binary Tree Level Order Traversal",
    slug: "binary-tree-level-order-traversal",
    difficulty: "MEDIUM",
    tags: ["Trees", "BFS"],
  },
  {
    id: "p5",
    title: "Reverse Linked List",
    slug: "reverse-linked-list",
    difficulty: "EASY",
    tags: ["Linked List"],
  },
];

export default function PracticeProblemsPage() {
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("ALL");

  useEffect(() => {
    setProblems(MOCK_PROBLEMS);
  }, []);

  const filtered = problems.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchDiff = diffFilter === "ALL" || p.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  const getBadgeColor = (diff: string) => {
    if (diff === "EASY") return "bg-emerald-950 text-emerald-400 border-emerald-800";
    if (diff === "MEDIUM") return "bg-amber-950 text-amber-400 border-amber-800";
    return "bg-rose-950 text-rose-400 border-rose-800";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 text-indigo-400 font-semibold mb-2">
          <Code2 className="w-6 h-6" /> CodeTracker Practice Sandbox
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Competitive Programming Problem Bank
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          HackerRank & LeetCode curated problems. Solve using C++, Python, Java, JavaScript, or SQL with Judge0 CE execution.
        </p>
      </div>

      {/* Toolbar */}
      <div className="max-w-6xl mx-auto mb-8 bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search problems by name or tag (e.g. Arrays, Trees)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Filter className="w-4 h-4" /> Difficulty:
          </div>
          <select
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Problem List */}
      <div className="max-w-6xl mx-auto bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="divide-y divide-slate-800">
          {filtered.map((prob) => (
            <div
              key={prob.id}
              className="p-4 md:p-5 flex items-center justify-between hover:bg-slate-850/60 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/50 transition">
                  <Flame className="w-4 h-4" />
                </div>

                <div>
                  <Link
                    href={`/practice/problems/${prob.slug}`}
                    className="font-bold text-slate-100 hover:text-indigo-400 text-base transition flex items-center gap-2"
                  >
                    {prob.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5">
                    {prob.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-850 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getBadgeColor(prob.difficulty)}`}>
                  {prob.difficulty}
                </span>

                <Link
                  href={`/practice/problems/${prob.slug}`}
                  className="bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                >
                  Solve <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
