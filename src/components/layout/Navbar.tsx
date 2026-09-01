"use client";

import React, { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Sparkles, Code2, ShieldAlert, GraduationCap, ChevronRight, LogIn, LogOut, User, X, Mail } from "lucide-react";
import { NexaGradeLoginModal } from "../auth/NexaGradeLoginModal";

interface NavbarProps {
  currentRole: "STUDENT" | "TEACHER";
  onRoleToggle: (role: "STUDENT" | "TEACHER") => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleToggle,
  activeTab,
  setActiveTab,
}) => {
  const { data: session } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSignIn = async (emailToUse: string, roleToUse: "STUDENT" | "TEACHER") => {
    const trimmedEmail = emailToUse.trim();
    if (!trimmedEmail) {
      alert("Please enter your email address to sign in.");
      return;
    }
    setIsSubmitting(true);
    onRoleToggle(roleToUse);
    await signIn("credentials", {
      email: trimmedEmail,
      role: roleToUse,
      redirect: false,
    });
    setIsSubmitting(false);
    setShowLoginModal(false);
    setActiveTab(roleToUse === "TEACHER" ? "monitor" : "dashboard");
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#F6F7FF]/90 backdrop-blur-md border-b border-[#8B8CF6]/15 px-4 lg:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#8B8CF6] flex items-center justify-center text-white shadow-md shadow-[#8B8CF6]/30 group-hover:scale-105 transition-transform">
              <Code2 className="w-5.5 h-5.5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-serif-display text-2xl font-bold tracking-tight text-[#1E1F2B]">
                  Code<span className="text-[#6C5CE7]">Tracker</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-[#F8A195]"></span>
              </div>
              <span className="text-[10px] font-semibold text-[#8B8CF6] tracking-wider uppercase -mt-1">
                College Coding Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/80 p-1.5 rounded-full border border-[#8B8CF6]/20 shadow-sm">
            {[
              { id: "home", label: "Home" },
              { id: "dashboard", label: "Dashboard" },
              { id: "leaderboard", label: "Leaderboard 🏆" },
              { id: "classrooms", label: "Classrooms" },
              { id: "exam", label: "Live Exam" },
              { id: "monitor", label: "Proctor Monitor", teacherOnly: true },
            ]
              .filter((item) => !item.teacherOnly || currentRole === "TEACHER")
              .map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#6C5CE7] text-white shadow-md shadow-[#6C5CE7]/25"
                        : "text-[#5A5C75] hover:text-[#1E1F2B] hover:bg-[#8B8CF6]/10"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
          </nav>

          {/* Role Switcher, Login & Open Portal */}
          <div className="flex items-center gap-3">
            {/* Role Toggle Pill (Student / Teacher) */}
            <div className="bg-white p-1 rounded-full border border-[#8B8CF6]/25 flex items-center shadow-xs">
              <button
                onClick={() => onRoleToggle("STUDENT")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  currentRole === "STUDENT"
                    ? "bg-[#8B8CF6] text-white shadow-xs"
                    : "text-[#6A6C88] hover:text-[#1E1F2B]"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                onClick={() => onRoleToggle("TEACHER")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  currentRole === "TEACHER"
                    ? "bg-[#1E1F2B] text-white shadow-xs"
                    : "text-[#6A6C88] hover:text-[#1E1F2B]"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#F8A195]" />
                <span>Teacher</span>
              </button>
            </div>

            {/* Logged in User Pill or Portal Login Button */}
            {session?.user ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#8B8CF6]/30 text-xs font-bold text-[#1E1F2B] hover:bg-[#F0F2FF] transition-all"
              >
                <LogOut className="w-3.5 h-3.5 text-[#6C5CE7]" />
                <span>Sign Out ({session.user.name?.split(" ")[0]})</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full border-2 border-[#6C5CE7] text-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white text-xs font-extrabold transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab(currentRole === "TEACHER" ? "monitor" : "dashboard")}
              className="hidden sm:flex items-center gap-2 bg-[#1E1F2B] hover:bg-[#2C2E40] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
            >
              <span>Open Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#F8A195]" />
            </button>
          </div>
        </div>
      </header>

      <NexaGradeLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={(role) => {
          onRoleToggle(role);
          setActiveTab(role === "TEACHER" ? "monitor" : "dashboard");
        }}
      />
    </>
  );
};
