"use client";

import React, { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Sparkles, Code2, ShieldAlert, GraduationCap, ChevronRight, LogIn, LogOut, User, X, Mail } from "lucide-react";

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

            {/* Logged in User Pill or Login Button */}
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
                <span>Login</span>
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

      {/* Login Modal Overlay */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-[#161723]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[36px] p-8 max-w-md w-full border border-[#8B8CF6]/20 shadow-2xl relative space-y-5 text-center">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F6F7FF] hover:bg-[#EAEBFF] flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#8B8CF6] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#6C5CE7]/30">
              <Code2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-serif-display text-3xl font-extrabold text-[#1E1F2B]">
                Account Sign In
              </h2>
              <p className="text-xs text-[#5A5C75] font-medium mt-1">
                Select your role, then enter your college email to sign in instantly.
              </p>
            </div>

            {/* Role Toggle Selection */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => onRoleToggle("STUDENT")}
                className={`p-3 rounded-2xl text-left transition-all border-2 ${
                  currentRole === "STUDENT" 
                    ? "bg-[#F0F2FF] border-[#6C5CE7]" 
                    : "bg-white border-[#8B8CF6]/20 hover:border-[#8B8CF6]/50"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6C5CE7]">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Role</span>
                </div>
                <div className="text-[10px] font-semibold text-[#5A5C75] mt-0.5">
                  Access Dashboard
                </div>
              </button>

              <button
                onClick={() => onRoleToggle("TEACHER")}
                className={`p-3 rounded-2xl text-left transition-all border-2 ${
                  currentRole === "TEACHER" 
                    ? "bg-[#1E1F2B] border-[#F8A195]" 
                    : "bg-white border-slate-200 hover:border-slate-400"
                }`}
              >
                <div className={`flex items-center gap-1.5 text-xs font-bold ${currentRole === "TEACHER" ? "text-[#F8A195]" : "text-slate-700"}`}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Teacher Role</span>
                </div>
                <div className={`text-[10px] font-semibold mt-0.5 ${currentRole === "TEACHER" ? "text-slate-300" : "text-slate-500"}`}>
                  Manage Classrooms
                </div>
              </button>
            </div>

            {/* Email Direct Sign In Input */}
            <div className="space-y-2 text-left mt-2">
              <label className="text-[11px] font-extrabold uppercase text-[#6A6C88] tracking-wider">
                College Email Address
              </label>
              <div className="flex items-center gap-2 bg-[#F6F7FF] p-2.5 px-4 rounded-2xl border border-[#8B8CF6]/30">
                <Mail className="w-4 h-4 text-[#8B8CF6]" />
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="bg-transparent outline-none w-full text-xs font-semibold text-[#1E1F2B]"
                />
              </div>
              <button
                onClick={() => handleEmailSignIn(inputEmail, currentRole)}
                disabled={isSubmitting}
                className={`w-full py-3 rounded-full text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                  currentRole === "TEACHER" ? "bg-[#1E1F2B] hover:bg-[#2C2E40]" : "bg-[#6C5CE7] hover:bg-[#5A4AD1]"
                }`}
              >
                <span>{isSubmitting ? "Signing In..." : "Sign In with Email"}</span>
                <ChevronRight className={`w-4 h-4 ${currentRole === "TEACHER" ? "text-[#F8A195]" : "text-white/80"}`} />
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold uppercase text-[#8B8CF6]">
                Or Google OAuth
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={() => signIn("google")}
              className="w-full py-3 rounded-full bg-white border-2 border-[#8B8CF6]/30 hover:border-[#6C5CE7] text-[#1E1F2B] font-extrabold text-xs shadow-sm flex items-center justify-center gap-3 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google OAuth</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
