"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Play, 
  Puzzle, 
  Clock, 
  Code2, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Zap,
  TrendingUp,
  Brain
} from "lucide-react";

interface HeroSectionProps {
  onStart: () => void;
  onWatchDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart, onWatchDemo }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 px-4 lg:px-12 bg-gradient-to-b from-[#F6F7FF] via-[#F0F2FF] to-[#F6F7FF] dark:from-[#09090b] dark:via-[#111115] dark:to-[#09090b]">
      {/* Decorative Background Sparkles & Soft Glowing Blobs */}
      <div className="absolute top-12 left-1/4 w-72 h-72 bg-[#8B8CF6]/15 rounded-full blur-3xl animate-pulse-glow pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F8A195]/15 rounded-full blur-3xl animate-pulse-glow pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Content Column */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 flex flex-col items-start space-y-6 text-left"
        >
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-white dark:bg-[#18181f] px-4 py-2 rounded-full border border-[#8B8CF6]/25 shadow-xs">
            <div className="w-5 h-5 rounded-full bg-[#6C5CE7] flex items-center justify-center text-white">
              <Puzzle className="w-3 h-3 fill-current" />
            </div>
            <span className="text-xs font-bold text-[#1E1F2B] dark:text-white tracking-wide">
              The best college coding platform
            </span>
          </div>

          {/* Main Serif Headline matching Edulite typography */}
          <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#1E1F2B] dark:text-white leading-[1.08] tracking-tight">
            Turn coding <br />
            progress into{" "}
            <span className="relative inline-block text-[#6C5CE7]">
              mastery!
              {/* Wavy Underline Decoration */}
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-[#F8A195]"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 10C40 2 80 12 120 4C160 -4 180 8 198 6"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#5A5C75] dark:text-slate-400 max-w-xl font-medium leading-relaxed">
            Real-time platform stats sync across LeetCode & Codeforces, automated 
            CodeScore rating, and browser-proctored college coding exams.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onStart}
              className="px-8 py-4 rounded-full bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white font-bold text-sm shadow-lg shadow-[#6C5CE7]/35 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onWatchDemo}
              className="px-7 py-4 rounded-full bg-white dark:bg-[#18181f] hover:bg-[#F0F2FF] dark:bg-[#161723] text-[#1E1F2B] dark:text-white font-bold text-sm border border-[#8B8CF6]/30 shadow-xs transition-all hover:scale-105 flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-full bg-[#8B8CF6]/20 flex items-center justify-center text-[#6C5CE7]">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
              <span>Watch Video</span>
            </button>
          </div>


        </motion.div>

        {/* Right Preview Column (Replicating Edulite Floating Mobile Frame) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-6 relative flex justify-center"
        >
          {/* Main Mobile App Frame */}
          <div className="w-full max-w-sm bg-white dark:bg-[#18181f] rounded-[40px] p-5 shadow-2xl shadow-[#6C5CE7]/20 border-4 border-white ring-1 ring-[#8B8CF6]/20 relative animate-float">
            
            {/* Phone Top Notch / Status Bar */}
            <div className="flex items-center justify-between px-3 py-1 mb-4 text-xs font-bold text-slate-800 dark:text-slate-300">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                <div className="w-4 h-2 rounded-sm border border-slate-800 flex items-center p-0.5">
                  <div className="w-full h-full bg-slate-800"></div>
                </div>
              </div>
            </div>

            {/* Student Profile Greeting Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-xs text-[#8B8CF6] font-semibold">Good morning,</span>
                <h3 className="text-lg font-bold text-[#1E1F2B] dark:text-white">Sarah Hessy</h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#F8A195]/20 flex items-center justify-center text-[#F8A195]">
                <Zap className="w-5 h-5 fill-current" />
              </div>
            </div>

            {/* Upcoming Class / Exam Card (Matching Edulite "Math class in 30 minutes") */}
            <div className="bg-gradient-to-br from-[#ECEEFF] to-[#DCE0FF] dark:from-[#212335] dark:to-[#2A2C40] rounded-3xl p-4 mb-5 relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-xs font-semibold text-[#6C5CE7] uppercase tracking-wider">Upcoming Exam</span>
                <h4 className="text-base font-extrabold text-[#1E1F2B] dark:text-white mt-0.5">
                  Data Structures in <br />30 minutes
                </h4>
                <button 
                  onClick={onStart}
                  className="mt-3 px-4 py-2 bg-[#1E1F2B] text-white rounded-full text-xs font-bold shadow-sm hover:bg-[#33354A] transition-all"
                >
                  Join now
                </button>
              </div>

              {/* Decorative Pastel 3D Geometric Accents */}
              <div className="absolute right-2 bottom-2 w-16 h-16 bg-[#F8A195] rounded-2xl rotate-12 opacity-80"></div>
              <div className="absolute right-8 top-3 w-10 h-10 bg-[#8B8CF6] rounded-full opacity-60"></div>
            </div>

            {/* Platform Categories Pill Bar */}
            <div className="flex items-center justify-between gap-1 mb-5 overflow-x-auto pb-1">
              {[
                { name: "LeetCode", icon: Code2, active: true },
                { name: "Codeforces", icon: TrendingUp, active: false },
                { name: "CodeChef", icon: Brain, active: false },
              ].map((plat, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    plat.active
                      ? "bg-[#6C5CE7] text-white shadow-xs"
                      : "bg-[#F6F7FF] dark:bg-[#111115] text-[#5A5C75] dark:text-slate-400 border border-[#8B8CF6]/15"
                  }`}
                >
                  <plat.icon className="w-3.5 h-3.5" />
                  <span>{plat.name}</span>
                </div>
              ))}
            </div>

            {/* Practice Modules Section */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#1E1F2B] dark:text-white">Live Assessments</span>
              <span className="text-[11px] font-semibold text-[#6C5CE7] cursor-pointer">See more</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Practice Card 1 */}
              <div className="bg-[#FFF6F4] dark:bg-[#212335] rounded-2xl p-3 border border-[#F8A195]/30 flex flex-col justify-between">
                <span className="text-[11px] font-extrabold text-[#1E1F2B] dark:text-white leading-tight">
                  Graph Practice
                </span>
                <div className="mt-4 flex items-center justify-between text-[10px] text-[#F8A195] font-bold">
                  <span>12 Problems</span>
                  <Trophy className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Practice Card 2 */}
              <div className="bg-[#F0F2FF] dark:bg-[#161723] rounded-2xl p-3 border border-[#8B8CF6]/30 flex flex-col justify-between">
                <span className="text-[11px] font-extrabold text-[#1E1F2B] dark:text-white leading-tight">
                  Dynamic Prog.
                </span>
                <div className="mt-4 flex items-center justify-between text-[10px] text-[#6C5CE7] font-bold">
                  <span>8 Problems</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating Decorative Sparkles & Badges around mobile frame */}
          <div className="absolute -top-4 -right-4 bg-white dark:bg-[#18181f] p-3 rounded-2xl border border-[#8B8CF6]/25 shadow-lg flex items-center gap-2 animate-float-reverse">
            <div className="w-3 h-3 rounded-full bg-[#4ADE80]"></div>
            <span className="text-xs font-extrabold text-[#1E1F2B] dark:text-white">Proctoring Active</span>
          </div>

          <div className="absolute -bottom-4 -left-4 bg-[#6C5CE7] text-white p-3.5 rounded-2xl shadow-lg flex items-center gap-3">
            <Trophy className="w-5 h-5 text-[#F8A195]" />
            <div>
              <div className="text-xs font-extrabold">Top 5% Class Rank</div>
              <div className="text-[10px] opacity-80">Score: 1,840 pts</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
