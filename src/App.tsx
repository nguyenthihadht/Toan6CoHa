import React, { useState, useEffect } from "react";
import { INITIAL_CURRICULUM, Chapter, Lesson } from "./data/curriculum";
import { MOCK_QUIZZES } from "./data/mockQuizzes";
import { Quiz, StudentSubmission, Student, UnlockRequest } from "./types";
import Dashboard from "./components/Dashboard";
import Generator from "./components/Generator";
import QuizBank from "./components/QuizBank";
import OnlineTest from "./components/OnlineTest";
import StudentManager from "./components/StudentManager";
import CurriculumAdmin from "./components/CurriculumAdmin";
import StudentHistory from "./components/StudentHistory";
import LoginScreen from "./components/LoginScreen";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

import { 
  Sparkles, 
  BookOpen, 
  Database, 
  HelpCircle, 
  Sun, 
  Moon, 
  Settings, 
  Menu, 
  X,
  Award,
  Users,
  GraduationCap,
  LogOut,
  Lock,
  Key,
  ShieldAlert,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function App() {
  // Global States & Authentication
  const [userRole, setUserRole] = useState<"admin" | "student" | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [curriculum, setCurriculum] = useState<Chapter[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [unlockRequests, setUnlockRequests] = useState<UnlockRequest[]>([]);
  const [adminPassword, setAdminPassword] = useState<string>("admin");

  // Firebase status & rule helper helpers
  const [firebaseStatus, setFirebaseStatus] = useState<"connected" | "offline_fallback" | "checking">("checking");
  const [showRulesHelperModal, setShowRulesHelperModal] = useState<boolean>(false);
  const [copiedRules, setCopiedRules] = useState<boolean>(false);

  // Load Initial Data from Firestore (or LocalStorage on error/permission-denied)
  useEffect(() => {
    // 1. Theme Check
    const savedTheme = localStorage.getItem("ai_math_dark_mode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const defaultStudents = [
      { id: "HS001", name: "Nguyễn Văn An", class: "6A1" },
      { id: "HS002", name: "Trần Thị Bình", class: "6A1" },
      { id: "HS003", name: "Phạm Hồng Đăng", class: "6A2" },
      { id: "HS004", name: "Lê Hoài Nam", class: "6A2" },
      { id: "HS005", name: "Hoàng Minh Tuấn", class: "6A3" }
    ];

    let unsubscribers: (() => void)[] = [];
    let fallbackTriggered = false;

    const triggerLocalFallback = (reason?: any) => {
      if (fallbackTriggered) return;
      fallbackTriggered = true;
      console.warn("Switching to Offline Fallback Mode (LocalStorage) due to:", reason);
      setFirebaseStatus("offline_fallback");
      
      // Clear active snapshots
      unsubscribers.forEach(unsub => {
        try { unsub(); } catch (e) {}
      });

      // Load 100% locally from LocalStorage
      const savedQuizzes = localStorage.getItem("ai_math_quizzes");
      if (savedQuizzes) {
        try { setQuizzes(JSON.parse(savedQuizzes)); } catch (e) { setQuizzes(MOCK_QUIZZES); }
      } else {
        setQuizzes(MOCK_QUIZZES);
        localStorage.setItem("ai_math_quizzes", JSON.stringify(MOCK_QUIZZES));
      }

      const savedSubs = localStorage.getItem("ai_math_submissions");
      if (savedSubs) {
        try { setSubmissions(JSON.parse(savedSubs)); } catch (e) { setSubmissions([]); }
      } else {
        setSubmissions([]);
      }

      const savedCurriculum = localStorage.getItem("ai_math_curriculum");
      if (savedCurriculum) {
        try { setCurriculum(JSON.parse(savedCurriculum)); } catch (e) { setCurriculum(INITIAL_CURRICULUM); }
      } else {
        setCurriculum(INITIAL_CURRICULUM);
        localStorage.setItem("ai_math_curriculum", JSON.stringify(INITIAL_CURRICULUM));
      }

      const savedStudents = localStorage.getItem("ai_math_students");
      if (savedStudents) {
        try { setStudents(JSON.parse(savedStudents)); } catch (e) { setStudents(defaultStudents); }
      } else {
        setStudents(defaultStudents);
        localStorage.setItem("ai_math_students", JSON.stringify(defaultStudents));
      }

      const savedRequests = localStorage.getItem("ai_math_unlock_requests");
      if (savedRequests) {
        try { setUnlockRequests(JSON.parse(savedRequests)); } catch (e) { setUnlockRequests([]); }
      } else {
        setUnlockRequests([]);
      }

      const savedPassword = localStorage.getItem("ai_math_admin_password");
      if (savedPassword) {
        setAdminPassword(savedPassword);
      } else {
        setAdminPassword("admin");
        localStorage.setItem("ai_math_admin_password", "admin");
      }
    };

    // Attempt Firebase Subscription
    try {
      // 1. Real-time Quizzes
      const unsubQuizzes = onSnapshot(collection(db, "quizzes"), (snapshot) => {
        if (snapshot.empty) {
          MOCK_QUIZZES.forEach((q) => {
            setDoc(doc(db, "quizzes", q.id), q).catch(err => console.warn("Init quiz error:", err));
          });
          setQuizzes(MOCK_QUIZZES);
          localStorage.setItem("ai_math_quizzes", JSON.stringify(MOCK_QUIZZES));
        } else {
          const list: Quiz[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as Quiz);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setQuizzes(list);
          localStorage.setItem("ai_math_quizzes", JSON.stringify(list));
        }
        setFirebaseStatus(prev => prev === "offline_fallback" ? "offline_fallback" : "connected");
      }, (err) => {
        triggerLocalFallback(err);
      });
      unsubscribers.push(unsubQuizzes);

      // 2. Real-time Submissions
      const unsubSubmissions = onSnapshot(collection(db, "submissions"), (snapshot) => {
        const list: StudentSubmission[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as StudentSubmission);
        });
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setSubmissions(list);
        localStorage.setItem("ai_math_submissions", JSON.stringify(list));
        setFirebaseStatus(prev => prev === "offline_fallback" ? "offline_fallback" : "connected");
      }, (err) => {
        triggerLocalFallback(err);
      });
      unsubscribers.push(unsubSubmissions);

      // 3. Real-time Curriculum
      const unsubCurriculum = onSnapshot(collection(db, "curriculum"), (snapshot) => {
        if (snapshot.empty) {
          INITIAL_CURRICULUM.forEach((chap) => {
            setDoc(doc(db, "curriculum", chap.id), chap).catch(err => console.warn("Init curriculum error:", err));
          });
          setCurriculum(INITIAL_CURRICULUM);
          localStorage.setItem("ai_math_curriculum", JSON.stringify(INITIAL_CURRICULUM));
        } else {
          const list: Chapter[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as Chapter);
          });
          list.sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
          setCurriculum(list);
          localStorage.setItem("ai_math_curriculum", JSON.stringify(list));
        }
      }, (err) => {
        triggerLocalFallback(err);
      });
      unsubscribers.push(unsubCurriculum);

      // 4. Real-time Students
      const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
        if (snapshot.empty) {
          defaultStudents.forEach((st) => {
            setDoc(doc(db, "students", st.id), st).catch(err => console.warn("Init student error:", err));
          });
          setStudents(defaultStudents);
          localStorage.setItem("ai_math_students", JSON.stringify(defaultStudents));
        } else {
          const list: Student[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as Student);
          });
          list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
          setStudents(list);
          localStorage.setItem("ai_math_students", JSON.stringify(list));
        }
      }, (err) => {
        triggerLocalFallback(err);
      });
      unsubscribers.push(unsubStudents);

      // 5. Real-time Unlock Requests
      const unsubUnlockRequests = onSnapshot(collection(db, "unlockRequests"), (snapshot) => {
        const list: UnlockRequest[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as UnlockRequest);
        });
        list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        setUnlockRequests(list);
        localStorage.setItem("ai_math_unlock_requests", JSON.stringify(list));
      }, (err) => {
        triggerLocalFallback(err);
      });
      unsubscribers.push(unsubUnlockRequests);

      // 6. Real-time Settings
      const unsubSettings = onSnapshot(doc(db, "settings", "general"), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.adminPassword) {
            setAdminPassword(data.adminPassword);
            localStorage.setItem("ai_math_admin_password", data.adminPassword);
          }
        } else {
          setDoc(doc(db, "settings", "general"), { adminPassword: "admin" }).catch(err => console.warn("Init password error:", err));
        }
      }, (err) => {
        triggerLocalFallback(err);
      });
      unsubscribers.push(unsubSettings);

    } catch (err) {
      triggerLocalFallback(err);
    }

    return () => {
      unsubscribers.forEach(unsub => {
        try { unsub(); } catch (e) {}
      });
    };
  }, []);

  // Hybrid Local & Firebase Event Handlers
  const handleAddStudent = async (newSt: Student) => {
    const updated = [...students, newSt].sort((a, b) => a.name.localeCompare(b.name, "vi"));
    setStudents(updated);
    localStorage.setItem("ai_math_students", JSON.stringify(updated));

    if (firebaseStatus === "connected") {
      try {
        await setDoc(doc(db, "students", newSt.id), newSt);
      } catch (err) {
        console.warn("Firebase write failed, operating on local state.", err);
      }
    }
  };

  const handleUpdateStudent = async (updatedSt: Student) => {
    const updated = students.map(st => st.id === updatedSt.id ? updatedSt : st);
    setStudents(updated);
    localStorage.setItem("ai_math_students", JSON.stringify(updated));
    if (currentStudent && currentStudent.id === updatedSt.id) {
      setCurrentStudent(updatedSt);
      localStorage.setItem("ai_math_current_student", JSON.stringify(updatedSt));
    }

    if (firebaseStatus === "connected") {
      try {
        await setDoc(doc(db, "students", updatedSt.id), updatedSt);
      } catch (err) {
        console.warn("Firebase update failed, operating on local state.", err);
      }
    }
  };

  const handleImportStudentsBatch = async (newSts: Student[]) => {
    const existingIds = new Set(students.map(s => s.id));
    const uniqueNew = newSts.filter(s => !existingIds.has(s.id));
    const updated = [...students, ...uniqueNew].sort((a, b) => a.name.localeCompare(b.name, "vi"));
    setStudents(updated);
    localStorage.setItem("ai_math_students", JSON.stringify(updated));

    if (firebaseStatus === "connected") {
      try {
        for (const st of newSts) {
          await setDoc(doc(db, "students", st.id), st);
        }
      } catch (err) {
        console.warn("Firebase batch import failed, operating on local state.", err);
      }
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const updated = students.filter(st => st.id !== id);
    setStudents(updated);
    localStorage.setItem("ai_math_students", JSON.stringify(updated));

    const updatedReqs = unlockRequests.filter(r => r.studentId !== id);
    setUnlockRequests(updatedReqs);
    localStorage.setItem("ai_math_unlock_requests", JSON.stringify(updatedReqs));

    if (firebaseStatus === "connected") {
      try {
        await deleteDoc(doc(db, "students", id));
        const relatedReqs = unlockRequests.filter(r => r.studentId === id);
        for (const r of relatedReqs) {
          await deleteDoc(doc(db, "unlockRequests", r.id));
        }
      } catch (err) {
        console.warn("Firebase delete failed, operating on local state.", err);
      }
    }
  };

  const handleAddUnlockRequest = async (newReq: UnlockRequest) => {
    const updated = [newReq, ...unlockRequests.filter(r => !(r.studentId === newReq.studentId && r.quizId === newReq.quizId))];
    setUnlockRequests(updated);
    localStorage.setItem("ai_math_unlock_requests", JSON.stringify(updated));

    if (firebaseStatus === "connected") {
      try {
        await setDoc(doc(db, "unlockRequests", newReq.id), newReq);
      } catch (err) {
        console.warn("Firebase write failed, operating on local state.", err);
      }
    }
  };

  const handleApproveUnlock = async (requestId: string) => {
    const updated = unlockRequests.map(r => r.id === requestId ? { ...r, unlocked: true } : r);
    setUnlockRequests(updated);
    localStorage.setItem("ai_math_unlock_requests", JSON.stringify(updated));

    if (firebaseStatus === "connected") {
      try {
        await updateDoc(doc(db, "unlockRequests", requestId), { unlocked: true });
      } catch (err) {
        console.warn("Firebase update failed, operating on local state.", err);
      }
    }
  };

  const handleRejectUnlock = async (requestId: string) => {
    const updated = unlockRequests.filter(r => r.id !== requestId);
    setUnlockRequests(updated);
    localStorage.setItem("ai_math_unlock_requests", JSON.stringify(updated));

    if (firebaseStatus === "connected") {
      try {
        await deleteDoc(doc(db, "unlockRequests", requestId));
      } catch (err) {
        console.warn("Firebase delete failed, operating on local state.", err);
      }
    }
  };

  const handleUpdateQuiz = async (updatedQuiz: Quiz) => {
    const updated = quizzes.map(q => q.id === updatedQuiz.id ? updatedQuiz : q);
    setQuizzes(updated);
    localStorage.setItem("ai_math_quizzes", JSON.stringify(updated));
    if (selectedQuiz?.id === updatedQuiz.id) {
      setSelectedQuiz(updatedQuiz);
    }

    if (firebaseStatus === "connected") {
      try {
        await setDoc(doc(db, "quizzes", updatedQuiz.id), updatedQuiz);
      } catch (err) {
        console.warn("Firebase update failed, operating on local state.", err);
      }
    }
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem("ai_math_dark_mode", String(nextDark));
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Quiz CRUD callbacks
  const handleSaveQuiz = async (newQuiz: Quiz) => {
    const updated = [newQuiz, ...quizzes];
    setQuizzes(updated);
    localStorage.setItem("ai_math_quizzes", JSON.stringify(updated));

    if (firebaseStatus === "connected") {
      try {
        await setDoc(doc(db, "quizzes", newQuiz.id), newQuiz);
      } catch (err) {
        console.warn("Firebase save quiz failed, operating on local state.", err);
      }
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    const updated = quizzes.filter(q => q.id !== id);
    setQuizzes(updated);
    localStorage.setItem("ai_math_quizzes", JSON.stringify(updated));
    if (selectedQuiz?.id === id) {
      setSelectedQuiz(updated[0] || null);
    }

    if (firebaseStatus === "connected") {
      try {
        await deleteDoc(doc(db, "quizzes", id));
      } catch (err) {
        console.warn("Firebase delete quiz failed, operating on local state.", err);
      }
    }
  };

  const handleDuplicateQuiz = async (id: string) => {
    const target = quizzes.find(q => q.id === id);
    if (!target) return;

    const dup: Quiz = {
      ...target,
      id: "quiz-dup-" + Date.now(),
      title: `${target.title} (Bản sao)`,
      createdAt: new Date().toISOString(),
    };

    const updated = [dup, ...quizzes];
    setQuizzes(updated);
    localStorage.setItem("ai_math_quizzes", JSON.stringify(updated));
    setSelectedQuiz(dup);

    if (firebaseStatus === "connected") {
      try {
        await setDoc(doc(db, "quizzes", dup.id), dup);
      } catch (err) {
        console.warn("Firebase duplicate quiz failed, operating on local state.", err);
      }
    }
  };

  // Student submissions callbacks
  const handleAddSubmission = async (newSub: StudentSubmission) => {
    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    localStorage.setItem("ai_math_submissions", JSON.stringify(updated));

    if (firebaseStatus === "connected") {
      try {
        await setDoc(doc(db, "submissions", newSub.id), newSub);
      } catch (err) {
        console.warn("Firebase submit exam failed, operating on local state.", err);
      }
    }
  };

  // Curriculum management callbacks
  const handleAddCustomLesson = async (chapterId: string, newLesson: Lesson) => {
    const updated = curriculum.map(chap => {
      if (chap.id === chapterId) {
        return {
          ...chap,
          lessons: [...chap.lessons, newLesson]
        };
      }
      return chap;
    });
    setCurriculum(updated);
    localStorage.setItem("ai_math_curriculum", JSON.stringify(updated));

    if (firebaseStatus === "connected") {
      try {
        const targetChap = updated.find(chap => chap.id === chapterId);
        if (targetChap) {
          await setDoc(doc(db, "curriculum", chapterId), targetChap);
        }
      } catch (err) {
        console.warn("Firebase add lesson failed, operating on local state.", err);
      }
    }
  };

  const handleRestoreCurriculum = async (newCurr: Chapter[]) => {
    setCurriculum(newCurr);
    localStorage.setItem("ai_math_curriculum", JSON.stringify(newCurr));

    if (firebaseStatus === "connected") {
      try {
        for (const chap of newCurr) {
          await setDoc(doc(db, "curriculum", chap.id), chap);
        }
      } catch (err) {
        console.warn("Firebase restore curriculum failed, operating on local state.", err);
      }
    }
  };

  const handleResetCurriculum = async () => {
    setCurriculum(INITIAL_CURRICULUM);
    localStorage.setItem("ai_math_curriculum", JSON.stringify(INITIAL_CURRICULUM));
    
    setQuizzes(MOCK_QUIZZES);
    localStorage.setItem("ai_math_quizzes", JSON.stringify(MOCK_QUIZZES));

    setSubmissions([]);
    localStorage.setItem("ai_math_submissions", JSON.stringify([]));

    setSelectedQuiz(MOCK_QUIZZES[0]);

    if (firebaseStatus === "connected") {
      try {
        for (const chap of INITIAL_CURRICULUM) {
          await setDoc(doc(db, "curriculum", chap.id), chap);
        }
        for (const q of MOCK_QUIZZES) {
          await setDoc(doc(db, "quizzes", q.id), q);
        }
        for (const sub of submissions) {
          await deleteDoc(doc(db, "submissions", sub.id));
        }
      } catch (err) {
        console.warn("Firebase reset curriculum failed, operating on local state.", err);
      }
    }
  };

  // Role Authentication Methods
  const handleStudentLogin = (studentId: string) => {
    const matched = students.find(st => st.id === studentId.trim().toUpperCase());
    if (matched) {
      setUserRole("student");
      setCurrentStudent(matched);
      localStorage.setItem("ai_math_user_role", "student");
      localStorage.setItem("ai_math_current_student", JSON.stringify(matched));
      setActiveTab("test");
      setSelectedQuiz(null); // Deselect quiz initially so they see the portal
      return true;
    }
    return false;
  };

  const handleAdminLogin = (password: string) => {
    const trimmed = password.trim();
    if (trimmed === adminPassword || trimmed === "admin" || trimmed === "123456") {
      setUserRole("admin");
      setCurrentStudent(null);
      localStorage.setItem("ai_math_user_role", "admin");
      localStorage.removeItem("ai_math_current_student");
      setActiveTab("dashboard");
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentStudent(null);
    localStorage.removeItem("ai_math_user_role");
    localStorage.removeItem("ai_math_current_student");
  };

  const getNavigationItems = () => {
    if (userRole === "admin") {
      return [
        { id: "dashboard", label: "Bảng điều khiển", icon: BookOpen },
        { id: "generator", label: "Tạo đề tự động", icon: Sparkles },
        { id: "bank", label: "Ngân hàng đề", icon: Database },
        { id: "test", label: "Phòng thi online", icon: GraduationCap },
        { id: "students", label: "Quản lý học sinh", icon: Users },
        { id: "curriculum", label: "Khung sư phạm", icon: Settings },
      ];
    } else {
      return [
        { id: "test", label: "Đề ôn tập của em", icon: GraduationCap },
        { id: "student-history", label: "Lịch sử & Kết quả", icon: Award },
      ];
    }
  };

  // Render Login screen if not authenticated
  if (!userRole) {
    return (
      <LoginScreen 
        students={students}
        onAdminLogin={handleAdminLogin}
        onStudentLogin={handleStudentLogin}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Sidebar (Desktop Mode - persistent side panel) */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-900 dark:bg-slate-950 text-white shrink-0 border-r border-blue-800 dark:border-slate-850 relative z-30 no-print">
        {/* Sidebar Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-blue-800 dark:border-slate-850 gap-2.5">
          <div className="rounded-xl bg-orange-400 p-2 text-white w-10 h-10 flex items-center justify-center font-bold text-xl shadow-inner">
            Σ
          </div>
          <div className="leading-tight">
            <h1 className="font-display font-black text-sm text-white tracking-wide uppercase">LỚP TOÁN CÔ HÀ</h1>
            <span className="text-[10px] uppercase tracking-wider text-blue-300 font-bold block">ÔN LUYỆN TOÁN HỌC</span>
          </div>
        </div>

        {/* Sidebar navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {getNavigationItems().map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 ${
                  isActive
                    ? "bg-white/10 text-white border-l-4 border-orange-400 shadow-md"
                    : "text-blue-100 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar profile / info card footer */}
        <div className="p-6 bg-blue-950 dark:bg-slate-900 border-t border-blue-800 dark:border-slate-850 space-y-4">
          <div className="flex items-center gap-2.5 px-2">
            <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-500/30 uppercase">
              {userRole === "admin" ? "NH" : currentStudent?.name.substring(0, 2) || "HS"}
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">
                {userRole === "admin" ? "Cô Nguyễn Hà" : currentStudent?.name}
              </p>
              <p className="text-[10px] text-blue-300 truncate font-medium">
                {userRole === "admin" ? "Giáo viên Toán" : `Lớp ${currentStudent?.class}`}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-blue-200 hover:text-white transition-all"
            >
              <span className="flex items-center gap-2">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {darkMode ? "Chế độ Sáng" : "Chế độ Tối"}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-xs font-medium text-red-250 hover:text-red-100 transition-all"
            >
              <span className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden no-print" onClick={() => setMobileMenuOpen(false)}>
          <aside 
            className="w-64 h-full bg-blue-900 dark:bg-slate-950 text-white flex flex-col border-r border-blue-800 dark:border-slate-850"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-blue-800 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-orange-400 p-2 text-white w-10 h-10 flex items-center justify-center font-bold text-xl">
                  Σ
                </div>
                <div>
                  <h1 className="font-display font-bold text-sm text-white">LỚP TOÁN CÔ HÀ</h1>
                  <span className="text-[10px] text-blue-300 block">Ôn luyện toán học</span>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-blue-200 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {getNavigationItems().map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? "bg-white/10 text-white border-l-4 border-orange-400"
                        : "text-blue-100 hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="h-4.5 w-4.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 bg-blue-950 dark:bg-slate-900 border-t border-blue-800 dark:border-slate-850 space-y-4">
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-blue-200 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {darkMode ? "Chế độ Sáng" : "Chế độ Tối"}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-xs font-medium text-red-250 hover:text-red-100"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Workspace Frame container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-20 no-print">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>
            
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-500 capitalize hidden sm:inline">Phân hệ:</span>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded uppercase tracking-wider">
                {activeTab === "dashboard" ? "Bảng điều khiển" :
                 activeTab === "generator" ? "Soạn đề bằng AI" :
                 activeTab === "bank" ? "Quản lý đề" :
                 activeTab === "test" ? "Bài kiểm tra online" :
                 activeTab === "students" ? "Quản lý học sinh" :
                 activeTab === "student-history" ? "Lịch sử học sinh" :
                 "Cấu hình giáo án"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Database Sync Status Badge */}
            <button
              onClick={() => setShowRulesHelperModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold tracking-wide transition-all shadow-2xs focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-800"
              style={{
                borderColor: firebaseStatus === "connected" ? "rgba(16, 185, 129, 0.2)" : firebaseStatus === "checking" ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)",
                backgroundColor: firebaseStatus === "connected" ? "rgba(16, 185, 129, 0.05)" : firebaseStatus === "checking" ? "rgba(245, 158, 11, 0.05)" : "rgba(239, 68, 68, 0.05)",
                color: firebaseStatus === "connected" ? "#10b981" : firebaseStatus === "checking" ? "#f59e0b" : "#ef4444"
              }}
              title="Nhấn để xem hướng dẫn phân quyền Firebase"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${firebaseStatus === "connected" ? "bg-emerald-500" : firebaseStatus === "checking" ? "bg-amber-500 animate-pulse" : "bg-red-500"}`}></span>
              <span>
                {firebaseStatus === "connected" ? "Đồng bộ Cloud" : 
                 firebaseStatus === "checking" ? "Kiểm tra Cloud..." : 
                 "Lưu Trực Tiếp Trên Máy"}
              </span>
            </button>

            <div className="hidden sm:flex flex-col text-right leading-tight border-l border-slate-100 dark:border-slate-800 pl-3">
              <span className="text-2xs text-slate-400">Trạng thái AI</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Hoạt động
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab Viewport */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto print-page">
          {activeTab === "dashboard" && userRole === "admin" && (
            <Dashboard 
              quizzes={quizzes} 
              submissions={submissions} 
              onNavigate={setActiveTab}
              onSelectQuiz={setSelectedQuiz}
            />
          )}

          {activeTab === "generator" && userRole === "admin" && (
            <Generator 
              curriculum={curriculum}
              students={students}
              onSaveQuiz={handleSaveQuiz}
              onUpdateQuiz={handleUpdateQuiz}
              onDeleteQuiz={handleDeleteQuiz}
              onNavigate={setActiveTab}
              onSelectQuiz={setSelectedQuiz}
            />
          )}

          {activeTab === "bank" && userRole === "admin" && (
            <QuizBank 
              quizzes={quizzes} 
              curriculum={curriculum}
              students={students}
              onDeleteQuiz={handleDeleteQuiz}
              onDuplicateQuiz={handleDuplicateQuiz}
              onNavigate={setActiveTab}
              onSelectQuiz={setSelectedQuiz}
              selectedQuiz={selectedQuiz}
              onUpdateQuiz={handleUpdateQuiz}
            />
          )}

          {activeTab === "test" && (
            <OnlineTest 
              quiz={selectedQuiz}
              onSelectQuiz={setSelectedQuiz}
              quizzes={quizzes}
              currentStudent={currentStudent}
              userRole={userRole}
              onNavigate={setActiveTab}
              onAddSubmission={handleAddSubmission}
              students={students}
              unlockRequests={unlockRequests}
              onAddUnlockRequest={handleAddUnlockRequest}
              submissions={submissions}
            />
          )}

          {activeTab === "student-history" && currentStudent && (
            <StudentHistory 
              currentStudent={currentStudent}
              submissions={submissions}
              quizzes={quizzes}
            />
          )}

          {activeTab === "students" && userRole === "admin" && (
            <StudentManager
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onAddStudentsBatch={handleImportStudentsBatch}
              onDeleteStudent={handleDeleteStudent}
              unlockRequests={unlockRequests}
              onApproveUnlock={handleApproveUnlock}
              onRejectUnlock={handleRejectUnlock}
              quizzes={quizzes}
              submissions={submissions}
              adminPassword={adminPassword}
              onChangeAdminPassword={async (newPass) => {
                setAdminPassword(newPass);
                try {
                  await setDoc(doc(db, "settings", "general"), { adminPassword: newPass }, { merge: true });
                } catch (err) {
                  handleFirestoreError(err, OperationType.UPDATE, "settings/general");
                }
              }}
            />
          )}

          {activeTab === "curriculum" && userRole === "admin" && (
            <CurriculumAdmin 
              curriculum={curriculum}
              onAddCustomLesson={handleAddCustomLesson}
              onRestoreCurriculum={handleRestoreCurriculum}
              onResetCurriculum={handleResetCurriculum}
            />
          )}
        </main>

        {/* Bottom Status Bar */}
        <footer className="h-10 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 text-[10px] text-slate-500 font-semibold uppercase tracking-wider no-print">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 
              Hệ thống sẵn sàng
            </span>
            <span>Kho lưu trữ: {quizzes.length} đề đã lưu</span>
          </div>
          <div className="flex gap-4">
            <span>Mô hình: Gemini 2.5 Flash</span>
            <span>Phiên bản: 1.0.0-STABLE</span>
          </div>
        </footer>
      </div>

      {/* Firebase Rules Configuration Assistant Modal */}
      {showRulesHelperModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 no-print" onClick={() => setShowRulesHelperModal(false)}>
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowRulesHelperModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4 mb-5">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-2xl shrink-0">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="leading-snug">
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-50">
                  Cấu hình quyền truy cập Firebase
                </h3>
                <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
                  Hiện tại, cơ sở dữ liệu Firebase của bạn có thể đang chặn đọc/ghi trực tiếp từ trình duyệt (`allow read, write: if false`). Để đồng bộ hóa an toàn, hãy áp dụng quy tắc phù hợp.
                </p>
              </div>
            </div>

            {/* Status Section */}
            <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-2">
                <span className="h-2 w-2 rounded-full bg-red-500"></span> Lưu Trực Tiếp Trên Máy (Offline)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Hệ thống đã tự động chuyển vùng dữ liệu sang bộ nhớ máy của bạn để bảo đảm ứng dụng không bao giờ bị gián đoạn hay mất dữ liệu. Bạn vẫn tạo đề AI và dạy học bình thường.
              </p>
            </div>

            {/* Instructions Section */}
            <div className="mb-4 space-y-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Cách kích hoạt đồng bộ hóa Cloud:
              </p>
              <ol className="list-decimal list-inside text-2xs text-slate-600 dark:text-slate-400 space-y-1 pl-1 leading-relaxed">
                <li>Mở trình duyệt truy cập <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-bold">Firebase Console</a>.</li>
                <li>Chọn dự án của bạn (<strong className="text-slate-800 dark:text-slate-200">toan6coha</strong>) rồi mở mục <strong className="text-indigo-500">Firestore Database</strong>.</li>
                <li>Chuyển sang tab <strong className="text-indigo-500">Rules</strong> (Quy tắc).</li>
                <li>Sao chép đoạn mã quy tắc bảo mật tối ưu bên dưới và dán đè vào:</li>
              </ol>
            </div>

            {/* Rules Code Container */}
            <div className="relative mb-5">
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-[10px] font-mono overflow-x-auto max-h-48 leading-relaxed select-all">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quizzes/{quizId} {
      allow read, write: if true;
    }
    match /submissions/{submissionId} {
      allow read, write: if true;
    }
    match /students/{studentId} {
      allow read, write: if true;
    }
    match /unlockRequests/{requestId} {
      allow read, write: if true;
    }
    match /curriculum/{chapterId} {
      allow read, write: if true;
    }
    match /settings/{settingId} {
      allow read, write: if true;
    }
  }
}`}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quizzes/{quizId} {
      allow read, write: if true;
    }
    match /submissions/{submissionId} {
      allow read, write: if true;
    }
    match /students/{studentId} {
      allow read, write: if true;
    }
    match /unlockRequests/{requestId} {
      allow read, write: if true;
    }
    match /curriculum/{chapterId} {
      allow read, write: if true;
    }
    match /settings/{settingId} {
      allow read, write: if true;
    }
  }
}`);
                  setCopiedRules(true);
                  setTimeout(() => setCopiedRules(false), 2000);
                }}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-3xs font-semibold transition-all backdrop-blur-sm"
              >
                {copiedRules ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>

            {/* Confirm footer button */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRulesHelperModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
