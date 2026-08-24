"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, GraduationCap } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#F6F7FF] flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 sm:p-10 rounded-[32px] border border-[#8B8CF6]/20 shadow-xl max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif-display text-3xl font-bold text-[#1E1F2B]">
            Access Restricted
          </h1>
          <p className="text-xs text-[#5A5C75] font-medium leading-relaxed">
            Teacher routes require a verified <span className="font-bold text-[#1E1F2B]">TEACHER</span> role. 
            You are currently signed in as a <span className="font-bold text-[#6C5CE7]">STUDENT</span>.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3.5 rounded-full bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white font-extrabold text-xs shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Go to Student Portal Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
