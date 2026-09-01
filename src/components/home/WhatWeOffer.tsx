"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Gamepad2, LineChart, ShieldCheck, Terminal, Lightbulb, Lock } from "lucide-react";

interface WhatWeOfferProps {
  onSelectFeature: (featureId: string) => void;
}

export const WhatWeOffer: React.FC<WhatWeOfferProps> = ({ onSelectFeature }) => {
  return (
    <section className="py-20 px-4 lg:px-12 bg-[#161723] text-white relative overflow-hidden">
      {/* Decorative Background Sparkles */}
      <div className="absolute top-10 right-16 text-[#8B8CF6]/30 pointer-events-none">
        <Sparkles className="w-16 h-16 animate-pulse" />
      </div>
      <div className="absolute bottom-8 left-12 text-[#F8A195]/30 pointer-events-none">
        <Sparkles className="w-12 h-12 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="font-serif-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            What we offer
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-[#8B8CF6]">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* 3 Main Feature Cards (Matching Reference Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Personalized Tracking */}
          <motion.div
            whileHover={{ y: -6 }}
            onClick={() => onSelectFeature("stats")}
            className="bg-[#212335] rounded-3xl p-8 border border-white/10 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-full bg-[#2C2E46] flex items-center justify-center text-white mb-6">
                <LineChart className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3">
                Personalized Solve Tracking
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Automated stats synchronization across LeetCode, Codeforces, and 
                CodeChef into unified CodeScore timelines.
              </p>
            </div>
            <div className="mt-8 text-xs font-bold text-[#8B8CF6] uppercase tracking-wider">
              Explore Analytics →
            </div>
          </motion.div>

          {/* Card 2: ACTIVE HIGHLIGHTED CARD (Locked) */}
          <motion.div
            className="bg-[#8B8CF6] rounded-3xl p-8 text-white shadow-xl shadow-[#8B8CF6]/20 flex flex-col justify-between relative overflow-hidden opacity-80 cursor-not-allowed"
          >
            {/* Sparkle badge accent */}
            <div className="absolute top-4 right-4 text-white/40">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6">
                <Gamepad2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3">
                Interactive Proctored Exams
              </h3>
              <p className="text-sm text-white/90 leading-relaxed font-medium">
                Take coding assessments with live AI browser proctoring, Monaco editor 
                integration, and automated Judge0 test cases.
              </p>
            </div>
            <div className="mt-8 text-xs font-extrabold text-white/70 uppercase tracking-wider bg-white/10 backdrop-blur-md px-4 py-2 rounded-full inline-flex items-center gap-1.5 self-start">
              <span>Launch Exam Sandbox</span>
              <Lock className="w-3.5 h-3.5" />
            </div>
          </motion.div>

          {/* Card 3: Real-Time Proctor Monitor (Locked) */}
          <motion.div
            className="bg-[#212335] rounded-3xl p-8 border border-white/10 flex flex-col justify-between opacity-70 cursor-not-allowed"
          >
            <div>
              <div className="w-14 h-14 rounded-full bg-[#2C2E46] flex items-center justify-center text-white mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3">
                Live Proctor Monitor
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Teachers receive real-time flag alerts for tab switches, fullscreen 
                exits, and can approve instant retest requests.
              </p>
            </div>
            <div className="mt-8 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Teacher Dashboard</span>
              <Lock className="w-3.5 h-3.5" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
