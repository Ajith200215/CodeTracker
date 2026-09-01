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
    : currentRole === "STUDENT"
    ? { name: "Sarah Hessy", email: "sarah.hessy@college.edu", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", regNo: "2026-CS-0142" }
    : { name: "Dr. Yukari Samo", email: "yukari.samo@college.edu", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80", dept: "Computer Science Lead" };

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
              <div className="w-10 h-10 rounded-2xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-md shadow-[#6C5CE7]/30 dark:shadow-none">
                <Code2 className="w-5.5 h-5.5" />
              </div>
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

        {/* Logged-in User Card */}
        <div className="p-4 border-t border-[#8B8CF6]/15 dark:border-gray-800 bg-[#F6F7FF] dark:bg-gray-950">
          <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-[#8B8CF6]/15 dark:border-gray-800">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#8B8CF6]"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#1E1F2B] dark:text-white truncate">{user.name}</div>
              <div className="text-[10px] text-[#6A6C88] dark:text-gray-400 truncate">{user.email}</div>
            </div>
          </div>
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
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  currentRole === "STUDENT"
                    ? "bg-[#8B8CF6]/20 text-[#6C5CE7] border border-[#8B8CF6]/30 dark:border-gray-700"
                    : "bg-[#1E1F2B] text-[#F8A195]"
                }`}>
                  {currentRole} BADGE
                </span>
              </div>
              <p className="text-[11px] text-[#6A6C88] dark:text-gray-400 font-medium hidden sm:block">
                Logged in as <strong className="text-[#1E1F2B] dark:text-white">{user.name}</strong>
              </p>
            </div>
          </div>

          {/* Topbar Login Action & Notifications */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#8B8CF6]/30 dark:border-gray-700 text-xs font-bold text-[#1E1F2B] dark:text-white hover:bg-[#F0F2FF] hover:dark:bg-gray-800 dark:bg-gray-800 transition-all"
              >
                <LogOut className="w-3.5 h-3.5 text-[#6C5CE7]" />
                <span>Sign Out ({session.user.name?.split(" ")[0]})</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-[#6C5CE7] text-[#6C5CE7] hover:bg-[#6C5CE7] hover:text-white text-xs font-extrabold transition-all shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            <button className="w-9 h-9 rounded-full bg-[#F6F7FF] dark:bg-gray-950 border border-[#8B8CF6]/20 dark:border-gray-700 flex items-center justify-center text-[#6C5CE7] hover:bg-[#8B8CF6]/20 transition-all relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#F8A195] absolute top-1 right-1"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Login Modal Overlay */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-[#161723]/60 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[36px] p-8 max-w-md w-full border border-[#8B8CF6]/20 dark:border-gray-700 shadow-2xl relative space-y-5 text-center">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F6F7FF] dark:bg-gray-950 hover:bg-[#EAEBFF] hover:dark:bg-gray-700 flex items-center justify-center text-slate-500 dark:text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#8B8CF6] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#6C5CE7]/30 dark:shadow-none">
              <Code2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-serif-display text-3xl font-extrabold text-[#1E1F2B] dark:text-white">
                Account Sign In
              </h2>
              <p className="text-xs text-[#5A5C75] dark:text-gray-300 font-medium mt-1">
                Enter your college email or choose 1-click test credentials.
              </p>
            </div>

            {/* Email Direct Sign In Input */}
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-extrabold uppercase text-[#6A6C88] dark:text-gray-400 tracking-wider">
                College Email Address
              </label>
              <div className="flex items-center gap-2 bg-[#F6F7FF] dark:bg-gray-950 p-2.5 px-4 rounded-2xl border border-[#8B8CF6]/30 dark:border-gray-700">
                <Mail className="w-4 h-4 text-[#8B8CF6]" />
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="bg-transparent outline-none w-full text-xs font-semibold text-[#1E1F2B] dark:text-white"
                />
              </div>
              <button
                onClick={() => handleEmailSignIn(inputEmail, currentRole)}
                disabled={isSubmitting}
                className="w-full py-3 rounded-full bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "Signing In..." : "Sign In with Email"}</span>
                <ChevronRight className="w-4 h-4 text-[#F8A195]" />
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-gray-700"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold uppercase text-[#8B8CF6]">
                Or Google / Quick Demo
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-gray-700"></div>
            </div>

            <button
              onClick={() => signIn("google")}
              className="w-full py-3 rounded-full bg-white dark:bg-gray-900 border-2 border-[#8B8CF6]/30 dark:border-gray-700 hover:border-[#6C5CE7] text-[#1E1F2B] dark:text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-3 transition-all"
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

            {/* Fast 1-Click Demo Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleEmailSignIn("sarah.hessy@college.edu", "STUDENT")}
                className="p-3 rounded-2xl bg-[#F0F2FF] dark:bg-gray-800 hover:bg-[#E5E8FF] hover:dark:bg-gray-700 border border-[#8B8CF6]/30 dark:border-gray-700 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6C5CE7]">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Login</span>
                </div>
                <div className="text-[10px] font-semibold text-[#5A5C75] dark:text-gray-300 mt-0.5">
                  sarah.hessy@college.edu
                </div>
              </button>

              <button
                onClick={() => handleEmailSignIn("yukari.samo@college.edu", "TEACHER")}
                className="p-3 rounded-2xl bg-[#1E1F2B] hover:bg-[#2C2E40] text-white text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#F8A195]">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Teacher Login</span>
                </div>
                <div className="text-[10px] font-semibold text-slate-300 mt-0.5">
                  yukari.samo@college.edu
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
