import React, { useState } from "react";
import { Student, UnlockRequest, Quiz, StudentSubmission } from "../types";
import { 
  Users, 
  UserPlus, 
  Unlock, 
  Award, 
  Download, 
  Search, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  ArrowUpDown, 
  CheckCircle, 
  FileText,
  AlertCircle,
  Key,
  Pencil,
  Upload,
  ListPlus
} from "lucide-react";

interface StudentManagerProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent?: (student: Student) => void;
  onAddStudentsBatch?: (students: Student[]) => void;
  onDeleteStudent: (id: string) => void;
  unlockRequests: UnlockRequest[];
  onApproveUnlock: (requestId: string) => void;
  onRejectUnlock: (requestId: string) => void;
  quizzes: Quiz[];
  submissions: StudentSubmission[];
  adminPassword?: string;
  onChangeAdminPassword?: (newPassword: string) => void;
}

export default function StudentManager({
  students,
  onAddStudent,
  onUpdateStudent,
  onAddStudentsBatch,
  onDeleteStudent,
  unlockRequests,
  onApproveUnlock,
  onRejectUnlock,
  quizzes,
  submissions,
  adminPassword = "admin",
  onChangeAdminPassword
}: StudentManagerProps) {
  const [activeTab, setActiveTab] = useState<"list" | "unlocks" | "leaderboard" | "password">("list");
  
  // State for adding student
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newCustomId, setNewCustomId] = useState("");
  const [searchStudentQuery, setSearchStudentQuery] = useState("");

  // States for Editing Student
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState("");
  const [editClass, setEditClass] = useState("");

  // States for Batch Importing
  const [importLeftTab, setImportLeftTab] = useState<"single" | "batch">("single");
  const [importText, setImportText] = useState("");
  const [defaultImportClass, setDefaultImportClass] = useState("6A1");
  const [importPreview, setImportPreview] = useState<Student[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditClass(student.class);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editName.trim() || !editClass.trim()) return;

    if (onUpdateStudent) {
      onUpdateStudent({
        id: editingStudent.id,
        name: editName.trim(),
        class: editClass.trim()
      });
      setSuccessMessage(`Đã cập nhật thông tin học sinh ${editName.trim()} thành công!`);
      setTimeout(() => setSuccessMessage(""), 4000);
    }
    setEditingStudent(null);
  };

  const handleParseImport = (text: string, defaultClass: string) => {
    const lines = text.split("\n");
    const parsed: Student[] = [];
    
    // Find highest existing numerical suffix for HSxxx
    let maxNum = 0;
    students.forEach(st => {
      const match = st.id.match(/^HS(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNum) maxNum = num;
      }
    });
    
    let nextNum = maxNum + 1;
    
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) return;
      
      // Try to split by comma, tab, or semicolon
      let parts = cleanLine.split(/,|\t|;/).map(p => p.trim());
      
      if (parts.length === 1) {
        const name = parts[0];
        const studentId = `HS${String(nextNum++).padStart(3, "0")}`;
        parsed.push({
          id: studentId,
          name: name,
          class: defaultClass || "6A1"
        });
      } else if (parts.length === 2) {
        const name = parts[0];
        const className = parts[1];
        const studentId = `HS${String(nextNum++).padStart(3, "0")}`;
        parsed.push({
          id: studentId,
          name: name,
          class: className || defaultClass || "6A1"
        });
      } else if (parts.length >= 3) {
        let idVal = "";
        let nameVal = "";
        let classVal = "";
        
        if (parts[0].toUpperCase().startsWith("HS") || (parts[0].length <= 8 && !parts[0].includes(" "))) {
          idVal = parts[0].toUpperCase();
          nameVal = parts[1];
          classVal = parts[2];
        } else {
          nameVal = parts[0];
          classVal = parts[1];
          idVal = parts[2].toUpperCase();
        }
        
        if (!idVal) {
          idVal = `HS${String(nextNum++).padStart(3, "0")}`;
        }
        
        parsed.push({
          id: idVal,
          name: nameVal,
          class: classVal || defaultClass || "6A1"
        });
      }
    });
    
    setImportPreview(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
      handleParseImport(content, defaultImportClass);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (importPreview.length === 0) return;

    if (onAddStudentsBatch) {
      onAddStudentsBatch(importPreview);
      setSuccessMessage(`Đã tải lên và lưu thành công ${importPreview.length} học sinh vào hệ thống!`);
      setTimeout(() => setSuccessMessage(""), 4000);
      setImportText("");
      setImportPreview([]);
      setImportLeftTab("single");
    }
  };

  const handleDownloadTemplate = () => {
    // UTF-8 BOM to display Vietnamese accents correctly in Excel
    const BOM = "\uFEFF";
    const csvContent = 
      "Mã số học sinh (Tùy chọn),Họ và tên học sinh,Lớp học\n" +
      "HS001,Nguyễn Văn An,6A1\n" +
      "HS002,Trần Thị Bình,6A1\n" +
      ",Lê Văn Cường,6A2\n" +
      "HS099,Phạm Hồng Đăng,6A3\n";
    
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "mau_danh_sach_hoc_sinh.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // State for leaderboard / export
  const [selectedQuizId, setSelectedQuizId] = useState<string>(quizzes[0]?.id || "");
  const [successMessage, setSuccessMessage] = useState("");

  // Custom confirmation modal for student deletion
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Password change form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (currentPassword !== adminPassword) {
      setPasswordError("Mật khẩu hiện tại không chính xác!");
      return;
    }

    if (newPassword.trim().length < 4) {
      setPasswordError("Mật khẩu mới phải có tối thiểu 4 ký tự!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới và mật khẩu nhập lại không khớp nhau!");
      return;
    }

    if (onChangeAdminPassword) {
      onChangeAdminPassword(newPassword.trim());
      setPasswordSuccess("Đã thay đổi mật khẩu giáo viên thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordError("Chức năng đổi mật khẩu chưa được cấu hình hoàn chỉnh.");
    }
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newClass.trim()) return;

    // Generate unique sequential ID if custom is empty
    let studentId = newCustomId.trim().toUpperCase();
    if (!studentId) {
      // Find highest existing numerical suffix for HSxxx
      let maxNum = 0;
      students.forEach(st => {
        const match = st.id.match(/^HS(\d+)$/);
        if (match) {
          const num = parseInt(match[1]);
          if (num > maxNum) maxNum = num;
        }
      });
      studentId = `HS${String(maxNum + 1).padStart(3, "0")}`;
    }

    // Check if ID is duplicated
    if (students.some(st => st.id === studentId)) {
      alert(`Mã học sinh ${studentId} đã tồn tại trong hệ thống!`);
      return;
    }

    const newStudent: Student = {
      id: studentId,
      name: newName.trim(),
      class: newClass.trim()
    };

    onAddStudent(newStudent);
    setNewName("");
    setNewClass("");
    setNewCustomId("");
    
    setSuccessMessage(`Đã thêm học sinh ${newStudent.name} thành công với mã ${newStudent.id}!`);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // Filter students based on search
  const filteredStudents = students.filter(st => 
    st.name.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
    st.id.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
    st.class.toLowerCase().includes(searchStudentQuery.toLowerCase())
  );

  // Get active quiz for leaderboard
  const activeLeaderboardQuiz = quizzes.find(q => q.id === selectedQuizId);

  // Get submissions for selected quiz and sort by score desc
  const leaderboardSubmissions = submissions
    .filter(sub => sub.quizId === selectedQuizId)
    // Sort by score desc, then by submittedAt asc
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    });

  // Export Leaderboard to a clean text file
  const handleExportLeaderboard = () => {
    if (!activeLeaderboardQuiz) return;

    let content = `BÁO CÁO KẾT QUẢ BÀI ÔN TẬP TOÁN LỚP 6\r\n`;
    content += `Đề thi: ${activeLeaderboardQuiz.title}\r\n`;
    content += `Ngày xuất báo cáo: ${new Date().toLocaleString("vi-VN")}\r\n`;
    content += `======================================================================\r\n`;
    content += `Xếp hạng | Mã số HS | Họ và tên học sinh | Lớp | Điểm số | Lượt làm | Thời gian nộp\r\n`;
    content += `----------------------------------------------------------------------\r\n`;

    if (leaderboardSubmissions.length === 0) {
      content += `Chưa có học sinh nào nộp bài ôn tập này.\r\n`;
    } else {
      leaderboardSubmissions.forEach((sub, index) => {
        const rank = index + 1;
        const studentIdStr = sub.studentId || "Tự do";
        const attemptStr = sub.attempt ? `Lần ${sub.attempt}` : "N/A";
        const timeStr = new Date(sub.submittedAt).toLocaleString("vi-VN");
        content += `${String(rank).padEnd(8)} | ${studentIdStr.padEnd(9)} | ${sub.studentName.padEnd(23)} | ${sub.studentClass.padEnd(5)} | ${String(sub.score).padEnd(7)} | ${attemptStr.padEnd(8)} | ${timeStr}\r\n`;
      });
    }

    content += `======================================================================\r\n`;
    content += `Phân tích phổ điểm:\r\n`;
    const scores = leaderboardSubmissions.map(s => s.score);
    if (scores.length > 0) {
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
      content += `- Số lượng làm bài: ${scores.length} lượt\r\n`;
      content += `- Điểm cao nhất: ${maxScore}/10\r\n`;
      content += `- Điểm thấp nhất: ${minScore}/10\r\n`;
      content += `- Điểm trung bình: ${avgScore}/10\r\n`;
    } else {
      content += `- Chưa có dữ liệu thống kê phổ điểm.\r\n`;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bang_Diem_Mon_Toan_De_${activeLeaderboardQuiz.title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-orange-400 p-2.5 text-white shadow-md">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-900 dark:text-slate-100 text-lg md:text-xl">
              Quản Lý Học Sinh & Kết Quả Thi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cấp phát mã học sinh, mở khoá lượt làm bài lần thứ 2 và xuất kết quả xếp hạng theo điểm đạt được.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200/50 dark:border-slate-800 shrink-0 text-xs font-semibold flex-wrap gap-1 md:gap-0">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === "list"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Users className="h-3.5 w-3.5" /> Danh sách HS
          </button>
          <button
            onClick={() => setActiveTab("unlocks")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all relative ${
              activeTab === "unlocks"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Unlock className="h-3.5 w-3.5" /> Duyệt mở khoá
            {unlockRequests.filter(r => !r.unlocked).length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white animate-bounce">
                {unlockRequests.filter(r => !r.unlocked).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === "leaderboard"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Award className="h-3.5 w-3.5" /> Bảng điểm & Xuất file
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === "password"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <Key className="h-3.5 w-3.5" /> Đổi mật khẩu GV
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          {successMessage}
        </div>
      )}

      {/* 1. MANAGE STUDENTS LIST TAB */}
      {activeTab === "list" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Student Form / Upload Section */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-fit space-y-4">
            <div className="flex border-b border-slate-100 dark:border-slate-800 pb-2">
              <button
                onClick={() => setImportLeftTab("single")}
                className={`flex-1 text-center pb-2 text-xs font-bold transition-all border-b-2 ${
                  importLeftTab === "single"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Thêm một học sinh
              </button>
              <button
                onClick={() => setImportLeftTab("batch")}
                className={`flex-1 text-center pb-2 text-xs font-bold transition-all border-b-2 ${
                  importLeftTab === "batch"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Tải danh sách lên (Excel/CSV/Text)
              </button>
            </div>

            {importLeftTab === "single" ? (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-display font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-500" /> Nhập thông tin thủ công
                </h3>
                
                <form onSubmit={handleCreateStudent} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold uppercase text-slate-400 tracking-wider">Họ và tên học sinh</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-2xs font-bold uppercase text-slate-400 tracking-wider">Lớp học</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: 6A1"
                        value={newClass}
                        onChange={(e) => setNewClass(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-2xs font-bold uppercase text-slate-400 tracking-wider">Mã số tự đặt</label>
                      <input
                        type="text"
                        placeholder="Tự động sinh"
                        value={newCustomId}
                        onChange={(e) => setNewCustomId(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <UserPlus className="h-4 w-4" /> Thêm vào danh sách
                  </button>
                </form>

                <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-lg flex gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Nếu để trống ô <b>Mã số tự đặt</b>, hệ thống tự động cấp phát mã theo chuỗi định dạng tăng dần (ví dụ: HS001, HS002...). Cung cấp mã này cho học sinh đăng nhập làm bài trực tuyến.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-display font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-2">
                    <ListPlus className="h-4 w-4 text-indigo-500" /> Tải danh sách học sinh
                  </h3>
                  <button
                    onClick={handleDownloadTemplate}
                    type="button"
                    className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:text-indigo-300 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 rounded-lg transition-all"
                    title="Tải tệp mẫu CSV về máy"
                  >
                    <Download className="h-3 w-3" /> Tải tệp mẫu
                  </button>
                </div>

                <div className="space-y-3">
                  {/* File Drop Area */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          setImportText(content);
                          handleParseImport(content, defaultImportClass);
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      dragOver 
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20" 
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20"
                    }`}
                  >
                    <input
                      type="file"
                      id="batch-file-upload"
                      accept=".txt,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="batch-file-upload" className="cursor-pointer space-y-1.5 block">
                      <Upload className="h-6 w-6 text-indigo-500 mx-auto" />
                      <div className="text-2xs font-semibold text-slate-700 dark:text-slate-300">
                        Kéo thả file .csv, .txt hoặc <span className="text-indigo-600 dark:text-indigo-400 underline">bấm để chọn</span>
                      </div>
                      <p className="text-[10px] text-slate-400">Hỗ trợ mã hóa UTF-8 để giữ nguyên dấu tiếng Việt</p>
                    </label>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hoặc dán văn bản</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  </div>

                  {/* Class Field for Names */}
                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold uppercase text-slate-400 tracking-wider">Lớp mặc định (Nếu dòng không ghi rõ lớp)</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 6A1"
                      value={defaultImportClass}
                      onChange={(e) => {
                        setDefaultImportClass(e.target.value);
                        if (importText) handleParseImport(importText, e.target.value);
                      }}
                      className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  {/* Paste Text Area */}
                  <div className="space-y-1.5">
                    <label className="text-2xs font-bold uppercase text-slate-400 tracking-wider">Dán danh sách học sinh</label>
                    <textarea
                      rows={4}
                      placeholder="Nguyễn Văn An, 6A1&#10;Trần Thị Bình, 6A1&#10;Lê Văn Cường, 6A2&#10;HS099, Phạm Hồng Đăng, 6A3"
                      value={importText}
                      onChange={(e) => {
                        setImportText(e.target.value);
                        handleParseImport(e.target.value, defaultImportClass);
                      }}
                      className="w-full text-2xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Realtime Parsing Preview */}
                  {importPreview.length > 0 && (
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                      <div className="flex items-center justify-between text-2xs font-bold text-slate-500">
                        <span>ĐÃ PHÂN TÍCH ĐƯỢC</span>
                        <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                          {importPreview.length} học sinh
                        </span>
                      </div>
                      
                      <div className="max-h-24 overflow-y-auto space-y-1 text-[10px] divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {importPreview.map((item, i) => (
                          <div key={i} className="flex justify-between items-center py-1 text-slate-600 dark:text-slate-300">
                            <span className="font-mono text-indigo-500 font-bold">{item.id}</span>
                            <span className="truncate max-w-[120px] font-semibold">{item.name}</span>
                            <span className="text-slate-400">{item.class}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleImportSubmit}
                        className="w-full mt-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-2xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Check className="h-3.5 w-3.5" /> Xác nhận lưu vào CSDL
                      </button>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 leading-relaxed bg-indigo-50/40 dark:bg-indigo-950/10 p-2.5 rounded-lg space-y-1">
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">Định dạng dòng hợp lệ:</p>
                    <ul className="list-disc pl-3.5 space-y-0.5">
                      <li>Chỉ ghi Họ tên (Ví dụ: <code className="font-mono bg-slate-100 dark:bg-slate-900 px-0.5 rounded">Nguyễn Văn An</code>)</li>
                      <li>Họ tên, Lớp (Ví dụ: <code className="font-mono bg-slate-100 dark:bg-slate-900 px-0.5 rounded">Nguyễn Văn An, 6A1</code>)</li>
                      <li>Mã HS, Họ tên, Lớp (Ví dụ: <code className="font-mono bg-slate-100 dark:bg-slate-900 px-0.5 rounded">HS099, Nguyễn Văn An, 6A1</code>)</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Directory */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" /> Danh bạ học sinh ({students.length} học sinh)
              </h3>
              
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, lớp hoặc mã..."
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  className="w-full text-2xs font-semibold pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5">Mã học sinh</th>
                    <th className="py-2.5">Họ và tên</th>
                    <th className="py-2.5">Lớp</th>
                    <th className="py-2.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        Không tìm thấy học sinh nào phù hợp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-950/20 group">
                        <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{st.id}</td>
                        <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{st.name}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                            {st.class}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEdit(st)}
                            className="inline-flex items-center justify-center text-slate-400 hover:text-blue-600 h-8 w-8 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
                            title="Sửa thông tin học sinh"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(st.id)}
                            className="inline-flex items-center justify-center text-slate-400 hover:text-rose-600 h-8 w-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. UNLOCK REQUESTS TAB */}
      {activeTab === "unlocks" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm border-l-4 border-orange-400 pl-3 pb-0.5 flex items-center gap-2">
            <Unlock className="h-4 w-4 text-blue-500" /> Phê duyệt yêu cầu mở khóa làm bài Lần 2
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Học sinh được làm tối đa 2 lần mỗi đề ôn tập. Tuy nhiên, để tránh trường hợp học sinh nộp bài xong làm lại ngay lập tức mà không tự học, hệ thống khóa lượt thứ 2 và yêu cầu giáo viên phê duyệt mở khóa trong danh sách này.
          </p>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Thời gian</th>
                  <th className="py-2.5">Học sinh</th>
                  <th className="py-2.5">Lớp</th>
                  <th className="py-2.5">Đề kiểm tra</th>
                  <th className="py-2.5">Trạng thái</th>
                  <th className="py-2.5 text-right">Thành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                {unlockRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Chưa có yêu cầu mở khóa nào được gửi.
                    </td>
                  </tr>
                ) : (
                  unlockRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-950/20">
                      <td className="py-3 text-slate-400">
                        {new Date(req.requestedAt).toLocaleTimeString("vi-VN")} {new Date(req.requestedAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{req.studentName}</p>
                        <span className="font-mono text-3xs text-blue-500">{req.studentId}</span>
                      </td>
                      <td className="py-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">{req.studentClass}</span>
                      </td>
                      <td className="py-3 font-semibold text-slate-700 dark:text-slate-300 max-w-xs truncate">{req.quizTitle}</td>
                      <td className="py-3">
                        {req.unlocked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                            <Check className="h-3 w-3" /> Đã mở khoá
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded animate-pulse">
                            <Clock className="h-3 w-3" /> Chờ phê duyệt
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {!req.unlocked ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => onApproveUnlock(req.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-2xs px-2.5 py-1.5 transition-all"
                            >
                              <Check className="h-3 w-3" /> Đồng ý
                            </button>
                            <button
                              onClick={() => onRejectUnlock(req.id)}
                              className="inline-flex items-center justify-center text-slate-400 hover:text-rose-600 h-8 w-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                              title="Hủy bỏ yêu cầu"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-3xs text-slate-400">Đã giải quyết</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. LEADERBOARD & EXPORT TAB */}
      {activeTab === "leaderboard" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-500" /> Bảng điểm & Xếp hạng điểm số
              </h3>
              <p className="text-2xs text-slate-400 mt-0.5">
                Xem danh sách điểm xếp theo thứ tự điểm đạt được từ cao xuống thấp và xuất kết quả ra file báo cáo sạch sẽ.
              </p>
            </div>

            {/* Quiz Selector Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-80">
              <span className="text-xs text-slate-400 shrink-0 font-medium">Chọn đề:</span>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>
            </div>
          </div>

          {activeLeaderboardQuiz ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{activeLeaderboardQuiz.title}</h4>
                  <p className="text-2xs text-slate-400">
                    {activeLeaderboardQuiz.questions.length} câu hỏi • Có {leaderboardSubmissions.length} lượt nộp bài ghi nhận trong cơ sở dữ liệu.
                  </p>
                </div>
                
                <button
                  onClick={handleExportLeaderboard}
                  disabled={leaderboardSubmissions.length === 0}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs px-3.5 py-2 shadow-sm flex items-center gap-1.5 active:scale-95 transition-all shrink-0 self-start sm:self-auto"
                >
                  <Download className="h-4.5 w-4.5" /> Xuất File Điểm đạt được
                </button>
              </div>

              {/* Submissions List sorted by Score */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 w-16">Thứ hạng</th>
                      <th className="py-2.5">Học sinh</th>
                      <th className="py-2.5">Lớp</th>
                      <th className="py-2.5">Lượt làm</th>
                      <th className="py-2.5">Thời gian nộp</th>
                      <th className="py-2.5 text-right">Điểm đạt được (/10)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                    {leaderboardSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Chưa có học sinh nào hoàn thành bài thi này để hiển thị trên bảng xếp hạng.
                        </td>
                      </tr>
                    ) : (
                      leaderboardSubmissions.map((sub, index) => {
                        const rank = index + 1;
                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-950/20">
                            <td className="py-3">
                              <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-2xs ${
                                rank === 1 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40" :
                                rank === 2 ? "bg-slate-100 text-slate-700 dark:bg-slate-850" :
                                rank === 3 ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40" :
                                "text-slate-400"
                              }`}>
                                {rank}
                              </span>
                            </td>
                            <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                              <div>
                                {sub.studentName}
                                {sub.studentId && (
                                  <span className="ml-1.5 font-mono text-3xs text-blue-500 font-normal">({sub.studentId})</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">{sub.studentClass}</span>
                            </td>
                            <td className="py-3 font-medium text-slate-500">
                              Lần {sub.attempt || 1}
                            </td>
                            <td className="py-3 text-slate-400">
                              {new Date(sub.submittedAt).toLocaleTimeString("vi-VN")} {new Date(sub.submittedAt).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="py-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                              {sub.score.toFixed(1)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              Vui lòng soạn đề ôn luyện trong mục "Tạo đề tự động" hoặc chọn đề hợp lệ để xem kết quả.
            </div>
          )}
        </div>
      )}

      {/* 4. CHANGE PASSWORD TAB */}
      {activeTab === "password" && (
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div>
            <h3 className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm border-l-4 border-indigo-500 pl-3 pb-0.5 flex items-center gap-2">
              <Key className="h-4 w-4 text-indigo-500" /> Thay đổi mật khẩu Giáo viên
            </h3>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1 pl-4 leading-relaxed">
              Thiết lập mật khẩu bảo mật mới thay cho mật khẩu hiện tại của thầy cô. Mật khẩu mới dùng để đăng nhập vào khu vực dành riêng cho giáo viên.
            </p>
          </div>

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-2xs font-bold uppercase text-slate-400 tracking-wider">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                placeholder="Nhập mật khẩu đang sử dụng"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-bold uppercase text-slate-400 tracking-wider">Mật khẩu mới</label>
              <input
                type="password"
                required
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-2xs font-bold uppercase text-slate-400 tracking-wider">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                required
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-2xs font-semibold text-rose-800 dark:text-rose-400 flex items-center gap-1.5 leading-relaxed">
                <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-2xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 leading-relaxed">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                {passwordSuccess}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Check className="h-4 w-4" /> Cập nhật mật khẩu
            </button>
          </form>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            
            <div className="text-center space-y-1.5">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">
                Xác nhận xóa học sinh?
              </h3>
              <p className="text-2xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Học sinh <strong className="text-slate-700 dark:text-slate-300">
                  {students.find(s => s.id === deleteConfirmId)?.name || ""}
                </strong> (Mã: {deleteConfirmId}) và toàn bộ dữ liệu lịch sử làm bài liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 text-2xs font-bold transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(deleteConfirmId);
                  setDeleteConfirmId(null);
                  setSuccessMessage("Đã xóa học sinh và lịch sử làm bài liên quan thành công.");
                  setTimeout(() => setSuccessMessage(""), 4000);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-2xs font-bold transition-all shadow-md shadow-rose-500/10"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Edit Student Info Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <form onSubmit={handleSaveEdit} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">
                  Sửa thông tin học sinh
                </h3>
                <p className="text-3xs text-slate-400 font-mono">Mã học sinh: {editingStudent.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-2xs font-bold uppercase text-slate-400 tracking-wider">Họ và tên học sinh</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-2xs font-bold uppercase text-slate-400 tracking-wider">Lớp học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 6A1"
                  value={editClass}
                  onChange={(e) => setEditClass(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 text-2xs font-bold transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-2xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" /> Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
