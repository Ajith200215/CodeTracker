"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  ShieldCheck, 
  Code2, 
  Download, 
  CheckCircle, 
  Zap, 
  Sparkles,
  ArrowRight
} from "lucide-react";

interface AppShowcaseProps {
  onOpenApp: () => void;
}

export const AppShowcase: React.FC<AppShowcaseProps> = ({ onOpenApp }) => {
  return (
    <section className="py-20 px-4 lg:px-12 bg-[#F6F7FF]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif-display text-4xl sm:text-5xl font-extrabold text-[#1E1F2B] dark:text-white tracking-tight">
            CodeTracker mobile & web app
          </h2>
          <p className="text-sm sm:text-base text-[#5A5C75] dark:text-gray-400 font-medium mt-3 leading-relaxed">
            CodeTracker is an interactive coding progress app designed specifically for 
            colleges, with advanced analytics and live proctoring features.
          </p>
        </div>

        {/* 2 Top Showcase Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Card 1: Friendly User Interface */}
          <div className="bg-white dark:bg-gray-800 rounded-[36px] p-8 border border-[#8B8CF6]/20 shadow-xl shadow-[#8B8CF6]/10 flex flex-col justify-between relative overflow-hidden">
            <div className="text-center mb-6">
              <h3 className="font-serif-display text-2xl font-bold text-[#1E1F2B] dark:text-white">
                Very friendly user interface
              </h3>
            </div>

            {/* Inner Phone UI Mockup Showcase */}
            <div className="bg-[#F0F2FF] rounded-3xl p-6 relative min-h-[260px] flex items-center justify-center">
              {/* Floating Badge 1 */}
              <div className="absolute top-4 left-4 bg-[#F8A195] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-md rotate-[-6deg]">
                Proctor Ready ✨
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute bottom-4 right-4 bg-[#6C5CE7] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-md rotate-[4deg]">
                Easy access ⚡
              </div>

              {/* Central App Card Preview */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-[#8B8CF6]/30 shadow-lg w-full max-w-xs text-left">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#8B8CF6]/20 flex items-center justify-center text-[#6C5CE7]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1E1F2B] dark:text-white">Proctor Status</div>
                    <div className="text-[10px] text-[#4ADE80] font-bold">0 Warnings (Clean)</div>
                  </div>
                </div>
                <div className="bg-[#F6F7FF] p-2.5 rounded-xl text-xs font-mono text-[#6C5CE7] font-semibold">
                  function solve(n) &#123; return n * 2; &#125;
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Complete Learning & Practice Media */}
          <div className="bg-white dark:bg-gray-800 rounded-[36px] p-8 border border-[#8B8CF6]/20 shadow-xl shadow-[#8B8CF6]/10 flex flex-col justify-between relative overflow-hidden">
            <div className="text-center mb-6">
              <h3 className="font-serif-display text-2xl font-bold text-[#1E1F2B] dark:text-white">
                Complete coding & analytics media
              </h3>
            </div>

            {/* Inner Practice Showcase */}
            <div className="bg-[#FFF4F2] rounded-3xl p-6 relative min-h-[260px] flex items-center justify-center">
              {/* Floating Code Practice Badge */}
              <div className="bg-white dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl border border-[#F8A195]/40 shadow-lg w-full max-w-xs text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#1E1F2B] dark:text-white">Drawing & Logic</span>
                  <Code2 className="w-4 h-4 text-[#F8A195]" />
                </div>
                <div className="text-2xl font-black text-[#1E1F2B] dark:text-white font-serif-display">
                  Practice
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-[#F8A195] font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>35 Problems Solved Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner Card (Matching Warm Coral Edulite Download Banner) */}
        <div className="bg-[#F8A195] rounded-[36px] p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-[#F8A195]/25">
          <div>
            <h3 className="font-serif-display text-3xl font-extrabold text-[#1E1F2B] dark:text-white mb-2">
              Launch the app now
            </h3>
            <p className="text-sm font-semibold text-white/90 max-w-lg">
              CodeTracker is an interactive coding progress platform for students and teachers.
            </p>
          </div>

          <button
            onClick={onOpenApp}
            className="px-8 py-4 rounded-full bg-[#1E1F2B] hover:bg-[#2D2F44] text-white font-bold text-sm shadow-lg transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap"
          >
            <span>Open Application</span>
            <ArrowRight className="w-4 h-4 text-[#F8A195]" />
          </button>
        </div>
      </div>
    </section>
  );
};
