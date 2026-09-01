"use client";

import React, { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Sparkles, Code2, ShieldAlert, GraduationCap, ChevronRight, LogIn, LogOut, User, X, Mail, Sun, Moon, Lock } from "lucide-react";
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleDarkMode = () => {
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.toggle("dark");
      setIsDarkMode(isDark);
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }
  };

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
      <header className="sticky top-0 z-50 bg-[#F6F7FF]/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-[#8B8CF6]/15 dark:border-gray-700 px-4 lg:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-serif-display text-2xl font-bold tracking-tight text-[#1E1F2B] dark:text-white">
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
          <nav className="hidden md:flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 p-1.5 rounded-full border border-[#8B8CF6]/20 dark:border-gray-700 shadow-sm">
            {[
              { id: "home", label: "Home" },
              { id: "dashboard", label: "Dashboard" },
              { id: "leaderboard", label: "Leaderboard" },
              { id: "classrooms", label: "Classrooms" },
              { id: "exam", label: "Live Exam", locked: true },
              { id: "monitor", label: "Proctor Monitor", teacherOnly: true, locked: true },
            ]
              .filter((item) => !item.teacherOnly || currentRole === "TEACHER")
              .map((item) => {
                const isActive = activeTab === item.id;
                const isLocked = (item as any).locked;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isLocked) return;
                      setActiveTab(item.id);
                    }}
                    className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                      isLocked
                        ? "opacity-60 cursor-not-allowed text-[#6A6C88] dark:text-slate-500"
                        : isActive
                          ? "bg-[#6C5CE7] text-white shadow-md shadow-[#6C5CE7]/25"
                          : "text-[#5A5C75] dark:text-gray-400 hover:text-[#1E1F2B] dark:hover:text-white hover:bg-[#8B8CF6]/10 dark:hover:bg-[#27272a]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                  </button>
                );
              })}
          </nav>

          {/* Theme Switcher & Login */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle (Hidden per user request, easily re-enabled) */}
            <button
              onClick={toggleDarkMode}
              className="hidden p-2 rounded-full bg-white dark:bg-gray-800 border border-[#8B8CF6]/25 dark:border-gray-700 text-[#6A6C88] dark:text-gray-300 hover:text-[#1E1F2B] dark:hover:text-white transition-all shadow-xs"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Logged in User Pill or Portal Login Button */}
            {session?.user ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#8B8CF6]/30 dark:border-gray-700 text-xs font-bold text-[#1E1F2B] dark:text-white hover:bg-[#F0F2FF] dark:hover:bg-[#27272a] transition-all"
              >
                <LogOut className="w-3.5 h-3.5 text-[#6C5CE7]" />
                <span>Sign Out ({session.user.name?.split(" ")[0]})</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full border-2 border-[#6C5CE7] text-[#6C5CE7] dark:hover:bg-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white text-xs font-extrabold transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </button>
            )}
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
