"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Send, CheckCircle2, XCircle, Code2, Terminal, ArrowLeft } from "lucide-react";
import Link from "next/link";

const STARTER_CODES: Record<string, string> = {
  cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    int a, b;\n    if (cin >> a >> b) {\n        cout << (a + b) << endl;\n    }\n    return 0;\n}`,
  python: `def solve():\n    # Write your solution here\n    try:\n        line = input()\n        a, b = map(int, line.split())\n        print(a + b)\n    except:\n        pass\n\nsolve()`,
  javascript: `const fs = require('fs');\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split(/\\s+/);\nif (input.length >= 2) {\n    console.log(parseInt(input[0]) + parseInt(input[1]));\n}`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            System.out.println(a + b);\n        }\n    }\n}`,
  sql: `SELECT * FROM users WHERE active = 1 ORDER BY created_at DESC;`,
};

export default function CodingArenaPage({ params }: { params: { slug: string } }) {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(STARTER_CODES["python"]);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);

  const sampleCases = [
    { input: "2 3", expectedOutput: "5", hidden: false },
    { input: "10 20", expectedOutput: "30", hidden: false },
    { input: "100 500", expectedOutput: "600", hidden: true },
  ];

  function handleLanguageChange(newLang: string) {
    setLanguage(newLang);
    setCode(STARTER_CODES[newLang] || "// Write code here");
  }

  async function handleRunCode() {
    setRunning(true);
    setTestResults(null);
    setVerdict(null);

    try {
      const res = await fetch("/api/practice/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          sourceCode: code,
          testCases: sampleCases,
        }),
      });
      const data = await res.json();
      if (data.results) {
        setTestResults(data.results);
      }
    } catch (e) {
      console.error("Run error:", e);
    } finally {
      setRunning(false);
    }
  }

  async function handleSubmitCode() {
    setSubmitting(true);
    setVerdict(null);

    try {
      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: params.slug,
          language,
          code,
        }),
      });
      const data = await res.json();
      if (data.verdict) {
        setVerdict(data.verdict);
      }
    } catch (e) {
      console.error("Submit error:", e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/80 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/practice/problems" className="text-slate-400 hover:text-white p-1 rounded transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <span className="capitalize">{params.slug.replace(/-/g, " ")}</span>
          </div>
          <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-medium">
            EASY
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="python">Python 3</option>
            <option value="cpp">C++ (GCC 9.2)</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="java">Java 13</option>
            <option value="sql">SQL (SQLite)</option>
          </select>

          <button
            onClick={handleRunCode}
            disabled={running || submitting}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            {running ? "Running..." : "Run Code"}
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={running || submitting}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/20"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Evaluating..." : "Submit Code"}
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left Column: Problem Description & Test Console */}
        <div className="border-r border-slate-800 flex flex-col h-full bg-slate-950/60 overflow-y-auto p-6">
          <h2 className="text-xl font-bold text-white mb-3">Problem Description</h2>
          <div className="prose prose-invert prose-slate text-sm leading-relaxed space-y-4 mb-8">
            <p>
              Given two integers <code>a</code> and <code>b</code> from standard input, calculate their sum and output the result to standard output.
            </p>
            <h4 className="font-bold text-slate-200">Input Format</h4>
            <p>A single line containing two space-separated integers.</p>
            <h4 className="font-bold text-slate-200">Output Format</h4>
            <p>Print the single integer sum of the inputs.</p>
            <h4 className="font-bold text-slate-200">Sample Case</h4>
            <pre className="bg-slate-900 border border-slate-800 p-3 rounded text-xs font-mono">
Input: 2 3
Output: 5
            </pre>
          </div>

          {/* Test Case Execution Output Console */}
          <div className="mt-auto border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-400" /> Output Console
              </span>
              {verdict && (
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    verdict === "ACCEPTED" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-rose-950 text-rose-400 border border-rose-800"
                  }`}
                >
                  Verdict: {verdict}
                </span>
              )}
            </div>

            {testResults ? (
              <div className="space-y-3">
                {testResults.map((tr, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs font-mono">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-300 font-bold">Testcase {idx + 1}</span>
                      <span className={`flex items-center gap-1 font-bold ${tr.passed ? "text-emerald-400" : "text-rose-400"}`}>
                        {tr.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {tr.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px] pt-1 border-t border-slate-850">
                      <div>Input: <span className="text-slate-200">{tr.input}</span></div>
                      <div>Output: <span className="text-slate-200">{tr.actualOutput}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-xs py-6 text-center border border-dashed border-slate-850 rounded-lg">
                Click "Run Code" to evaluate against visible test cases.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Monaco Code Editor */}
        <div className="h-full bg-[#1e1e1e]">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language === "cpp" ? "cpp" : language === "python" ? "python" : language === "java" ? "java" : language === "sql" ? "sql" : "javascript"}
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
            }}
          />
        </div>
      </div>
    </div>
  );
}
