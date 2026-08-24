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
              onWatchDemo={() => setActiveTab("exam")}
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
      {activeTab === "dashboard" && (
        <StudentDashboardView onStartExam={() => setActiveTab("exam")} />
      )}
      {activeTab === "monitor" && <TeacherMonitorView />}
      {activeTab === "classrooms" && (
        <div className="bg-white p-8 rounded-3xl border border-[#8B8CF6]/20 shadow-xl space-y-4">
          <h2 className="font-serif-display text-2xl font-bold">Classroom Roster</h2>
          <p className="text-xs text-[#5A5C75]">
            Classrooms enrolled: Section A1 (Computer Science & Engineering)
          </p>
        </div>
      )}
      {activeTab === "tests" && (
        <div className="bg-white p-8 rounded-3xl border border-[#8B8CF6]/20 shadow-xl space-y-4">
          <h2 className="font-serif-display text-2xl font-bold">Available Tests</h2>
          <p className="text-xs text-[#5A5C75]">
            1 Active Proctored Exam: Mid-Semester Algorithms Test
          </p>
        </div>
      )}
      {activeTab === "feedback" && (
        <div className="bg-white p-8 rounded-3xl border border-[#8B8CF6]/20 shadow-xl space-y-4">
          <h2 className="font-serif-display text-2xl font-bold">Teacher Feedback</h2>
          <p className="text-xs text-[#5A5C75]">
            "Great work on Graph algorithms test case pass ratio!" — Dr. Yukari Samo
          </p>
        </div>
      )}
    </AppShell>
  );
}
