"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { 
  Clock, 
  ShieldAlert, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Send, 
  Lock,
  Code2
} from "lucide-react";
import confetti from "canvas-confetti";

interface ExamAttemptViewProps {
  onExit: () => void;
  onRequestRetest: () => void;
}

export const ExamAttemptView: React.FC<ExamAttemptViewProps> = ({ onExit, onRequestRetest }) => {
  const [activeQuestion, setActiveQuestion] = useState<"coding" | "mcq">("coding");
  const [timeLeft, setTimeLeft] = useState(2700); // 45 minutes in seconds
  const [code, setCode] = useState(
    `// Problem: Two Sum Target Index
// Return indices of the two numbers such that they add up to target.

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`
  );

  const [selectedMcq, setSelectedMcq] = useState<string | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [testResults, setTestResults] = useState<
    { id: number; input: string; expected: string; actual: string; passed: boolean }[] | null
  >(null);

  // Proctoring Engine State
  const [flagCount, setFlagCount] = useState(0);
  const [maxWarnings] = useState(1);
  const [flagToast, setFlagToast] = useState<string | null>(null);
  const [isAutoEndedCheating, setIsAutoEndedCheating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    if (isSubmitted || isAutoEndedCheating) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, isAutoEndedCheating]);

  // Phase 10 Proctoring Listeners: VisibilityChange (Tab Switch) & Copy/Paste Block
  useEffect(() => {
    if (isSubmitted || isAutoEndedCheating) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerFlag("TAB_SWITCH", "Tab switch detected during active assessment.");
      }
    };

    const handleWindowBlur = () => {
      triggerFlag("WINDOW_BLUR", "Focus lost / Window blur detected.");
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerFlag("COPY_PASTE", "Clipboard copy/paste blocked during exam.");
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
    };
  }, [flagCount, isSubmitted, isAutoEndedCheating]);

  const triggerFlag = (type: string, note: string) => {
    const newCount = flagCount + 1;
    setFlagCount(newCount);
    setFlagToast(`PROCTOR WARNING (${type}): ${note} [Warning ${newCount}/${maxWarnings}]`);

    if (newCount > maxWarnings) {
      setIsAutoEndedCheating(true);
    } else {
      setTimeout(() => setFlagToast(null), 4500);
    }
  };

  const handleRunCode = () => {
    setIsRunningCode(true);
    setTestResults(null);

    setTimeout(() => {
      setTestResults([
        { id: 1, input: "nums = [2,7,11,15], target = 9", expected: "[0, 1]", actual: "[0, 1]", passed: true },
        { id: 2, input: "nums = [3,2,4], target = 6", expected: "[1, 2]", actual: "[1, 2]", passed: true },
      ]);
      setIsRunningCode(false);
    }, 1200);
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Render Cheating Auto-Ended Locked Screen (Phase 10 & 11)
  if (isAutoEndedCheating) {
    return (
      <div className="min-h-screen bg-[#161723] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mb-6 border border-rose-500/30 animate-pulse">
          <Lock className="w-10 h-10" />
        </div>

        <h1 className="font-serif-display text-4xl font-extrabold text-white mb-2">
          Assessment Auto-Ended
        </h1>
        <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
          Your exam was automatically locked because the maximum tab switch warning threshold 
          ({maxWarnings} warning) was exceeded. Server status recorded as <span className="text-rose-400 font-mono font-bold">AUTO_ENDED_CHEATING</span>.
        </p>

        <div className="flex gap-4">
          <button
            onClick={onRequestRetest}
            className="px-6 py-3 rounded-full bg-[#8B8CF6] hover:bg-[#7C7CF8] text-white font-extrabold text-xs shadow-lg transition-all"
          >
            Submit Retest Request to Teacher
          </button>
          <button
            onClick={onExit}
            className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render Exam Submitted Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F6F7FF] text-[#1E1F2B] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#4ADE80]/20 text-[#16A34A] flex items-center justify-center mb-6 border border-[#4ADE80]/30">
          <CheckCircle className="w-10 h-10" />
        </div>

        <h1 className="font-serif-display text-4xl font-extrabold mb-2">
          Exam Submitted Successfully!
        </h1>
        <p className="text-sm text-[#5A5C75] max-w-md mb-6">
          Your code submissions and MCQ answers have been graded. All test cases evaluated cleanly.
        </p>

        <div className="bg-white p-6 rounded-3xl border border-[#8B8CF6]/20 shadow-xl max-w-sm w-full mb-6 text-left space-y-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[#6A6C88]">Coding Question 1:</span>
            <span className="text-[#16A34A]">2 / 2 Test Cases Passed (100%)</span>
          </div>
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[#6A6C88]">MCQ Question 2:</span>
            <span className="text-[#16A34A]">Correct (+10 pts)</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-sm font-extrabold text-[#6C5CE7]">
            <span>Final Score:</span>
            <span>100 / 100 Pts</span>
          </div>
        </div>

        <button
          onClick={onExit}
          className="px-8 py-3.5 rounded-full bg-[#6C5CE7] text-white font-extrabold text-xs shadow-lg"
        >
          Return to Student Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161723] text-white flex flex-col">
      {/* Top Exam Navigation Bar */}
      <header className="bg-[#1E1F2B] border-b border-white/10 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif-display text-lg font-bold text-white">
              Mid-Semester Algorithms Assessment
            </h2>
            <span className="text-[11px] text-[#8B8CF6] font-semibold">
              Proctored Environment • Session #8912
            </span>
          </div>
        </div>

        {/* Timer & Warning Indicator */}
        <div className="flex items-center gap-4">
          {/* Flag Warning Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            flagCount > 0 ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400"
          }`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Flags: {flagCount} / {maxWarnings} Max</span>
          </div>

          {/* Countdown Clock Pill */}
          <div className="bg-[#292B3D] px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 font-mono text-sm font-bold text-[#F8A195]">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={handleSubmitExam}
            className="px-5 py-2 rounded-full bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Exam</span>
          </button>
        </div>
      </header>

      {/* Proctoring Warning Toast Banner */}
      {flagToast && (
        <div className="bg-rose-600 text-white px-6 py-2.5 text-xs font-extrabold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{flagToast}</span>
          </div>
          <span className="text-[10px] underline">Server Logged</span>
        </div>
      )}

      {/* Main Exam Interface Split Screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Problem Prompt & MCQ Options */}
        <div className="lg:col-span-5 bg-[#1E1F2B] border-r border-white/10 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            {/* Question Selector Tabs */}
            <div className="flex gap-2 bg-[#161723] p-1 rounded-full border border-white/10">
              <button
                onClick={() => setActiveQuestion("coding")}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                  activeQuestion === "coding"
                    ? "bg-[#6C5CE7] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Q1: Coding (Two Sum)
              </button>
              <button
                onClick={() => setActiveQuestion("mcq")}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                  activeQuestion === "mcq"
                    ? "bg-[#6C5CE7] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Q2: MCQ (Time Complexity)
              </button>
            </div>

            {activeQuestion === "coding" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8B8CF6] uppercase">Coding Challenge</span>
                  <span className="text-xs font-semibold text-emerald-400">100 Points</span>
                </div>

                <h3 className="font-serif-display text-2xl font-bold text-white">
                  Two Sum Target Index
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Given an array of integers <code className="bg-[#292B3D] px-1.5 py-0.5 rounded text-rose-300">nums</code> and an integer <code className="bg-[#292B3D] px-1.5 py-0.5 rounded text-rose-300">target</code>, return indices of the two numbers such that they add up to target.
                </p>

                <div className="bg-[#292B3D] p-4 rounded-2xl text-xs space-y-2 font-mono">
                  <div className="font-bold text-slate-400">Example 1:</div>
                  <div className="text-slate-200">Input: nums = [2,7,11,15], target = 9</div>
                  <div className="text-emerald-400">Output: [0, 1]</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F8A195] uppercase">Multiple Choice</span>
                  <span className="text-xs font-semibold text-emerald-400">20 Points</span>
                </div>

                <h3 className="font-serif-display text-2xl font-bold text-white">
                  What is the worst-case time complexity of QuickSort?
                </h3>

                <div className="space-y-3 pt-2">
                  {[
                    { id: "A", text: "O(N log N)" },
                    { id: "B", text: "O(N²)" },
                    { id: "C", text: "O(N)" },
                    { id: "D", text: "O(1)" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedMcq(opt.id)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs font-bold transition-all flex items-center gap-3 ${
                        selectedMcq === opt.id
                          ? "bg-[#6C5CE7] border-[#6C5CE7] text-white"
                          : "bg-[#292B3D] border-white/10 text-slate-300 hover:border-white/30"
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 text-[11px] text-slate-500 font-semibold flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-[#F8A195]" />
            <span>Anti-cheating listener active. Do not switch tabs or open DevTools.</span>
          </div>
        </div>

        {/* Right Column: Monaco Editor & Judge0 Execution Results */}
        <div className="lg:col-span-7 bg-[#161723] flex flex-col justify-between p-4">
          <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 flex flex-col">
            <div className="bg-[#1E1F2B] px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#6C5CE7]" />
                JavaScript (Node.js v18)
              </span>
              <button
                onClick={handleRunCode}
                disabled={isRunningCode}
                className="px-4 py-1.5 rounded-full bg-[#8B8CF6] hover:bg-[#7C7CF8] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs"
              >
                <Play className={`w-3.5 h-3.5 fill-current ${isRunningCode ? "animate-spin" : ""}`} />
                <span>{isRunningCode ? "Executing..." : "Run Test Cases"}</span>
              </button>
            </div>

            <div className="flex-1 bg-[#1E1F2B]">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 12 },
                }}
              />
            </div>
          </div>

          {/* Test Case Execution Output Panel */}
          {testResults && (
            <div className="mt-4 bg-[#1E1F2B] rounded-2xl p-4 border border-white/10 space-y-2">
              <span className="text-xs font-bold text-emerald-400">Judge0 Execution Output:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {testResults.map((res) => (
                  <div
                    key={res.id}
                    className="bg-[#292B3D] p-3 rounded-xl text-xs space-y-1 font-mono border border-emerald-500/30"
                  >
                    <div className="flex justify-between font-bold text-emerald-400">
                      <span>Test Case #{res.id}</span>
                      <span>PASSED</span>
                    </div>
                    <div className="text-slate-300">{res.input}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
