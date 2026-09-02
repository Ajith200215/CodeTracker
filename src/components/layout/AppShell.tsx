"use client";

import React, { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  MessageSquareQuote, 
  ShieldAlert, 
  Code2, 
  User, 
  Bell, 
  ChevronRight, 
  LogOut,
  LogIn,
  Sparkles,
  Search,
  Menu,
  X,
  Mail,
  Trophy,
  Lock,
  Home
} from "lucide-react";
import { NexaGradeLoginModal } from "@/components/auth/NexaGradeLoginModal";

interface AppShellProps {
  currentRole: "STUDENT" | "TEACHER";
  onRoleToggle: (role: "STUDENT" | "TEACHER") => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentRole,
  onRoleToggle,
  activeNav,
  setActiveNav,
  children,
}) => {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    setActiveNav(roleToUse === "TEACHER" ? "monitor" : "dashboard");
  };

  // Logged-in user representation
  const user = session?.user
    ? { name: session.user.name || "User", email: session.user.email || "", avatar: session.user.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", regNo: "2026-CS-0142" }
    : null;

  const studentNavItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "classrooms", label: "Classrooms", icon: BookOpen },
    { id: "tests", label: "Proctored Exam", icon: GraduationCap, locked: true },
    { id: "feedback", label: "Feedback", icon: MessageSquareQuote, locked: true },
  ];

  const teacherNavItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "classrooms", label: "Classrooms", icon: BookOpen },
    { id: "tests", label: "Proctored Exam", icon: GraduationCap, locked: true },
    { id: "monitor", label: "Monitor", icon: ShieldAlert },
  ];

  const navItems = currentRole === "STUDENT" ? studentNavItems : teacherNavItems;

  return (
    <div className="min-h-screen bg-[#F6F7FF] dark:bg-gray-950 flex flex-col lg:flex-row text-[#1E1F2B] dark:text-white">
      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-[#8B8CF6]/15 dark:border-gray-800 flex flex-col justify-between transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#8B8CF6]/15 dark:border-gray-800 flex items-center justify-between">
            <div 
              onClick={() => setActiveNav("home")}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div>
                <span className="font-serif-display text-xl font-bold text-[#1E1F2B] dark:text-white">
                  Code<span className="text-[#6C5CE7]">Tracker</span>
                </span>
                <span className="block text-[10px] font-bold text-[#8B8CF6] uppercase tracking-wider -mt-1">
                  App Shell Portal
                </span>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden text-slate-400 dark:text-gray-500 hover:text-slate-600 hover:dark:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#6A6C88] dark:text-gray-400">
              {currentRole} Menu
            </div>
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              const Icon = item.icon;
              const isLocked = (item as any).locked;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isLocked) return; // Prevent navigation if locked
                    setActiveNav(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isLocked 
                      ? "opacity-60 cursor-not-allowed text-[#6A6C88] dark:text-gray-400 bg-[#F6F7FF] dark:bg-gray-950/50" 
                      : isActive
                        ? "bg-[#6C5CE7] dark:bg-gray-950 text-white shadow-md shadow-[#6C5CE7]/25 dark:shadow-none"
                        : "text-[#5A5C75] dark:text-gray-300 hover:bg-[#F0F2FF] hover:dark:bg-gray-800 dark:bg-gray-800 hover:text-[#1E1F2B] hover:dark:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {isLocked ? (
                    <Lock className="w-3.5 h-3.5 ml-auto text-slate-400 dark:text-gray-500" />
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/80" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card / Login Action */}
        <div className="p-4 border-t border-[#8B8CF6]/15 dark:border-gray-800 bg-[#F6F7FF] dark:bg-gray-950">
          {session?.user ? (
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-[#8B8CF6]/15 dark:border-gray-800">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-[#8B8CF6]"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#1E1F2B] dark:text-white truncate">{user?.name}</div>
                <div className="text-[10px] text-[#6A6C88] dark:text-gray-400 truncate">{user?.email}</div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#6C5CE7] text-white text-xs font-extrabold transition-all shadow-md shadow-[#6C5CE7]/25 hover:bg-[#5b4cdb]"
            >
              <LogIn className="w-4 h-4" />
              <span>Login to Portal</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area with Topbar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar showing logged-in user name & role badge */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900/90 backdrop-blur-md border-b border-[#8B8CF6]/15 dark:border-gray-800 px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#F0F2FF] dark:bg-gray-800 text-[#1E1F2B] dark:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-display text-xl font-bold text-[#1E1F2B] dark:text-white">
                  {navItems.find((n) => n.id === activeNav)?.label || "Portal"}
                </h2>
              </div>
              {session?.user && (
                <p className="text-[11px] text-[#6A6C88] dark:text-gray-400 font-medium hidden sm:block">
                  Logged in as <strong className="text-[#1E1F2B] dark:text-white">{user?.name}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Topbar Login Action & Notifications */}
          <div className="flex items-center gap-3">
            {session?.user && (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#8B8CF6]/30 dark:border-gray-700 text-xs font-bold text-[#1E1F2B] dark:text-white hover:bg-[#F0F2FF] hover:dark:bg-gray-800 dark:bg-gray-800 transition-all"
              >
                <LogOut className="w-3.5 h-3.5 text-[#6C5CE7]" />
                <span>Sign Out ({session.user.name?.split(" ")[0]})</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Login Modal Overlay */}
      <NexaGradeLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={(role) => {
          onRoleToggle(role);
          setShowLoginModal(false);
          setActiveNav(role === "TEACHER" ? "monitor" : "dashboard");
        }}
      />
    </div>
  );
};
