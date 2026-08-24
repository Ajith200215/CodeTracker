"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Award, BookOpen, ShieldCheck } from "lucide-react";

export const TeacherRoster: React.FC = () => {
  const teachers = [
    {
      name: "Dr. Yukari Samo",
      role: "Data Structures & Algo Lead",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      bgClass: "bg-[#F8A195]",
      subject: "Computer Science Dept.",
    },
    {
      name: "Prof. Alex Chen",
      role: "Competitive Coding Coach",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      bgClass: "bg-[#8B8CF6]",
      subject: "Algorithms & Logic",
    },
    {
      name: "Elena Rostova",
      role: "Exam & Proctor Administrator",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      bgClass: "bg-[#6C5CE7]",
      subject: "Proctor Security",
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
          Meet our teachers
        </h2>
        <p className="text-sm sm:text-base text-white/90 font-medium max-w-xl mx-auto mb-14 leading-relaxed">
          Discover the teachers and coding mentors at CodeTracker who are ready to 
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
                <div className={`w-44 h-44 rounded-full ${teacher.bgClass} p-1.5 shadow-xl transition-transform group-hover:scale-105`}>
                  <img
                    src={teacher.image}
                    alt={teacher.name}
                    className="w-full h-full rounded-full object-cover border-4 border-white"
                  />
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
