import React, { useState } from "react";
import { Student } from "../types";
import { 
  GraduationCap, 
  Users, 
  Lock, 
  Sun, 
  Moon, 
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Key
} from "lucide-react";

interface LoginScreenProps {
  students: Student[];
  onAdminLogin: (password: string) => boolean;
  onStudentLogin: (studentId: string) => boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function LoginScreen({ 
  students, 
  onAdminLogin, 
  onStudentLogin, 
  darkMode, 
  toggleDarkMode 
}: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<"student" | "admin">("student");
  
  // Student states
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentError, setStudentError] = useState("");

  // Admin states
  const [passwordInput, setPasswordInput] = useState("");
  const [adminError, setAdminError] = useState("");

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError("");
    const trimmed = studentIdInput.trim();
    if (!trimmed) {
      setStudentError("Vui lòng nhập mã học sinh!");
      return;
    }

    const success = onStudentLogin(trimmed);
    if (!success) {
      setStudentError("Mã học sinh không tồn tại trong danh sách lớp. Hãy liên hệ giáo viên để được cấp mã!");
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    if (!passwordInput) {
      setAdminError("Vui lòng nhập mật khẩu quản trị viên!");
      return;
    }

    const success = onAdminLogin(passwordInput);
    if (!success) {
      setAdminError("Mật khẩu giáo viên không chính xác! Hãy kiểm tra lại hoặc sử dụng mật khẩu mặc định.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top bar for dark mode toggle only */}
      <header className="h-16 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-orange-400 p-1.5 text-white w-8 h-8 flex items-center justify-center font-bold text-base shadow-sm">
            Σ
          </div>
          <span className="font-display font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">LỚP TOÁN CÔ HÀ</span>
        </div>
        
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-blue-600" />}
        </button>
      </header>

      {/* Main Form Box */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
          
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl"></div>

          <div className="text-center space-y-2">
            <h1 className="font-display font-black text-xl md:text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LỚP TOÁN CÔ HÀ
            </h1>
            <p className="text-2xs text-slate-500 dark:text-slate-400 uppercase font-extrabold tracking-wider">
              Hệ thống ôn luyện & kiểm tra toán học
            </p>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 bg-slate-100/60 dark:bg-slate-950/60 p-1 rounded-2xl border border-slate-100 dark:border-slate-850">
            <button
              onClick={() => {
                setActiveTab("student");
                setStudentError("");
                setAdminError("");
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "student"
                  ? "bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400 font-extrabold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <GraduationCap className="h-4.5 w-4.5" /> Học sinh
            </button>
            <button
              onClick={() => {
                setActiveTab("admin");
                setStudentError("");
                setAdminError("");
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "admin"
                  ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-indigo-400 font-extrabold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Users className="h-4.5 w-4.5" /> Giáo viên
            </button>
          </div>

          {/* Tab 1: Student Login */}
          {activeTab === "student" && (
            <div className="space-y-4">
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Mã học sinh của em
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập mã học sinh (Ví dụ: HS001)"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    className="w-full text-xs font-bold p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white uppercase tracking-wider font-mono"
                  />
                </div>

                {studentError && (
                  <p className="text-2xs font-semibold text-rose-500 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-xl leading-relaxed">
                    <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" /> {studentError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  Vào ôn tập làm bài <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* Helpful sandbox hint with copy-pasteable codes */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/40 dark:bg-slate-950/20 space-y-2.5">
                <p className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-orange-400" /> Danh sách mã học sinh chạy thử:
                </p>
                <div className="grid grid-cols-2 gap-2 text-3xs text-slate-500 dark:text-slate-400 font-medium">
                  {students.slice(0, 4).map(st => (
                    <button
                      key={st.id}
                      onClick={() => setStudentIdInput(st.id)}
                      className="text-left p-2 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 transition-all flex flex-col"
                    >
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{st.id}</span>
                      <span className="truncate">{st.name} ({st.class})</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 italic text-center pt-1">
                  Bấm vào mã học sinh ở trên để tự động điền mã nhanh.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Admin Login */}
          {activeTab === "admin" && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Mật khẩu Giáo viên / Quản lý
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu quản trị viên"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full text-xs p-3.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {adminError && (
                <p className="text-2xs font-semibold text-rose-500 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-xl leading-relaxed">
                  <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" /> {adminError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                Vào bảng điều hành <ArrowRight className="h-4 w-4" />
              </button>

              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 bg-slate-50/10 text-center">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <Key className="h-3.5 w-3.5 text-indigo-400" /> Mật khẩu đăng nhập mặc định: <strong className="text-indigo-500 dark:text-indigo-400 font-mono font-bold">admin</strong> hoặc <strong className="text-indigo-500 dark:text-indigo-400 font-mono font-bold">123456</strong>
                </span>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Footer system status */}
      <footer className="h-10 text-[9px] text-slate-400 font-bold tracking-wider uppercase flex items-center justify-center border-t border-slate-100 dark:border-slate-850">
        AI Math v1.0.0-Stable • Bản quyền sư phạm Toán THCS
      </footer>

    </div>
  );
}
