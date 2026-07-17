import React, { useState, useEffect } from "react";
import { Quiz, Question, QuestionType, Difficulty, Student } from "../types";
import { Chapter } from "../data/curriculum";
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Copy, 
  Printer, 
  Download, 
  Play, 
  ChevronRight, 
  BookOpen, 
  AlertCircle,
  X,
  FileText,
  School,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  Users,
  Check,
  Plus
} from "lucide-react";

interface QuizBankProps {
  quizzes: Quiz[];
  curriculum: Chapter[];
  students: Student[];
  onDeleteQuiz: (id: string) => void;
  onDuplicateQuiz: (id: string) => void;
  onNavigate: (tab: string) => void;
  onSelectQuiz: (quiz: Quiz) => void;
  selectedQuiz: Quiz | null;
  onUpdateQuiz: (quiz: Quiz) => void;
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Trắc nghiệm khách quan",
  true_false: "Đúng / Sai",
  matching: "Ghép đôi cột",
  fill_blank: "Điền số / Điền khuyết",
  essay: "Tự luận / Toán thực tế",
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Nhận biết (Cơ bản)",
  medium: "Thông hiểu (Khá)",
  hard: "Vận dụng (Giỏi)",
  very_hard: "Vận dụng cao (Nâng cao)",
};

export default function QuizBank({ 
  quizzes, 
  curriculum, 
  students,
  onDeleteQuiz,
  onDuplicateQuiz,
  onNavigate,
  onSelectQuiz,
  selectedQuiz,
  onUpdateQuiz
}: QuizBankProps) {
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChapterId, setFilterChapterId] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  
  // Quiz configuration states
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [timeLimit, setTimeLimit] = useState(0);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [examDate, setExamDate] = useState("");

  // Quiz assignment state
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedClasses, setAssignedClasses] = useState<string[]>([]);
  const [customClassName, setCustomClassName] = useState("");

  // Sync config states on quiz change
  useEffect(() => {
    if (selectedQuiz) {
      setTimeLimit(selectedQuiz.timeLimit || 0);
      setStartTime(selectedQuiz.startTime || "");
      setEndTime(selectedQuiz.endTime || "");
      setSchoolName(selectedQuiz.schoolName || "");
      setExamDate(selectedQuiz.examDate || "");
      setAssignedClasses(selectedQuiz.assignedClasses || []);
      setIsConfiguring(false);
      setIsAssigning(false);
    }
  }, [selectedQuiz]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz) return;

    const updatedQuiz: Quiz = {
      ...selectedQuiz,
      timeLimit: timeLimit > 0 ? timeLimit : undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      schoolName: schoolName || undefined,
      examDate: examDate || undefined,
    };

    onUpdateQuiz(updatedQuiz);
    setIsConfiguring(false);
    alert("Đã cập nhật cấu hình thời gian và thông tin đề ôn tập thành công!");
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz) return;

    const updatedQuiz: Quiz = {
      ...selectedQuiz,
      assignedClasses: assignedClasses.length > 0 ? assignedClasses : undefined,
    };

    onUpdateQuiz(updatedQuiz);
    setIsAssigning(false);
    alert("Đã cập nhật danh sách lớp được giao đề thi ôn tập thành công!");
  };

  const handleToggleClass = (className: string) => {
    if (assignedClasses.includes(className)) {
      setAssignedClasses(assignedClasses.filter(c => c !== className));
    } else {
      setAssignedClasses([...assignedClasses, className]);
    }
  };

  const handleAddCustomClass = () => {
    const trimmed = customClassName.trim().toUpperCase();
    if (!trimmed) return;
    if (!assignedClasses.includes(trimmed)) {
      setAssignedClasses([...assignedClasses, trimmed]);
    }
    setCustomClassName("");
  };
  
  // Print preview overlay modal state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printIncludeAnswers, setPrintIncludeAnswers] = useState(false);
  const [customSchoolHeader, setCustomSchoolHeader] = useState("SỞ GD&ĐT THÀNH PHỐ HÀ NỘI");
  const [customSchoolSubHeader, setCustomSchoolSubHeader] = useState("TRƯỜNG THCS LÊ QUÝ ĐÔN");
  const [customExamCode, setCustomExamCode] = useState("MÃ ĐỀ 101");

  // Filtering logic
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChapter = filterChapterId ? quiz.chapterId === filterChapterId : true;
    const matchesDifficulty = filterDifficulty ? quiz.difficultyLevels.includes(filterDifficulty as Difficulty) : true;
    return matchesSearch && matchesChapter && matchesDifficulty;
  });

  // Export to Word (.doc / .docx HTML Proxy)
  const handleExportToWord = (quiz: Quiz) => {
    const quizTitleHTML = `<h2 style="text-align: center; font-family: Arial, sans-serif; color: #1e40af; margin-bottom: 5px;">${quiz.title}</h2>`;
    const schoolHeaderHTML = `
      <table style="width: 100%; font-family: Arial, sans-serif; font-size: 11pt; margin-bottom: 20px;">
        <tr>
          <td style="width: 50%; text-align: left;">
            <strong>${customSchoolHeader}</strong><br/>
            <strong>${customSchoolSubHeader}</strong>
          </td>
          <td style="width: 50%; text-align: right; vertical-align: top;">
            <strong>MÃ ĐỀ: ${customExamCode}</strong><br/>
            <em>Thời gian làm bài: 45 phút</em>
          </td>
        </tr>
      </table>
    `;

    const studentInfoBoxHTML = `
      <table style="width: 100%; border: 1px solid #cbd5e1; font-family: Arial, sans-serif; font-size: 11pt; padding: 8px; margin-bottom: 25px;">
        <tr>
          <td style="width: 60%;">Họ và tên học sinh: .............................................................</td>
          <td style="width: 40%;">Lớp: .........................</td>
        </tr>
      </table>
    `;

    let questionsHTML = `<h3 style="font-family: Arial, sans-serif; border-bottom: 1px solid #1e40af; padding-bottom: 5px; color: #1e40af;">PHẦN I: ĐỀ BÀI</h3><ol style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6;">`;
    
    quiz.questions.forEach((q) => {
      questionsHTML += `<li style="margin-bottom: 15px;"><strong>[${DIFFICULTY_LABELS[q.difficulty].split(" ")[0]}]</strong> ${q.prompt}`;
      
      if (q.type === "multiple_choice" && q.options) {
        questionsHTML += `<table style="width: 100%; margin-top: 5px; font-size: 10pt;"><tr>`;
        q.options.forEach((opt, idx) => {
          questionsHTML += `<td style="width: 25%;">${opt}</td>`;
        });
        questionsHTML += `</tr></table>`;
      }

      if (q.type === "true_false" && q.trueFalseStatements) {
        questionsHTML += `<table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 10pt;">`;
        questionsHTML += `<tr style="background-color: #f1f5f9;"><th style="border: 1.5px solid #cbd5e1; padding: 4px; text-align: left;">Phát biểu</th><th style="border: 1.5px solid #cbd5e1; padding: 4px; width: 60px;">Đúng</th><th style="border: 1.5px solid #cbd5e1; padding: 4px; width: 60px;">Sai</th></tr>`;
        q.trueFalseStatements.forEach((tf) => {
          questionsHTML += `<tr><td style="border: 1.5px solid #cbd5e1; padding: 4px;">${tf.statement}</td><td style="border: 1.5px solid #cbd5e1; padding: 4px; text-align: center;">[   ]</td><td style="border: 1.5px solid #cbd5e1; padding: 4px; text-align: center;">[   ]</td></tr>`;
        });
        questionsHTML += `</table>`;
      }

      if (q.type === "matching" && q.matchingPairs) {
        questionsHTML += `<table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 10pt;">`;
        questionsHTML += `<tr style="background-color: #f1f5f9;"><th style="border: 1.5px solid #cbd5e1; padding: 4px; text-align: left; width: 50%;">Cột A</th><th style="border: 1.5px solid #cbd5e1; padding: 4px; text-align: left; width: 50%;">Cột B (Cần ghép nối)</th></tr>`;
        q.matchingPairs.forEach((pair) => {
          questionsHTML += `<tr><td style="border: 1.5px solid #cbd5e1; padding: 4px;">${pair.left}</td><td style="border: 1.5px solid #cbd5e1; padding: 4px;">${pair.right}</td></tr>`;
        });
        questionsHTML += `</table>`;
      }
      
      questionsHTML += `</li>`;
    });
    
    questionsHTML += `</ol>`;

    let answersHTML = "";
    if (printIncludeAnswers) {
      answersHTML += `<br/><h3 style="font-family: Arial, sans-serif; border-b: 1px solid #f97316; padding-bottom: 5px; color: #f97316; page-break-before: always;">PHẦN II: HƯỚNG DẪN GIẢI VÀ ĐÁP ÁN CHI TIẾT</h3><ol style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6;">`;
      quiz.questions.forEach((q) => {
        answersHTML += `<li style="margin-bottom: 20px;"><strong>Câu hỏi:</strong> ${q.prompt}<br/>`;
        answersHTML += `<strong style="color: #16a34a;">Đáp án đúng:</strong> ${q.correctAnswer}<br/>`;
        answersHTML += `<strong>Hướng dẫn giải chi tiết:</strong> ${q.solution}<br/>`;
        if (q.hint) answersHTML += `<em>* Gợi ý học sinh: ${q.hint}</em><br/>`;
        answersHTML += `<em>* Đánh giá năng lực: ${q.competency}</em><br/>`;
        answersHTML += `</li>`;
      });
      answersHTML += `</ol>`;
    }

    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${quiz.title}</title>
      <meta charset="utf-8"/>
      <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
      </head>
      <body>
        ${schoolHeaderHTML}
        ${quizTitleHTML}
        ${studentInfoBoxHTML}
        ${questionsHTML}
        ${answersHTML}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docContent], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.title.replace(/\s+/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintTrigger = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-slate-900 dark:text-slate-100 text-lg md:text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" /> Ngân Hàng Đề Thi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Xem, sửa, nhân bản, làm trực tuyến, hoặc in ấn chuẩn hóa A4 bộ sưu tập đề thi của bạn.
          </p>
        </div>
        <button
          onClick={() => onNavigate("generator")}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 shadow-md flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
        >
          <Edit className="h-4 w-4" /> Soạn Đề Mới
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm đề thi theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Chapter Filter */}
        <div className="w-full md:w-56">
          <select
            value={filterChapterId}
            onChange={(e) => setFilterChapterId(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">-- Tất cả Chương --</option>
            {curriculum.map(chap => (
              <option key={chap.id} value={chap.id}>{chap.title.split(":")[0]}</option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="w-full md:w-48">
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">-- Tất cả mức độ --</option>
            {Object.entries(DIFFICULTY_LABELS).map(([key, value]) => (
              <option key={key} value={key}>{value.split(" ")[0]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Quiz list & Quiz detailed Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side: Quiz List */}
        <div className="xl:col-span-1 space-y-4">
          {filteredQuizzes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400">
              Không tìm thấy đề thi nào khớp bộ lọc.
            </div>
          ) : (
            filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => onSelectQuiz(quiz)}
                className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                  selectedQuiz?.id === quiz.id
                    ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/10 shadow-sm"
                    : "border-slate-100 bg-white hover:bg-slate-50/50 dark:border-slate-850 dark:bg-slate-900"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center flex-wrap gap-1.5">
                    <span className="inline-flex rounded-md bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-2xs font-bold text-blue-600 dark:text-blue-400">
                      {quiz.questions.length} câu hỏi
                    </span>
                    <span className="text-2xs text-slate-400">
                      {new Date(quiz.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-2">
                    {quiz.title}
                  </h3>

                  <div className="flex flex-wrap gap-1">
                    {quiz.difficultyLevels.map((diff) => (
                      <span key={diff} className="text-3xs px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {DIFFICULTY_LABELS[diff].split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Detailed Quiz Inspector */}
        <div className="xl:col-span-2">
          {selectedQuiz ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5">
              {/* Actions & Head */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">
                    {selectedQuiz.title}
                  </h3>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Trường học: {selectedQuiz.schoolName || "Chưa thiết lập"} • Ngày: {selectedQuiz.examDate ? new Date(selectedQuiz.examDate).toLocaleDateString("vi-VN") : "Chưa đặt"}</span>
                    {selectedQuiz.assignedClasses && selectedQuiz.assignedClasses.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-3xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        <Users className="h-3 w-3" /> Giao cho: {selectedQuiz.assignedClasses.join(", ")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-3xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        <Users className="h-3 w-3" /> Tất cả các lớp
                      </span>
                    )}
                  </div>
                </div>

                 {/* Group toolbar */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate("test")}
                    className="inline-flex items-center gap-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-3 py-2 shadow-sm"
                    title="Làm thi trực tuyến"
                  >
                    <Play className="h-3.5 w-3.5" /> Giao thi online
                  </button>

                  <button
                    onClick={() => {
                      setIsAssigning(!isAssigning);
                      setIsConfiguring(false);
                    }}
                    className={`inline-flex items-center gap-1 rounded-xl border font-semibold text-xs px-3 py-2 transition-all ${
                      isAssigning 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                    title="Giao đề thi cho các lớp học cụ thể"
                  >
                    <Users className="h-3.5 w-3.5" /> Giao cho lớp
                  </button>

                  <button
                    onClick={() => {
                      setIsConfiguring(!isConfiguring);
                      setIsAssigning(false);
                    }}
                    className={`inline-flex items-center gap-1 rounded-xl border font-semibold text-xs px-3 py-2 transition-all ${
                      isConfiguring 
                        ? "bg-indigo-600 border-indigo-600 text-white" 
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                    title="Cấu hình thời gian làm bài"
                  >
                    <Clock className="h-3.5 w-3.5" /> Hạn giờ & Quản lý
                  </button>

                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs px-3 py-2"
                    title="In ấn PDF A4"
                  >
                    <Printer className="h-3.5 w-3.5" /> Xuất & In Đề
                  </button>

                  <button
                    onClick={() => onDuplicateQuiz(selectedQuiz.id)}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 h-9 w-9"
                    title="Nhân bản đề"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Xác nhận xóa bộ đề thi này?")) {
                        onDeleteQuiz(selectedQuiz.id);
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 text-slate-400 h-9 w-9"
                    title="Xoá đề"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isAssigning && (
                <form onSubmit={handleSaveAssignment} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4 no-print">
                  <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> Giao đề thi ôn luyện cho lớp học
                  </h4>
                  
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Chọn các lớp học được phép xem và làm đề thi này. Nếu không chọn lớp nào, đề thi sẽ hiển thị cho <b>tất cả các lớp học</b> trong hệ thống.
                  </p>

                  <div className="space-y-2">
                    <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Các lớp hiện có từ danh sách học sinh:</label>
                    
                    <div className="flex flex-wrap gap-2.5">
                      {Array.from(new Set(students.map(st => st.class))).filter(Boolean).sort().map(cls => {
                        const isChecked = assignedClasses.includes(cls);
                        return (
                          <button
                            type="button"
                            key={cls}
                            onClick={() => handleToggleClass(cls)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                              isChecked
                                ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                          >
                            {isChecked && <Check className="h-3.5 w-3.5" />}
                            Lớp {cls}
                          </button>
                        );
                      })}
                      
                      {Array.from(new Set(students.map(st => st.class))).filter(Boolean).length === 0 && (
                        <span className="text-2xs text-slate-400 italic">Chưa có lớp học nào trong hệ thống. Hãy thêm lớp hoặc gõ lớp mới bên dưới.</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                    <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Giao thêm cho lớp khác (Gõ thủ công):</label>
                    <div className="flex gap-2 max-w-xs">
                      <input
                        type="text"
                        placeholder="Ví dụ: 6A4"
                        value={customClassName}
                        onChange={(e) => setCustomClassName(e.target.value)}
                        className="flex-1 text-xs font-semibold p-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomClass();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomClass}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" /> Thêm
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">
                      {assignedClasses.length > 0 ? (
                        <span>Đang chọn giao cho: <strong className="text-blue-500 font-bold">{assignedClasses.join(", ")}</strong></span>
                      ) : (
                        <span>Đang giao cho: <strong className="text-slate-500 font-bold">Tất cả các lớp</strong></span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAssigning(false)}
                        className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95 transition-all"
                      >
                        Xác nhận giao đề
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {isConfiguring && (
                <form onSubmit={handleSaveConfig} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4 no-print">
                  <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> Cấu hình giới hạn thời gian & Thời hạn làm bài
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Time limit (mins) */}
                    <div className="space-y-1.5">
                      <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Thời gian làm bài (Phút)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Không giới hạn"
                        value={timeLimit || ""}
                        onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                      />
                      <span className="text-[10px] text-slate-400 block">Nhập 0 hoặc để trống để làm bài không giới hạn giờ.</span>
                    </div>

                    {/* Start range */}
                    <div className="space-y-1.5">
                      <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Bắt đầu mở đề thi</label>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                      />
                      <span className="text-[10px] text-slate-400 block">Thời điểm bắt đầu mở quyền làm bài.</span>
                    </div>

                    {/* End range */}
                    <div className="space-y-1.5">
                      <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Hạn chót nộp bài</label>
                      <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                      />
                      <span className="text-[10px] text-slate-400 block">Quá thời hạn này học sinh không thể truy cập đề.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* School Name */}
                    <div className="space-y-1.5">
                      <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Tên trường học / Sở GD</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Trường THCS Lê Quý Đôn"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                      />
                    </div>

                    {/* Exam Date */}
                    <div className="space-y-1.5">
                      <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Ngày kiểm tra</label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsConfiguring(false)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 transition-all"
                    >
                      Lưu cấu hình
                    </button>
                  </div>
                </form>
              )}

              {/* Questions review in Inspector */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cấu trúc nội dung câu hỏi</h4>
                
                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {selectedQuiz.questions.map((q, idx) => (
                    <div key={q.id} className="pt-4 first:pt-0 space-y-2.5">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-300">
                          Câu {idx + 1}: <span className="font-medium text-slate-500">[{QUESTION_TYPE_LABELS[q.type]}]</span>
                        </span>
                        <span className={`text-3xs font-semibold rounded px-1.5 py-0.5 ${
                          q.difficulty === "easy" ? "bg-emerald-50 text-emerald-600" :
                          q.difficulty === "medium" ? "bg-blue-50 text-blue-600" :
                          q.difficulty === "hard" ? "bg-orange-50 text-orange-600" :
                          "bg-rose-50 text-rose-600"
                        }`}>
                          {DIFFICULTY_LABELS[q.difficulty].split(" ")[0]}
                        </span>
                      </div>

                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {q.prompt}
                      </p>

                      {/* Display formats */}
                      {q.type === "multiple_choice" && q.options && (
                        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === "true_false" && q.trueFalseStatements && (
                        <div className="space-y-1 pt-1 text-xs">
                          {q.trueFalseStatements.map((statement) => (
                            <div key={statement.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
                              <span>{statement.statement}</span>
                              <span className={`font-semibold ${statement.answer ? "text-emerald-600" : "text-rose-600"}`}>
                                {statement.answer ? "Đúng" : "Sai"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === "matching" && q.matchingPairs && (
                        <div className="grid grid-cols-2 gap-3 pt-1 text-2xs">
                          <div className="space-y-1">
                            {q.matchingPairs.map((pair) => (
                              <div key={pair.id} className="bg-slate-50 dark:bg-slate-950 p-1.5 rounded border border-slate-100 dark:border-slate-850">
                                {pair.left}
                              </div>
                            ))}
                          </div>
                          <div className="space-y-1">
                            {q.matchingPairs.map((pair) => (
                              <div key={pair.id} className="bg-slate-50 dark:bg-slate-950 p-1.5 rounded border border-slate-100 dark:border-slate-850">
                                {pair.right}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Answers & Solutions block */}
                      <div className="bg-blue-50/20 border border-blue-100/30 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-600">✓ ĐS đúng:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{q.correctAnswer}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          <strong>Lời giải chi tiết:</strong> {q.solution}
                        </p>
                        {q.hint && (
                          <p className="text-slate-500 dark:text-slate-400 italic">
                            * Gợi ý học sinh: {q.hint}
                          </p>
                        )}
                        <p className="text-2xs text-slate-400 pt-1">
                          Năng lực đánh giá: {q.competency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <AlertCircle className="h-8 w-8 text-slate-300" />
              <span>Vui lòng chọn một đề thi ở cột bên trái để hiển thị nội dung chi tiết.</span>
            </div>
          )}
        </div>
      </div>

      {/* Print Preview & Export Modal Overlay */}
      {showPrintModal && selectedQuiz && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm p-4 flex justify-center no-print">
          <div className="my-8 w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
            {/* Modal header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-lg">Thiết lập in ấn & Xuất bản đề thi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Xem và cấu hình tiêu đề mẫu đề kiểm tra Toán học chuẩn Bộ GD&ĐT.</p>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 p-1 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customizer controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850">
              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Cơ quan / Phòng GD</label>
                <input
                  type="text"
                  value={customSchoolHeader}
                  onChange={(e) => setCustomSchoolHeader(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Đơn vị Trường THCS</label>
                <input
                  type="text"
                  value={customSchoolSubHeader}
                  onChange={(e) => setCustomSchoolSubHeader(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Mã đề / Số hiệu</label>
                <input
                  type="text"
                  value={customExamCode}
                  onChange={(e) => setCustomExamCode(e.target.value)}
                  className="w-full text-xs p-2 border rounded-lg bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-400 uppercase tracking-wider">In đáp án chi tiết?</label>
                <div className="flex items-center gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setPrintIncludeAnswers(!printIncludeAnswers)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${printIncludeAnswers ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${printIncludeAnswers ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Có</span>
                </div>
              </div>
            </div>

            {/* In-app Document Preview Paper Sheet */}
            <div className="border border-slate-200 rounded-xl p-8 bg-white text-black font-serif shadow-inner max-h-[400px] overflow-y-auto leading-relaxed">
              {/* Exam Header */}
              <div className="flex justify-between items-start font-sans text-xs border-b border-black pb-2.5 mb-6">
                <div className="text-left space-y-0.5">
                  <p>{customSchoolHeader.toUpperCase()}</p>
                  <p className="font-bold">{customSchoolSubHeader.toUpperCase()}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="font-bold">{customExamCode.toUpperCase()}</p>
                  <p>Thời gian làm bài: 45 phút</p>
                </div>
              </div>

              {/* Form title */}
              <div className="text-center space-y-1 mb-6 font-sans">
                <h4 className="font-bold text-base uppercase">{selectedQuiz.title}</h4>
                <p className="text-xs italic">Năm học 2026 - 2027 • Bộ sách Kết nối tri thức với cuộc sống</p>
              </div>

              {/* Student fields */}
              <div className="border border-black p-3 text-xs mb-6 font-sans flex justify-between">
                <span>Họ và tên học sinh: .............................................................</span>
                <span>Lớp: .........................</span>
              </div>

              {/* Questions */}
              <div className="space-y-4 text-xs">
                <p className="font-sans font-bold text-sm text-blue-800 border-b border-dashed border-blue-200 pb-1 mb-2">PHẦN I: CÂU HỎI ĐỀ BÀI</p>
                <ol className="list-decimal pl-5 space-y-3.5">
                  {selectedQuiz.questions.map((q, qI) => (
                    <li key={q.id}>
                      <span className="font-bold">[{DIFFICULTY_LABELS[q.difficulty].split(" ")[0]}]</span> {q.prompt}
                      
                      {q.type === "multiple_choice" && q.options && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-sans text-2xs">
                          {q.options.map((opt, oIdx) => (
                            <span key={oIdx}>{opt}</span>
                          ))}
                        </div>
                      )}

                      {q.type === "true_false" && q.trueFalseStatements && (
                        <table className="w-full border-collapse border border-slate-300 mt-2 font-sans text-2xs">
                          <tr className="bg-slate-50"><th className="border border-slate-300 p-1 text-left">Phát biểu</th><th className="border border-slate-300 p-1 w-10">Đúng</th><th className="border border-slate-300 p-1 w-10">Sai</th></tr>
                          {q.trueFalseStatements.map((tf) => (
                            <tr key={tf.id}><td className="border border-slate-300 p-1">{tf.statement}</td><td className="border border-slate-300 p-1 text-center">[  ]</td><td className="border border-slate-300 p-1 text-center">[  ]</td></tr>
                          ))}
                        </table>
                      )}

                      {q.type === "matching" && q.matchingPairs && (
                        <table className="w-full border-collapse border border-slate-300 mt-2 font-sans text-2xs">
                          <tr className="bg-slate-50"><th className="border border-slate-300 p-1 text-left w-1/2">Cột A</th><th className="border border-slate-300 p-1 text-left w-1/2">Cột B</th></tr>
                          {q.matchingPairs.map((pair) => (
                            <tr key={pair.id}><td className="border border-slate-300 p-1">{pair.left}</td><td className="border border-slate-300 p-1">{pair.right}</td></tr>
                          ))}
                        </table>
                      )}
                    </li>
                  ))}
                </ol>

                {printIncludeAnswers && (
                  <div className="page-break pt-6 border-t border-black mt-8">
                    <p className="font-sans font-bold text-sm text-orange-600 border-b border-dashed border-orange-200 pb-1 mb-4">PHẦN II: LỜI GIẢI CHI TIẾT & ĐÁP ÁN</p>
                    <ol className="list-decimal pl-5 space-y-4">
                      {selectedQuiz.questions.map((q, qI) => (
                        <li key={q.id} className="mb-2">
                          <p className="font-bold">Câu hỏi: {q.prompt}</p>
                          <p className="font-bold text-emerald-600">Đáp án chuẩn: {q.correctAnswer}</p>
                          <p><strong>Giải thích:</strong> {q.solution}</p>
                          {q.hint && <p className="italic text-slate-500">* Gợi ý: {q.hint}</p>}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* Actions for output */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleExportToWord(selectedQuiz)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs px-4 py-2 text-slate-700 dark:text-slate-300 flex items-center gap-1"
              >
                <Download className="h-4 w-4" /> Xuất Word (.doc)
              </button>
              <button
                onClick={handlePrintTrigger}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 flex items-center gap-1"
              >
                <Printer className="h-4 w-4" /> In / Lưu PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
