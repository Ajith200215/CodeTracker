"use client";

import React from "react";
import { ArrowRight, Sparkles, Megaphone } from "lucide-react";

interface CTABannerProps {
  onStart: () => void;
}

export const CTABanner: React.FC<CTABannerProps> = ({ onStart }) => {
  return (
    <section className="py-16 px-4 lg:px-12 bg-[#8B8CF6] dark:bg-gray-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join Now</span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Get Started with CodeTracker Today!
          </h2>

          <p className="text-sm sm:text-base text-white/90 font-medium max-w-xl">
            The final push to encourage students and universities to track coding progress 
            and make proctored examinations seamless and reliable.
          </p>

          <div className="pt-2 w-full sm:w-auto">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-gray-800 text-[#1E1F2B] dark:text-white hover:bg-[#F0F2FF] hover:dark:bg-gray-700 font-extrabold text-sm shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4 text-[#6C5CE7] dark:text-white" />
            </button>
          </div>
        </div>

        {/* Right Column Megaphone Graphic */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-white/10 dark:bg-gray-800/10 p-6 flex items-center justify-center">
            <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-white/20 dark:bg-gray-800/20 flex items-center justify-center text-white">
              <Megaphone className="w-20 h-20 sm:w-24 sm:h-24 stroke-[1.5] rotate-[-12deg] text-[#F8A195]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
