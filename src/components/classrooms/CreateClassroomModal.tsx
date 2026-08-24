"use client";

import React, { useState } from "react";
import { Plus, X, Users, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateClassroomModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [studentEmails, setStudentEmails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, section, studentEmails }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Classroom created! Enrolled ${data.enrolledCount} students.`);
        setTimeout(() => {
          setIsOpen(false);
          setSuccessMsg("");
          setName("");
          setSection("");
          setStudentEmails("");
          router.refresh(); // Refresh server component
        }, 2000);
      } else {
        alert(data.error || "Failed to create classroom");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating classroom");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 rounded-full bg-[#6C5CE7] hover:bg-[#5A4AD1] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 hover:scale-105"
      >
        <Plus className="w-4 h-4" />
        <span>Create New Classroom</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#161723]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F6F7FF] hover:bg-[#EAEBFF] flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif-display text-2xl font-bold text-[#1E1F2B]">Create Classroom</h2>
                <p className="text-xs text-[#6A6C88] font-medium">Add a new class and bulk enroll students.</p>
              </div>
            </div>

            {successMsg ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <span className="font-bold">{successMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-[#6C5CE7] tracking-wider block mb-1">
                      Class Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Data Structures"
                      className="w-full bg-[#F6F7FF] p-3 rounded-2xl border border-[#8B8CF6]/30 text-sm font-medium text-[#1E1F2B] outline-none focus:border-[#6C5CE7]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold uppercase text-[#3B82F6] tracking-wider block mb-1">
                      Section
                    </label>
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="e.g. CS-A1"
                      className="w-full bg-[#F6F6FF] p-3 rounded-2xl border border-[#8B8CF6]/30 text-sm font-medium text-[#1E1F2B] outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase text-[#1E1F2B] tracking-wider block mb-1">
                    Bulk Add Students (Emails)
                  </label>
                  <p className="text-[10px] text-[#6A6C88] mb-2">Paste comma or newline separated college email addresses.</p>
                  <textarea
                    rows={4}
                    value={studentEmails}
                    onChange={(e) => setStudentEmails(e.target.value)}
                    placeholder="student1@college.edu, student2@college.edu"
                    className="w-full bg-[#F6F7FF] p-3 rounded-2xl border border-[#8B8CF6]/30 text-xs font-mono text-[#1E1F2B] outline-none focus:border-[#6C5CE7] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full bg-[#1E1F2B] hover:bg-[#2A2B3D] text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Creating..." : "Create Classroom"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
