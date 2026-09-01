"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Award } from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export const TeacherRoster: React.FC = () => {
  const teachers = [
    {
      name: "Ajith S",
      role: "DEVELOPER",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      bgClass: "bg-[#F8A195]",
      subject: "C TECH",
      github: "https://github.com/Ajith200215",
    },
    {
      name: "Sharveswar M",
      role: "DEVELOPER",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      bgClass: "bg-[#8B8CF6]",
      subject: "C TECH",
      github: "https://github.com/Sharveswar007",
    },
    {
      name: "Srivattsa R",
      role: "DEVELOPER",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      bgClass: "bg-[#6C5CE7]",
      subject: "C TECH",
      github: "https://github.com/Vattsa-11",
    },
  ];

  return (
    <section className="py-20 px-4 lg:px-12 bg-[#9B9DF6] dark:bg-gray-900 text-white relative overflow-hidden">
      {/* Decorative Wavy Lines & Sparkles */}
      <div className="absolute top-8 left-10 text-white/30">
        <Sparkles className="w-12 h-12" />
      </div>
      <div className="absolute bottom-8 right-10 text-white/20">
        <Award className="w-16 h-16" />
      </div>

      <div className="max-w-7xl mx-auto text-center">
        {/* Section Title */}
        <h2 className="font-serif-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Meet our team
        </h2>
        <p className="text-sm sm:text-base text-white/90 font-medium max-w-xl mx-auto mb-14 leading-relaxed">
          Discover the developers and mentors at CodeTracker who are ready to 
          accompany students on their learning journey.
        </p>

        {/* 3 Teacher Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {teachers.map((teacher, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8 }}
              className="flex flex-col items-center group cursor-pointer"
            >
              <a 
                href={teacher.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center"
              >
                {/* Circular Avatar Container */}
                <div className="relative mb-6">
                  <div className={`w-44 h-44 rounded-full ${teacher.bgClass} flex items-center justify-center shadow-xl transition-transform group-hover:scale-105 border-4 border-white dark:border-gray-800 dark:!bg-gray-800`}>
                    <span className="text-5xl font-extrabold text-white font-serif-display">
                      {teacher.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                </div>

                {/* Teacher Info */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif-display text-2xl font-bold text-white group-hover:text-white/80 transition-colors">
                    {teacher.name}
                  </h3>
                  <GithubIcon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                </div>
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">
                  {teacher.role}
                </p>
                <span className="text-[11px] font-semibold text-white/70 bg-white/10 px-3 py-1 rounded-full">
                  {teacher.subject}
                </span>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
