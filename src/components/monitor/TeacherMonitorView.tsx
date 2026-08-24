"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  UserCheck, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  Eye
} from "lucide-react";

export const TeacherMonitorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"live" | "retests">("live");

  // Mock live student exam attempts (Phase 11)
  const [attempts, setAttempts] = useState([
    {
      id: "att-1",
      studentName: "Sarah Hessy",
      regNo: "2026-CS-0142",
      status: "IN_PROGRESS",
      flags: 0,
      startedAt: "10:15 AM",
      score: null,
    },
    {
      id: "att-2",
      studentName: "Michael Chang",
      regNo: "2026-CS-0189",
      status: "AUTO_ENDED_CHEATING",
      flags: 2,
      startedAt: "10:12 AM",
      score: 0,
    },
    {
      id: "att-3",
      studentName: "David Miller",
      regNo: "2026-CS-0201",
      status: "SUBMITTED",
      flags: 0,
      startedAt: "10:00 AM",
      score: 95,
    },
    {
      id: "att-4",
      studentName: "Priya Sharma",
      regNo: "2026-CS-0115",
      status: "IN_PROGRESS",
      flags: 1,
      startedAt: "10:18 AM",
      score: null,
    },
  ]);

  // Mock retest requests queue (Phase 11)
  const [retestRequests, setRetestRequests] = useState([
    {
      id: "ret-1",
      attemptId: "att-2",
      studentName: "Michael Chang",
      regNo: "2026-CS-0189",
      reason: "Browser crashed due to OS notification update during tab switch attempt.",
      flagType: "TAB_SWITCH (2 flags)",
      status: "PENDING",
      createdAt: "10:35 AM",
    },
  ]);

  const handleApproveRetest = (requestId: string, studentName: string) => {
    setRetestRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "APPROVED" } : r))
    );

    // Reset attempt status in live monitor
    setAttempts((prev) =>
      prev.map((a) =>
        a.studentName === studentName
          ? { ...a, status: "RETEST_APPROVED", flags: 0 }
          : a
      )
    );
  };

  const handleRejectRetest = (requestId: string) => {
    setRetestRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "REJECTED" } : r))
    );
  };

  return (
    <div className="py-8 px-4 lg:px-12 max-w-7xl mx-auto space-y-8">
      {/* Teacher Control Header */}
      <div className="bg-[#1E1F2B] text-white rounded-[32px] p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#F8A195]/20 text-[#F8A195] px-3.5 py-1 rounded-full text-xs font-extrabold mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Teacher Proctor Command Center</span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-extrabold">
            Live Assessment Monitor
          </h1>
          <p className="text-sm text-slate-300 font-medium">
            Classroom: Section A1 • Exam: Mid-Semester Algorithms Test
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex bg-[#292B3D] p-1.5 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "live"
                ? "bg-[#6C5CE7] text-white shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Live Monitor ({attempts.length})
          </button>
          <button
            onClick={() => setActiveTab("retests")}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "retests"
                ? "bg-[#6C5CE7] text-white shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Retest Requests ({retestRequests.filter((r) => r.status === "PENDING").length})
          </button>
        </div>
      </div>

      {activeTab === "live" ? (
        /* Live Attempts Table / Grid */
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#8B8CF6]/20 shadow-xl shadow-[#8B8CF6]/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif-display text-2xl font-bold text-[#1E1F2B]">
              Active Student Exam Sessions
            </h3>
            <span className="text-xs font-bold text-[#16A34A] bg-[#4ADE80]/15 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping"></span>
              WebSocket Feed Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#8B8CF6]/15 text-xs font-bold text-[#6A6C88] uppercase">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Reg No</th>
                  <th className="py-3 px-4">Started At</th>
                  <th className="py-3 px-4">Proctor Flags</th>
                  <th className="py-3 px-4">Attempt Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8B8CF6]/10 text-xs font-semibold text-[#1E1F2B]">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-[#F6F7FF]">
                    <td className="py-4 px-4 font-bold">{att.studentName}</td>
                    <td className="py-4 px-4 font-mono text-[#6A6C88]">{att.regNo}</td>
                    <td className="py-4 px-4">{att.startedAt}</td>
                    <td className="py-4 px-4">
                      {att.flags > 0 ? (
                        <span className="bg-rose-100 text-rose-600 px-2.5 py-1 rounded-full font-bold">
                          {att.flags} Warning(s)
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold">0 Flags (Clean)</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {att.status === "IN_PROGRESS" && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[11px] font-bold">
                          In Progress
                        </span>
                      )}
                      {att.status === "AUTO_ENDED_CHEATING" && (
                        <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-[11px] font-bold">
                          Cheating Auto-Ended
                        </span>
                      )}
                      {att.status === "SUBMITTED" && (
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold">
                          Submitted ({att.score} pts)
                        </span>
                      )}
                      {att.status === "RETEST_APPROVED" && (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[11px] font-bold">
                          Retest Approved
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-[#6C5CE7] hover:underline font-bold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Log</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Retest Requests Review Queue */
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#8B8CF6]/20 shadow-xl shadow-[#8B8CF6]/5 space-y-6">
          <h3 className="font-serif-display text-2xl font-bold text-[#1E1F2B]">
            Pending Retest Approval Queue
          </h3>

          {retestRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-bold">
              No pending retest requests at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {retestRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#F6F7FF] rounded-2xl p-6 border border-[#8B8CF6]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-serif-display text-lg font-bold text-[#1E1F2B]">
                        {req.studentName}
                      </span>
                      <span className="text-xs font-mono text-[#6A6C88]">({req.regNo})</span>
                      <span className="bg-rose-100 text-rose-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        {req.flagType}
                      </span>
                    </div>

                    <p className="text-xs text-[#5A5C75] font-medium bg-white p-3 rounded-xl border border-[#8B8CF6]/15 max-w-2xl">
                      <span className="font-bold text-[#1E1F2B]">Reason Submitted: </span>
                      "{req.reason}"
                    </p>
                  </div>

                  {req.status === "PENDING" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveRetest(req.id, req.studentName)}
                        className="px-5 py-2.5 rounded-full bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all"
                      >
                        Approve Retest
                      </button>
                      <button
                        onClick={() => handleRejectRetest(req.id)}
                        className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-extrabold text-[#6C5CE7] bg-white px-4 py-2 rounded-full border border-[#6C5CE7]/30">
                      Status: {req.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
