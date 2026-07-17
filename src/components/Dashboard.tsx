import React from "react";
import { Quiz, StudentSubmission } from "../types";
import { 
  BookOpen, 
  HelpCircle, 
  FileText, 
  Award, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  FileSpreadsheet,
  Users
} from "lucide-react";

interface DashboardProps {
  quizzes: Quiz[];
  submissions: StudentSubmission[];
  onNavigate: (tab: string) => void;
  onSelectQuiz: (quiz: Quiz) => void;
}

export default function Dashboard({ quizzes, submissions, onNavigate, onSelectQuiz }: DashboardProps) {
  // Compute Stats
  const totalQuizzes = quizzes.length;
  
  const totalQuestions = quizzes.reduce((acc, q) => acc + q.questionCount, 0);
  
  const totalSubmissions = submissions.length;
  
  const averageScore = totalSubmissions > 0
    ? parseFloat((submissions.reduce((acc, s) => acc + s.score, 0) / totalSubmissions).toFixed(1))
    : 0;

  // Compute Difficulty Distribution
  const diffCounts = { easy: 0, medium: 0, hard: 0, very_hard: 0 };
  quizzes.forEach(q => {
    q.questions.forEach(ques => {
      if (diffCounts[ques.difficulty] !== undefined) {
        diffCounts[ques.difficulty]++;
      }
    });
  });
  const totalDiffQuestions = Math.max(1, Object.values(diffCounts).reduce((a, b) => a + b, 0));

  // Compute Type Distribution
  const typeCounts = { multiple_choice: 0, true_false: 0, matching: 0, fill_blank: 0, essay: 0 };
  quizzes.forEach(q => {
    q.questions.forEach(ques => {
      if (typeCounts[ques.type] !== undefined) {
        typeCounts[ques.type]++;
      }
    });
  });
  const totalTypeQuestions = Math.max(1, Object.values(typeCounts).reduce((a, b) => a + b, 0));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 md:p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-600/25 blur-3xl"></div>
        <div className="absolute left-1/2 bottom-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-200 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-orange-400" /> KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-bold tracking-tight">
            AI Math Grade 6
          </h1>
          <p className="text-sm md:text-base text-blue-100 leading-relaxed">
            Hệ thống trợ lý sư phạm số hóa hỗ trợ giáo viên soạn thảo đề cương, câu hỏi tự luận, trắc nghiệm chuẩn Chương trình Giáo dục phổ thông 2018 bằng trí tuệ nhân tạo.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate("generator")}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-600 active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4" /> Soạn Đề Bằng AI
            </button>
            <button
              onClick={() => onNavigate("curriculum")}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 backdrop-blur-md transition-all"
            >
              Tra Cứu SGK Lớp 6
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Tổng số đề đã soạn",
            value: totalQuizzes,
            unit: "bộ đề",
            icon: BookOpen,
            color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
          },
          {
            title: "Tổng số câu hỏi",
            value: totalQuestions,
            unit: "câu",
            icon: HelpCircle,
            color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400",
          },
          {
            title: "Lượt làm bài online",
            value: totalSubmissions,
            unit: "lượt",
            icon: Users,
            color: "text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400",
          },
          {
            title: "Điểm trung bình",
            value: averageScore,
            unit: "/10 điểm",
            icon: Award,
            color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
          },
        ].map((item, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">{item.title}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{item.value}</span>
                <span className="text-xs text-slate-400">{item.unit}</span>
              </div>
            </div>
            <div className={`rounded-xl p-3 ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Charts & Recents */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* SVG Charts Panel */}
        <div className="xl:col-span-1 space-y-6">
          {/* Difficulty Chart */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">Phân Bổ Độ Khó (Mức Độ Nhận Thức)</h3>
            
            <div className="space-y-3.5">
              {[
                { label: "Nhận biết (Cơ bản)", count: diffCounts.easy, percent: Math.round((diffCounts.easy / totalDiffQuestions) * 100), color: "bg-emerald-500", labelColor: "text-emerald-600 dark:text-emerald-400" },
                { label: "Thông hiểu (Khá)", count: diffCounts.medium, percent: Math.round((diffCounts.medium / totalDiffQuestions) * 100), color: "bg-blue-500", labelColor: "text-blue-600 dark:text-blue-400" },
                { label: "Vận dụng (Giỏi)", count: diffCounts.hard, percent: Math.round((diffCounts.hard / totalDiffQuestions) * 100), color: "bg-orange-500", labelColor: "text-orange-600 dark:text-orange-400" },
                { label: "Vận dụng cao (Giỏi-Xuất sắc)", count: diffCounts.very_hard, percent: Math.round((diffCounts.very_hard / totalDiffQuestions) * 100), color: "bg-rose-500", labelColor: "text-rose-600 dark:text-rose-400" },
              ].map((diff, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600 dark:text-slate-400">{diff.label}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{diff.count} câu ({diff.percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${diff.color}`} style={{ width: `${diff.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question Type Distribution */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">Các Dạng Bài Đã Tạo</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Trắc nghiệm khách quan", count: typeCounts.multiple_choice, percent: Math.round((typeCounts.multiple_choice / totalTypeQuestions) * 100), color: "border-blue-500 text-blue-600 bg-blue-50/40 dark:bg-blue-950/20" },
                { label: "Đúng / Sai", count: typeCounts.true_false, percent: Math.round((typeCounts.true_false / totalTypeQuestions) * 100), color: "border-emerald-500 text-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20" },
                { label: "Ghép đôi cột", count: typeCounts.matching, percent: Math.round((typeCounts.matching / totalTypeQuestions) * 100), color: "border-purple-500 text-purple-600 bg-purple-50/40 dark:bg-purple-950/20" },
                { label: "Điền khuyết / Điền số", count: typeCounts.fill_blank, percent: Math.round((typeCounts.fill_blank / totalTypeQuestions) * 100), color: "border-amber-500 text-amber-600 bg-amber-50/40 dark:bg-amber-950/20" },
              ].map((t, i) => (
                <div key={i} className={`rounded-xl border p-3 flex flex-col justify-between ${t.color}`}>
                  <span className="text-xs font-semibold truncate leading-tight">{t.label}</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-lg font-bold">{t.count}</span>
                    <span className="text-2xs opacity-80">{t.percent}%</span>
                  </div>
                </div>
              ))}
              <div className="col-span-2 rounded-xl border border-rose-500 text-rose-600 bg-rose-50/40 dark:bg-rose-950/20 p-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Tự luận / Giải toán thực tế</span>
                  <span className="text-2xs opacity-80 mt-0.5">Tích hợp chấm điểm tự động bằng AI</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">{typeCounts.essay}</span>
                  <span className="text-xs ml-1 opacity-80">({Math.round((typeCounts.essay / totalTypeQuestions) * 100)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Quizzes List */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base">Bộ Đề Mới Soạn</h3>
            <button 
              onClick={() => onNavigate("bank")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Xem tất cả <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {quizzes.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                Chưa có đề thi nào được tạo. Bấm "Soạn Đề Bằng AI" để bắt đầu!
              </div>
            ) : (
              quizzes.map((quiz) => (
                <div key={quiz.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 group">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 text-2xs font-semibold">
                        {quiz.questions.length} câu
                      </span>
                      <span className="text-2xs text-slate-400">
                        {new Date(quiz.createdAt).toLocaleDateString("vi-VN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <h4 
                      onClick={() => { onSelectQuiz(quiz); onNavigate("bank"); }}
                      className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate"
                    >
                      {quiz.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Tác giả: {quiz.createdBy} • Đề thuộc bài học của chương trình Kết nối tri thức.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { onSelectQuiz(quiz); onNavigate("test"); }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Làm online
                    </button>
                    <button
                      onClick={() => { onSelectQuiz(quiz); onNavigate("bank"); }}
                      className="inline-flex items-center justify-center rounded-lg h-8 w-8 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/20 dark:hover:text-blue-400"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
