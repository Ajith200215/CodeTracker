"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { WhatWeOffer } from "@/components/home/WhatWeOffer";
import { AppShowcase } from "@/components/home/AppShowcase";
import { TeacherRoster } from "@/components/home/TeacherRoster";
import { CTABanner } from "@/components/home/CTABanner";
import { Footer } from "@/components/layout/Footer";
import { AppShell } from "@/components/layout/AppShell";
import { StudentDashboardView } from "@/components/dashboard/StudentDashboardView";
import { UnifiedLeaderboardView } from "@/components/leaderboard/UnifiedLeaderboardView";
import { ExamAttemptView } from "@/components/exam/ExamAttemptView";
import { TeacherMonitorView } from "@/components/monitor/TeacherMonitorView";

export default function Home() {
  const { data: session } = useSession();
  const [currentRole, setCurrentRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [activeTab, setActiveTab] = useState<string>("home");

  // Automatically sync current role with session user role on sign-in
  useEffect(() => {
    if (session?.user) {
      const userRole = (session.user as any).role as "STUDENT" | "TEACHER" | "ADMIN";
      if (userRole === "TEACHER") {
        setCurrentRole("TEACHER");
      } else {
        setCurrentRole("STUDENT");
      }
    }
  }, [session]);

  const handleRoleToggle = (role: "STUDENT" | "TEACHER") => {
    setCurrentRole(role);
    if (role === "TEACHER" && activeTab === "dashboard") {
      setActiveTab("monitor");
    } else if (role === "STUDENT" && activeTab === "monitor") {
      setActiveTab("dashboard");
    }
  };

  if (activeTab === "exam") {
    return (
      <ExamAttemptView
        onExit={() => setActiveTab("dashboard")}
        onRequestRetest={() => setActiveTab("dashboard")}
      />
    );
  }

  // Render Landing Page if activeTab is "home"
  if (activeTab === "home") {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <div>
          <Navbar
            currentRole={currentRole}
            onRoleToggle={handleRoleToggle}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <main>
            <HeroSection
              onStart={() => setActiveTab(currentRole === "TEACHER" ? "monitor" : "dashboard")}
              onWatchDemo={() => {}}
            />
            <WhatWeOffer
              onSelectFeature={(feat) => {
                if (feat === "exam") setActiveTab("exam");
                else if (feat === "monitor") {
                  setCurrentRole("TEACHER");
                  setActiveTab("monitor");
                } else setActiveTab("dashboard");
              }}
            />
            <AppShowcase
              onOpenApp={() => setActiveTab(currentRole === "TEACHER" ? "monitor" : "dashboard")}
            />
            <TeacherRoster />
            <CTABanner
              onStart={() => setActiveTab(currentRole === "TEACHER" ? "monitor" : "dashboard")}
            />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  // Render App Shell with Role-Aware Sidebar & Topbar for all portal routes (Phase 0 Scaffold)
  return (
    <AppShell
      currentRole={currentRole}
      onRoleToggle={handleRoleToggle}
      activeNav={activeTab}
      setActiveNav={setActiveTab}
    >
      {activeTab === "leaderboard" && <UnifiedLeaderboardView />}
      
      {/* Locked Views for Unauthenticated Users */}
      {!session?.user && activeTab !== "leaderboard" && (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] bg-white dark:bg-gray-800 rounded-3xl border border-[#8B8CF6]/20 shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F0F2FF] dark:bg-gray-700 flex items-center justify-center text-[#6C5CE7] dark:text-[#8B8CF6] mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="font-serif-display text-3xl font-bold text-[#1E1F2B] dark:text-white mb-3">
            Please login to view the stats
          </h2>
          <p className="text-sm text-[#5A5C75] dark:text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
            You need to be authenticated with your college account to access the dashboard and coding assessments.
          </p>
        </div>
      )}

      {/* Authenticated Views */}
      {session?.user && (
        <>
          {activeTab === "dashboard" && (
            <StudentDashboardView onStartExam={() => setActiveTab("exam")} />
          )}
          {activeTab === "monitor" && <TeacherMonitorView />}
          {activeTab === "classrooms" && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-[#8B8CF6]/20 shadow-xl space-y-4">
              <h2 className="font-serif-display text-2xl font-bold dark:text-white">Classroom Roster</h2>
              <p className="text-xs text-[#5A5C75] dark:text-gray-400">
                Classrooms enrolled: Section A1 (Computer Science & Engineering)
              </p>
            </div>
          )}
          {activeTab === "tests" && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-[#8B8CF6]/20 shadow-xl space-y-4">
              <h2 className="font-serif-display text-2xl font-bold dark:text-white">Available Tests</h2>
              <p className="text-xs text-[#5A5C75] dark:text-gray-400">
                1 Active Proctored Exam: Mid-Semester Algorithms Test
              </p>
            </div>
          )}
          {activeTab === "feedback" && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-[#8B8CF6]/20 shadow-xl space-y-4">
              <h2 className="font-serif-display text-2xl font-bold dark:text-white">Teacher Feedback</h2>
              <p className="text-xs text-[#5A5C75] dark:text-gray-400">
                "Great work on Graph algorithms test case pass ratio!" — Dr. Yukari Samo
              </p>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
