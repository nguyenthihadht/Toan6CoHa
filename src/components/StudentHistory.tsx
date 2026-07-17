import React, { useState } from "react";
import { Student, StudentSubmission, Quiz } from "../types";
import { 
  Award, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Search,
  FileText
} from "lucide-react";

interface StudentHistoryProps {
  currentStudent: Student;
  submissions: StudentSubmission[];
  quizzes: Quiz[];
}

export default function StudentHistory({ currentStudent, submissions, quizzes }: StudentHistoryProps) {
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get student's own submissions
  const mySubmissions = submissions
    .filter(sub => sub.studentId === currentStudent.id)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  // Filter submissions by quiz title
  const filteredSubs = mySubmissions.filter(sub => {
    const quiz = quizzes.find(q => q.id === sub.quizId);
    const title = quiz ? quiz.title.toLowerCase() : "";
    return title.includes(searchQuery.toLowerCase());
  });

  const selectedSub = submissions.find(s => s.id === selectedSubId);
  const selectedQuiz = selectedSub ? quizzes.find(q => q.id === selectedSub.quizId) : null;

  if (selectedSub && selectedQuiz) {
    // Detailed Submission Report View
    const pointsPerQuestion = 10 / selectedQuiz.questions.length;

    return (
      <div className="space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedSubId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách lịch sử
          </button>
          <span className="text-2xs font-mono font-bold text-slate-400 dark:text-slate-500">ID: {selectedSub.id}</span>
        </div>

        {/* Hero banner with score */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 md:p-8 border border-indigo-950 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl"></div>
          
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-2xs font-semibold text-blue-200">
              <Award className="h-3 w-3" /> KẾT QUẢ CHI TIẾT BÀI LÀM
            </div>
            <h3 className="font-display font-bold text-lg md:text-xl">{selectedQuiz.title}</h3>
            <p className="text-xs text-slate-300">
              Học sinh: <span className="font-bold text-white">{currentStudent.name}</span> • Lớp: <span className="font-bold text-white">{currentStudent.class}</span>
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Nộp bài: {new Date(selectedSub.submittedAt).toLocaleString("vi-VN")}</span>
              <span className="px-2 py-0.5 rounded bg-white/15 text-white text-[10px] font-bold">Lượt làm: {selectedSub.attempt || 1}/2</span>
            </div>
          </div>

          <div className="text-center relative z-10 shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl min-w-[125px] self-stretch sm:self-auto flex sm:flex-col justify-between sm:justify-center items-center">
            <span className="text-3xs font-bold uppercase tracking-wider text-orange-400 block sm:mb-1">ĐIỂM ĐẠT ĐƯỢC</span>
            <div>
              <span className="text-4xl font-black font-display text-white">{selectedSub.score}</span>
              <span className="text-xs text-slate-300"> / 10đ</span>
            </div>
          </div>
        </div>

        {/* Question by question feedback */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5">
          <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" /> Giải trình câu hỏi & Phân tích chi tiết từng bước
          </h3>

          <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800/60">
            {selectedQuiz.questions.map((q, idx) => {
              const grade = selectedSub.feedback[q.id];
              const isCorrect = grade?.score === pointsPerQuestion;

              return (
                <div key={q.id} className="pt-5 first:pt-0 space-y-3">
                  <div className="flex justify-between items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300">
                      Câu hỏi {idx + 1}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <span className="text-3xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5">
                        Điểm đạt: {grade?.score || 0} / {parseFloat(pointsPerQuestion.toFixed(2))}đ
                      </span>
                      {grade?.isAIGraded ? (
                        <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 text-3xs font-semibold">
                          <Sparkles className="h-2 w-2" /> AI Chấm
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-3xs font-semibold ${isCorrect ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                          {isCorrect ? "Đúng" : "Chưa chính xác"}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-semibold">{q.prompt}</p>

                  {/* Student answered panel */}
                  <div className="rounded-xl border border-slate-100 dark:border-slate-850 p-3.5 bg-slate-50/40 dark:bg-slate-950/20 space-y-1.5 text-xs">
                    <p className="text-slate-500">Bài làm của em:</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {q.type === "essay" 
                        ? (selectedSub.answers[q.id] || "Bỏ trống bài viết này.") 
                        : q.type === "multiple_choice"
                        ? `Lựa chọn ${selectedSub.answers[q.id] || "Bỏ trống"}`
                        : q.type === "fill_blank"
                        ? `Đáp án điền: ${selectedSub.answers[q.id] || "Bỏ trống"}`
                        : typeof selectedSub.answers[q.id] === "object"
                        ? JSON.stringify(selectedSub.answers[q.id])
                        : `Câu trả lời: ${selectedSub.answers[q.id] || "Bỏ trống"}`
                      }
                    </p>
                  </div>

                  {/* Detailed feedback commentary */}
                  {grade?.comment && (
                    <div className="rounded-xl bg-orange-50/40 border border-orange-100/50 p-3 text-xs text-orange-800 dark:bg-orange-950/10 dark:border-orange-900/30 dark:text-orange-300">
                      <strong>Phản hồi sư phạm:</strong> {grade.comment}
                    </div>
                  )}

                  {/* Solution guide */}
                  <div className="bg-emerald-50/10 border border-emerald-100/20 rounded-xl p-4 text-xs space-y-2">
                    <p className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Đáp án đúng: {q.correctAnswer}</p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Giải thích chi tiết từng bước:</strong> {q.solution}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
            <Award className="h-5.5 w-5.5 text-indigo-600" /> Lịch Sử Bài Làm Của Em
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Xem lại tất cả lượt ôn luyện và phản hồi chấm điểm của hệ thống.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {filteredSubs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-850 p-12 text-center bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center space-y-4">
          <FileText className="h-10 w-10 text-slate-300" />
          <h3 className="font-display font-bold text-slate-700 dark:text-slate-300 text-xs">Em chưa có lịch sử nộp bài nào</h3>
          <p className="text-2xs text-slate-500 dark:text-slate-400">Hãy chuyển sang tab "Đề ôn tập của em" để bắt đầu làm bài luyện tập đầu tiên.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubs.map(sub => {
            const quiz = quizzes.find(q => q.id === sub.quizId);
            if (!quiz) return null;

            return (
              <div 
                key={sub.id} 
                className="rounded-xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col justify-between hover:border-indigo-500 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mã đề: {quiz.id}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-bold">Lượt {sub.attempt || 1}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{quiz.title}</h4>
                  
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(sub.submittedAt).toLocaleDateString("vi-VN")}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(sub.submittedAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-850 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Điểm số</span>
                    <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{sub.score}<span className="text-[10px] text-slate-400">/10đ</span></span>
                  </div>

                  <button
                    onClick={() => setSelectedSubId(sub.id)}
                    className="rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 dark:text-indigo-400 font-bold text-2xs px-3 py-1.5 transition-all"
                  >
                    Xem chi tiết bài làm
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
