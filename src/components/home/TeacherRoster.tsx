"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Award, BookOpen, ShieldCheck } from "lucide-react";

export const TeacherRoster: React.FC = () => {
  const teachers = [
    {
      name: "Ajith S",
      role: "DEVELOPER",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      bgClass: "bg-[#F8A195]",
      subject: "C TECH",
    },
    {
      name: "Sharveswar M",
      role: "DEVELOPER",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      bgClass: "bg-[#8B8CF6]",
      subject: "C TECH",
    },
    {
      name: "Srivattsa R",
      role: "DEVELOPER",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      bgClass: "bg-[#6C5CE7]",
      subject: "C TECH",
    },
  ];

  return (
    <section className="py-20 px-4 lg:px-12 bg-[#9B9DF6] text-white relative overflow-hidden">
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
              className="flex flex-col items-center group"
            >
              {/* Circular Avatar Container */}
              <div className="relative mb-6">
                <div className={`w-44 h-44 rounded-full ${teacher.bgClass} flex items-center justify-center shadow-xl transition-transform group-hover:scale-105 border-4 border-white`}>
                  <span className="text-5xl font-extrabold text-white font-serif-display">
                    {teacher.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
              </div>

              {/* Teacher Info */}
              <h3 className="font-serif-display text-2xl font-bold text-white mb-1">
                {teacher.name}
              </h3>
              <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">
                {teacher.role}
              </p>
              <span className="text-[11px] font-semibold text-white/70 bg-white/10 px-3 py-1 rounded-full">
                {teacher.subject}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
