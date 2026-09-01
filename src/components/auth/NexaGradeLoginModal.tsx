"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { 
  X, 
  GraduationCap, 
  ShieldAlert, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Code2, 
  Sparkles,
  CheckCircle2
} from "lucide-react";

interface NexaGradeLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: "STUDENT" | "TEACHER") => void;
}

const BRANCHES = [
  "CSE Core",
  "AI & ML",
  "Data Science",
  "Cyber Security",
  "Cloud Computing",
  "SE",
  "IT",
  "ECE",
  "EEE",
  "MECH",
];

export const NexaGradeLoginModal: React.FC<NexaGradeLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [portalRole, setPortalRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Student Fields
  const [studentLoginId, setStudentLoginId] = useState("");
  const [studentLoginPw, setStudentLoginPw] = useState("");

  const [studentName, setStudentName] = useState("");
  const [raNumber, setRaNumber] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentBranch, setStudentBranch] = useState("CSE Core");
  const [studentSection, setStudentSection] = useState("A1");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentConfirm, setStudentConfirm] = useState("");

  // Faculty Fields
  const [facultyLoginId, setFacultyLoginId] = useState("");
  const [facultyLoginPw, setFacultyLoginPw] = useState("");

  const [facultyName, setFacultyName] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [facultyEmail, setFacultyEmail] = useState("");
  const [facultySection, setFacultySection] = useState("A1");
  const [facultyPassword, setFacultyPassword] = useState("");
  const [facultyConfirm, setFacultyConfirm] = useState("");

  if (!isOpen) return null;

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        if (!studentLoginId.trim() || !studentLoginPw.trim()) {
          setErrorMsg("Please enter your RA Number / Email and Password");
          setIsSubmitting(false);
          return;
        }

        const loginIdentifier = studentLoginId.trim();
        const targetEmail = loginIdentifier.includes("@") ? loginIdentifier : `${loginIdentifier}@srmist.edu.in`;

        const res = await signIn("credentials", {
          loginId: loginIdentifier,
          email: targetEmail,
          password: studentLoginPw,
          role: "STUDENT",
          redirect: false,
        });

        if (res?.error) {
          setErrorMsg("Invalid Student credentials. If you haven't created an account, click 'Create New Account'.");
        } else {
          onSuccess("STUDENT");
          onClose();
        }
      } else {
        // Register Mode
        if (!studentName.trim() || !raNumber.trim() || !studentEmail.trim() || !studentPassword) {
          setErrorMsg("Please fill in all required registration fields");
          setIsSubmitting(false);
          return;
        }

        if (studentPassword !== studentConfirm) {
          setErrorMsg("Passwords do not match");
          setIsSubmitting(false);
          return;
        }

        // 1. Register user via dedicated API endpoint
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: studentEmail.trim(),
            name: studentName.trim(),
            regNo: raNumber.trim(),
            branch: studentBranch,
            role: "STUDENT",
            password: studentPassword,
          }),
        });

        const regData = await regRes.json();
        if (!regRes.ok || regData.error) {
          setErrorMsg(regData.error || "Failed to register student account");
          setIsSubmitting(false);
          return;
        }

        // 2. Authenticate session
        const res = await signIn("credentials", {
          loginId: raNumber.trim(),
          email: studentEmail.trim(),
          role: "STUDENT",
          redirect: false,
        });

        if (res?.error) {
          setErrorMsg("Account registered! Please switch to Sign In tab to log in.");
        } else {
          onSuccess("STUDENT");
          onClose();
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected authentication error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        if (!facultyLoginId.trim() || !facultyLoginPw.trim()) {
          setErrorMsg("Please enter your Faculty ID / Email and Password");
          setIsSubmitting(false);
          return;
        }

        const loginIdentifier = facultyLoginId.trim();
        const targetEmail = loginIdentifier.includes("@") ? loginIdentifier : `${loginIdentifier}@srmist.edu.in`;

        const res = await signIn("credentials", {
          loginId: loginIdentifier,
          email: targetEmail,
          password: facultyLoginPw,
          role: "TEACHER",
          redirect: false,
        });

        if (res?.error) {
          setErrorMsg("Invalid Faculty credentials. If you haven't created an account, click 'Create New Account'.");
        } else {
          onSuccess("TEACHER");
          onClose();
        }
      } else {
        // Register Mode
        if (!facultyName.trim() || !facultyId.trim() || !facultyEmail.trim() || !facultyPassword) {
          setErrorMsg("Please fill in all required faculty fields");
          setIsSubmitting(false);
          return;
        }

        if (facultyPassword !== facultyConfirm) {
          setErrorMsg("Passwords do not match");
          setIsSubmitting(false);
          return;
        }

        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: facultyEmail.trim(),
            name: facultyName.trim(),
            regNo: facultyId.trim(),
            role: "TEACHER",
            password: facultyPassword,
          }),
        });

        const regData = await regRes.json();
        if (!regRes.ok || regData.error) {
          setErrorMsg(regData.error || "Failed to register faculty account");
          setIsSubmitting(false);
          return;
        }

        const res = await signIn("credentials", {
          loginId: facultyId.trim(),
          email: facultyEmail.trim(),
          role: "TEACHER",
          redirect: false,
        });

        if (res?.error) {
          setErrorMsg("Faculty account registered! Please switch to Sign In tab to log in.");
        } else {
          onSuccess("TEACHER");
          onClose();
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected authentication error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111115] rounded-[32px] p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-[#27272a] shadow-2xl relative space-y-5 text-slate-900 dark:text-slate-100 max-h-[92vh] overflow-y-auto font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
            <Code2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            NexaGrade Portal Login
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            SRM IST Competitive Coding Ranking & Performance Portal
          </p>
        </div>

        {/* Role Portal Toggle Switch */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#18181f] rounded-2xl border border-slate-200 dark:border-[#27272a]">
          <button
            type="button"
            onClick={() => { setPortalRole("STUDENT"); setErrorMsg(null); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              portalRole === "STUDENT"
                ? "bg-white dark:bg-amber-500 text-slate-900 dark:text-black shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => { setPortalRole("TEACHER"); setErrorMsg(null); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              portalRole === "TEACHER"
                ? "bg-white dark:bg-amber-500 text-slate-900 dark:text-black shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Faculty Portal</span>
          </button>
        </div>

        {/* Login vs Register Inner Switch */}
        <div className="flex items-center justify-center gap-4 text-xs font-bold border-b border-slate-200 dark:border-[#27272a] pb-3">
          <button
            type="button"
            onClick={() => { setMode("login"); setErrorMsg(null); }}
            className={`pb-1 transition border-b-2 ${
              mode === "login"
                ? "border-blue-500 dark:border-amber-400 text-blue-600 dark:text-amber-400 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In to Portal
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setErrorMsg(null); }}
            className={`pb-1 transition border-b-2 ${
              mode === "register"
                ? "border-blue-500 dark:border-amber-400 text-blue-600 dark:text-amber-400 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Student Form */}
        {portalRole === "STUDENT" ? (
          <form onSubmit={handleStudentSubmit} className="space-y-3.5 text-left text-xs">
            {mode === "login" ? (
              <>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    RA Number or SRM Email
                  </label>
                  <input
                    type="text"
                    required
                    value={studentLoginId}
                    onChange={(e) => setStudentLoginId(e.target.value)}
                    placeholder="e.g. RA2111003010142 or student@srmist.edu.in"
                    className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-3 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={studentLoginPw}
                      onChange={(e) => setStudentLoginPw(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-3 pr-10 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Student Register
              <>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Full Student Name
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      RA Number
                    </label>
                    <input
                      type="text"
                      required
                      value={raNumber}
                      onChange={(e) => setRaNumber(e.target.value)}
                      placeholder="RA2111003010142"
                      className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-2.5 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Branch
                    </label>
                    <select
                      value={studentBranch}
                      onChange={(e) => setStudentBranch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    SRM Student Email
                  </label>
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="name@srmist.edu.in"
                    className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Domain restricted: @srmist.edu.in</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-2.5 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={studentConfirm}
                      onChange={(e) => setStudentConfirm(e.target.value)}
                      placeholder="Confirm"
                      className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-2.5 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:bg-none dark:bg-amber-500 hover:dark:bg-amber-400 text-white dark:text-black font-extrabold text-xs shadow-lg transition-all"
            >
              {isSubmitting ? "Authenticating..." : mode === "login" ? "Sign In to Student Portal" : "Register Student Account"}
            </button>
          </form>
        ) : (
          // Faculty Form
          <form onSubmit={handleFacultySubmit} className="space-y-3.5 text-left text-xs">
            {mode === "login" ? (
              <>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Faculty ID or Official Email
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyLoginId}
                    onChange={(e) => setFacultyLoginId(e.target.value)}
                    placeholder="e.g. EMP-1049 or faculty@srmist.edu.in"
                    className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-3 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={facultyLoginPw}
                      onChange={(e) => setFacultyLoginPw(e.target.value)}
                      placeholder="Enter faculty password"
                      className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-3 pr-10 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Faculty Register
              <>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Full Faculty Name
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    placeholder="Dr. Full Name"
                    className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Faculty / Employee ID
                    </label>
                    <input
                      type="text"
                      required
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      placeholder="EMP-1049"
                      className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-2.5 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Official Email
                    </label>
                    <input
                      type="email"
                      required
                      value={facultyEmail}
                      onChange={(e) => setFacultyEmail(e.target.value)}
                      placeholder="faculty@srmist.edu.in"
                      className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={facultyPassword}
                      onChange={(e) => setFacultyPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-2.5 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={facultyConfirm}
                      onChange={(e) => setFacultyConfirm(e.target.value)}
                      placeholder="Confirm"
                      className="w-full bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] rounded-xl p-2.5 font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-black font-extrabold text-xs shadow-lg transition-all"
            >
              {isSubmitting ? "Authenticating..." : mode === "login" ? "Sign In to Faculty Portal" : "Register Faculty Account"}
            </button>
          </form>
        )}

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-[#27272a]"></div>
          <span className="flex-shrink mx-3 text-[10px] font-bold uppercase text-slate-400">
            Or SRM Single Sign-On
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-[#27272a]"></div>
        </div>

        <button
          type="button"
          onClick={() => signIn("google")}
          className="w-full py-3 rounded-xl bg-slate-50 dark:bg-[#18181f] border border-slate-200 dark:border-[#27272a] text-slate-800 dark:text-slate-200 font-extrabold text-xs flex items-center justify-center gap-3 transition-all hover:bg-slate-100 dark:hover:bg-[#202029]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign In with SRM Google Account</span>
        </button>
      </div>
    </div>
  );
};
