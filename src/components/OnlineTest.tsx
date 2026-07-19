import React, { useState, useEffect, useRef } from "react";
import { Quiz, Question, QuestionType, Difficulty, Student, UnlockRequest, StudentSubmission } from "../types";
import { 
  Clock, 
  User, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowLeft, 
  HelpCircle,
  RefreshCw,
  BookOpen,
  Lock,
  Unlock,
  AlertTriangle,
  UserCheck
} from "lucide-react";
import { renderMath } from "../utils/mathFormatter";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Nhận biết (Cơ bản)",
  medium: "Thông hiểu (Khá)",
  hard: "Vận dụng (Giỏi)",
  very_hard: "Vận dụng cao (Nâng cao)",
};

interface OnlineTestProps {
  quiz: Quiz | null;
  onNavigate: (tab: string) => void;
  onAddSubmission: (submission: StudentSubmission) => void;
  students: Student[];
  unlockRequests: UnlockRequest[];
  onAddUnlockRequest: (request: UnlockRequest) => void;
  submissions: StudentSubmission[];
  quizzes?: Quiz[];
  currentStudent?: Student | null;
  userRole?: "admin" | "student" | null;
  onSelectQuiz?: (quiz: Quiz | null) => void;
}

export default function OnlineTest({ 
  quiz, 
  onNavigate, 
  onAddSubmission, 
  students, 
  unlockRequests, 
  onAddUnlockRequest, 
  submissions,
  quizzes = [],
  currentStudent = null,
  userRole = "admin",
  onSelectQuiz
}: OnlineTestProps) {
  // Student administrative info
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  
  // Auth message state
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [testStarted, setTestStarted] = useState(false);

  // Sync state if student is logged in
  useEffect(() => {
    if (currentStudent) {
      setStudentId(currentStudent.id);
      setStudentName(currentStudent.name);
      setStudentClass(currentStudent.class);
      setAuthSuccess(`Đã xác minh: ${currentStudent.name} - ${currentStudent.class}`);
    } else {
      setStudentId("");
      setStudentName("");
      setStudentClass("");
      setAuthSuccess("");
    }
  }, [currentStudent]);

  // Attempt tracker
  const [currentAttempt, setCurrentAttempt] = useState(1);

  // Active quiz playing state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Grading outcomes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [detailedGrades, setDetailedGrades] = useState<Record<string, { score: number; comment: string; isAIGraded?: boolean }>>({});
  const [isAIGrading, setIsAIGrading] = useState(false);

  // Refs for auto-submit safety
  const answersRef = useRef(answers);
  const studentNameRef = useRef(studentName);
  const studentClassRef = useRef(studentClass);
  const studentIdRef = useRef(studentId);
  const currentAttemptRef = useRef(currentAttempt);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { studentNameRef.current = studentName; }, [studentName]);
  useEffect(() => { studentClassRef.current = studentClass; }, [studentClass]);
  useEffect(() => { studentIdRef.current = studentId; }, [studentId]);
  useEffect(() => { currentAttemptRef.current = currentAttempt; }, [currentAttempt]);

  // Timers: countdown or countup
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive) {
      timer = setInterval(() => {
        setElapsedTime(prev => {
          const next = prev + 1;
          // Check countdown limit
          if (quiz?.timeLimit && quiz.timeLimit > 0 && next >= quiz.timeLimit * 60) {
            clearInterval(timer);
            setTimerActive(false);
            // Trigger auto submit with latest ref values
            setTimeout(() => {
              handleSubmitTest(true);
            }, 100);
            return quiz.timeLimit * 60;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerActive, quiz]);

  const isQuizInTimeframe = (q: Quiz) => {
    const nowStr = new Date().toISOString();
    if (q.startTime && typeof q.startTime === "string" && q.startTime.trim() !== "" && nowStr < q.startTime) {
      return false;
    }
    if (q.endTime && typeof q.endTime === "string" && q.endTime.trim() !== "" && nowStr > q.endTime) {
      return false;
    }
    return true;
  };

  if (!quiz) {
    if (currentStudent) {
      // Filter quizzes active in student's login/access timeframe AND assigned to their class
      const activeQuizzes = quizzes.filter(q => {
        const inTime = isQuizInTimeframe(q);
        const assigned = !q.assignedClasses || !Array.isArray(q.assignedClasses) || q.assignedClasses.length === 0 || q.assignedClasses.includes(currentStudent.class);
        return inTime && assigned;
      });

      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-850 text-white rounded-2xl p-6 shadow-md border border-blue-950 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 h-32 w-32 rounded-full bg-blue-500/15 blur-2xl"></div>
            <div className="space-y-2 relative z-10">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-3xs font-extrabold uppercase tracking-widest">
                Cổng thông tin học tập
              </span>
              <h2 className="font-display font-bold text-lg md:text-xl">Chào em, {currentStudent.name}!</h2>
              <p className="text-xs text-blue-100">
                Lớp: <span className="font-bold">{currentStudent.class}</span> • Mã học sinh: <span className="font-mono font-bold text-yellow-400">{currentStudent.id}</span>
              </p>
              <p className="text-2xs text-blue-200/80">
                Hãy lựa chọn một bài kiểm tra ôn tập dưới đây đang mở trong khung giờ quy định để tiến hành làm bài.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm mb-4 flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-blue-600" /> Danh Sách Bài Ôn Luyện Đang Mở
            </h3>

            {activeQuizzes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-850 p-12 text-center bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center space-y-3">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
                <h3 className="font-display font-bold text-slate-800 dark:text-slate-200 text-xs">Hiện không có bài làm nào trong khung giờ này</h3>
                <p className="text-2xs text-slate-500 dark:text-slate-400">
                  Các đề ôn luyện đã hết hạn làm bài hoặc chưa đến giờ mở đề. Vui lòng liên hệ với giáo viên bộ môn hoặc chuyển sang tab "Lịch sử & Kết quả" để xem kết quả của các bài thi trước.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeQuizzes.map(q => {
                  const studentSubs = submissions.filter(s => s.quizId === q.id && s.studentId === currentStudent.id);
                  const attemptCount = studentSubs.length;
                  const firstAttemptScore = studentSubs.find(s => s.attempt === 1)?.score;
                  const secondAttemptScore = studentSubs.find(s => s.attempt === 2)?.score;

                  let statusBadge = (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold dark:bg-emerald-950/40 dark:text-emerald-400">
                      Chưa làm
                    </span>
                  );
                  let actionButton = (
                    <button
                      onClick={() => onSelectQuiz && onSelectQuiz(q)}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-2xs px-4 py-2 shadow-sm transition-colors"
                    >
                      Bắt đầu làm bài
                    </button>
                  );

                  if (attemptCount === 1) {
                    const req = unlockRequests.find(r => r.quizId === q.id && r.studentId === currentStudent.id);
                    if (req && req.unlocked) {
                      statusBadge = (
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 font-bold dark:bg-orange-950/40 dark:text-orange-400">
                          Đã làm Lượt 1 ({firstAttemptScore}đ) • Đã mở khóa Lượt 2
                        </span>
                      );
                      actionButton = (
                        <button
                          onClick={() => onSelectQuiz && onSelectQuiz(q)}
                          className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-2xs px-4 py-2 shadow-sm transition-colors"
                        >
                          Làm bài Lượt 2
                        </button>
                      );
                    } else if (req && !req.unlocked) {
                      statusBadge = (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold dark:bg-amber-950/40 dark:text-amber-400">
                          Đã làm Lượt 1 ({firstAttemptScore}đ) • Chờ duyệt mở khóa Lượt 2
                        </span>
                      );
                      actionButton = (
                        <button
                          disabled
                          className="rounded-xl bg-slate-100 text-slate-400 font-bold text-2xs px-4 py-2 border cursor-not-allowed dark:bg-slate-800 dark:border-slate-700"
                        >
                          Chờ duyệt...
                        </button>
                      );
                    } else {
                      statusBadge = (
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold dark:bg-indigo-950/40 dark:text-indigo-400">
                          Đã làm Lượt 1 ({firstAttemptScore}đ) • Khóa Lượt 2
                        </span>
                      );
                      actionButton = (
                        <button
                          onClick={() => {
                            const newRequest: UnlockRequest = {
                              id: "req-" + Date.now(),
                              studentId: currentStudent.id,
                              studentName: currentStudent.name,
                              studentClass: currentStudent.class,
                              quizId: q.id,
                              quizTitle: q.title,
                              requestedAt: new Date().toISOString(),
                              unlocked: false
                            };
                            onAddUnlockRequest(newRequest);
                            alert("Đã gửi yêu cầu mở khóa lượt 2 thành công tới giáo viên!");
                          }}
                          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-2xs px-4 py-2 shadow-sm transition-colors flex items-center gap-1"
                        >
                          <Unlock className="h-3 w-3" /> Gửi yêu cầu Lượt 2
                        </button>
                      );
                    }
                  } else if (attemptCount >= 2) {
                    statusBadge = (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold dark:bg-slate-800 dark:text-slate-400">
                        Đã hoàn thành (L1: {firstAttemptScore}đ - L2: {secondAttemptScore}đ)
                      </span>
                    );
                    actionButton = (
                      <span className="text-2xs font-bold text-slate-400 italic">Đã nộp tối đa 2 lượt</span>
                    );
                  }

                  return (
                    <div key={q.id} className="rounded-2xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2 flex-wrap text-2xs">
                          <span className="font-bold text-indigo-600 uppercase tracking-widest block">Mã đề: {q.id}</span>
                          {statusBadge}
                        </div>

                        <h4 className="font-display font-black text-slate-800 dark:text-slate-200 text-xs md:text-sm line-clamp-2 leading-relaxed">
                          {q.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-3xs font-bold text-slate-400 uppercase tracking-wider">
                          <span>Số lượng: {q.questions.length} câu</span>
                          {q.timeLimit ? (
                            <span className="flex items-center gap-1 text-orange-500"><Clock className="h-3 w-3" /> {q.timeLimit} phút</span>
                          ) : (
                            <span>Thời gian tự do</span>
                          )}
                          {q.assignedClasses && q.assignedClasses.length > 0 && (
                            <span className="text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">
                              Lớp: {q.assignedClasses.join(", ")}
                            </span>
                          )}
                        </div>

                        {q.endTime && (
                          <div className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 bg-rose-50/50 dark:bg-rose-950/20 px-2.5 py-1 rounded-lg">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>Hạn nộp: {new Date(q.endTime).toLocaleString("vi-VN")}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-50 dark:border-slate-850 mt-4 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">Đơn vị soạn: {q.schoolName || "GDPT Kết nối tri thức"}</span>
                        {actionButton}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-850 p-12 text-center bg-white dark:bg-slate-900 shadow-sm space-y-4 flex flex-col items-center justify-center">
        <HelpCircle className="h-10 w-10 text-slate-300" />
        <h3 className="font-display font-bold text-slate-800 dark:text-slate-200">Chưa Chọn Đề Thi Để Làm Bài</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Vui lòng quay lại Ngân Hàng Đề và bấm nút "Làm online" để bắt đầu thử sức.</p>
        <button
          onClick={() => onNavigate("bank")}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2"
        >
          Đến Ngân Hàng Đề
        </button>
      </div>
    );
  }

  // Look up student by code
  const handleVerifyStudentCode = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    const targetId = studentIdInput.trim().toUpperCase();
    if (!targetId) {
      setAuthError("Vui lòng nhập mã học sinh!");
      return;
    }

    const matched = students.find(st => st.id === targetId);
    if (!matched) {
      setAuthError("Mã học sinh không đúng hoặc chưa có trong danh sách của giáo viên. Vui lòng liên hệ giáo viên để được cấp mã!");
      setStudentName("");
      setStudentClass("");
      setStudentId("");
      return;
    }

    if (quiz && quiz.assignedClasses && quiz.assignedClasses.length > 0) {
      if (!quiz.assignedClasses.includes(matched.class)) {
        setAuthError(`Đề thi này không được giao cho lớp ${matched.class} của em. Đề thi chỉ được giao cho: ${quiz.assignedClasses.join(", ")}`);
        setStudentName("");
        setStudentClass("");
        setStudentId("");
        return;
      }
    }

    setStudentId(matched.id);
    setStudentName(matched.name);
    setStudentClass(matched.class);
    setAuthSuccess(`Xác minh thành công: Học sinh ${matched.name} - Lớp ${matched.class}`);
  };

  // Check quiz accessibility based on date & attempts
  const checkQuizAccessibility = () => {
    const nowStr = new Date().toISOString();
    
    // 1. Check start date
    if (quiz.startTime && nowStr < quiz.startTime) {
      return {
        allowed: false,
        reason: `Bài ôn tập chưa mở. Thời gian mở: ${new Date(quiz.startTime).toLocaleString("vi-VN")}`
      };
    }

    // 2. Check end date
    if (quiz.endTime && nowStr > quiz.endTime) {
      return {
        allowed: false,
        reason: `Bài ôn tập đã khóa / quá hạn chót nộp bài. Thời gian đóng: ${new Date(quiz.endTime).toLocaleString("vi-VN")}`
      };
    }

    // 2.5. Check class assignment restriction
    if (studentId && quiz.assignedClasses && quiz.assignedClasses.length > 0) {
      if (!quiz.assignedClasses.includes(studentClass)) {
        return {
          allowed: false,
          reason: `Đề thi này chỉ được giao cho các lớp: ${quiz.assignedClasses.join(", ")}. Lớp hiện tại của em là ${studentClass}, không thể truy cập đề thi này!`
        };
      }
    }

    // 3. Check attempts count
    if (studentId) {
      const pastAttempts = submissions.filter(s => s.quizId === quiz.id && s.studentId === studentId);
      const attemptCount = pastAttempts.length;

      if (attemptCount === 0) {
        return { allowed: true, attempt: 1 };
      } else if (attemptCount === 1) {
        // Must check if teacher approved unlock for 2nd attempt
        const unlockReq = unlockRequests.find(r => r.quizId === quiz.id && r.studentId === studentId);
        if (unlockReq && unlockReq.unlocked) {
          return { allowed: true, attempt: 2 };
        } else if (unlockReq && !unlockReq.unlocked) {
          return { 
            allowed: false, 
            reason: "Yêu cầu mở khóa lượt làm bài thứ 2 của bạn đang chờ giáo viên duyệt. Vui lòng đợi giáo viên phê duyệt mở khóa trước khi tiếp tục!",
            pendingRequest: true
          };
        } else {
          return {
            allowed: false,
            reason: "Bạn đã hoàn thành lượt làm bài thứ 1. Bạn được làm tối đa 2 lượt, nhưng lượt thứ 2 cần giáo viên phê duyệt mở khóa.",
            needsRequest: true
          };
        }
      } else {
        return {
          allowed: false,
          reason: "Bạn đã sử dụng hết tối đa 2 lượt làm bài cho đề thi ôn luyện này."
        };
      }
    }

    return { allowed: false, reason: "Vui lòng nhập mã học sinh để kiểm tra quyền làm bài." };
  };

  const accessibility = checkQuizAccessibility();

  const handleRequestUnlock = () => {
    if (!studentId || !quiz) return;

    const newRequest: UnlockRequest = {
      id: "req-" + Date.now(),
      studentId,
      studentName,
      studentClass,
      quizId: quiz.id,
      quizTitle: quiz.title,
      requestedAt: new Date().toISOString(),
      unlocked: false
    };

    onAddUnlockRequest(newRequest);
    alert("Đã gửi yêu cầu mở khóa lượt 2 thành công tới giáo viên! Vui lòng chờ giáo viên duyệt rồi tải lại phòng thi.");
  };

  const handleStartTest = () => {
    if (!accessibility.allowed) return;
    
    setTestStarted(true);
    setTimerActive(true);
    setElapsedTime(0);
    setAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setCurrentAttempt(accessibility.attempt || 1);
  };

  const handleMCQSelect = (qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleTFSelect = (qId: string, statementId: string, value: boolean) => {
    const currentTFAnswers = answers[qId] || {};
    setAnswers(prev => ({
      ...prev,
      [qId]: { ...currentTFAnswers, [statementId]: value }
    }));
  };

  const handleMatchingSelect = (qId: string, pairId: string, leftLabel: string, rightValue: string) => {
    const currentMatches = answers[qId] || {};
    setAnswers(prev => ({
      ...prev,
      [qId]: { ...currentMatches, [pairId]: { left: leftLabel, rightSelected: rightValue } }
    }));
  };

  const formatElapsedTime = (sec: number) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatCountdownTime = (elapsed: number, limitMins: number) => {
    const limitSecs = limitMins * 60;
    const remaining = Math.max(0, limitSecs - elapsed);
    const min = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${min.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Grade quiz
  const handleSubmitTest = async (isAutoSubmit = false) => {
    setTimerActive(false);
    setIsAIGrading(true);

    let objectiveScore = 0;
    const gradingReport: Record<string, { score: number; comment: string; isAIGraded?: boolean }> = {};

    // Use current states or latest Ref values if auto submitted
    const finalAnswers = answersRef.current;
    const finalStudentName = studentNameRef.current;
    const finalStudentClass = studentClassRef.current;
    const finalStudentId = studentIdRef.current;
    const finalAttempt = currentAttemptRef.current;

    const objectiveQuestions = quiz.questions.filter(q => q.type !== "essay");
    const essayQuestions = quiz.questions.filter(q => q.type === "essay");

    const pointsPerQuestion = 10 / quiz.questions.length;

    objectiveQuestions.forEach(q => {
      let isCorrect = false;
      let feedbackComment = "";

      if (q.type === "multiple_choice") {
        isCorrect = finalAnswers[q.id] === q.correctAnswer;
        feedbackComment = isCorrect 
          ? "Chính xác! Bạn đã chọn đúng đáp án." 
          : `Chưa đúng. Đáp án đúng là ${q.correctAnswer}.`;
      } 
      else if (q.type === "fill_blank") {
        const studentAnsStr = (finalAnswers[q.id] || "").toString().trim().toLowerCase();
        const correctAnsStr = q.correctAnswer.trim().toLowerCase();
        isCorrect = studentAnsStr === correctAnsStr;
        feedbackComment = isCorrect 
          ? "Chính xác! Bạn đã điền đúng số." 
          : `Chưa đúng. Kết quả chuẩn là: ${q.correctAnswer}`;
      } 
      else if (q.type === "true_false" && q.trueFalseStatements) {
        const studentTF = finalAnswers[q.id] || {};
        let matches = 0;
        q.trueFalseStatements.forEach(tf => {
          if (studentTF[tf.id] === tf.answer) {
            matches++;
          }
        });
        isCorrect = matches === q.trueFalseStatements.length;
        feedbackComment = `Tích đúng ${matches}/${q.trueFalseStatements.length} phát biểu.`;
      } 
      else if (q.type === "matching" && q.matchingPairs) {
        const studentMatches = finalAnswers[q.id] || {};
        const pairsCount = q.matchingPairs.length;
        let correctPairs = 0;
        
        q.matchingPairs.forEach(pair => {
          const leftLetter = pair.left.charAt(0);
          const rightNumberSelected = studentMatches[pair.id]?.rightSelected || "";
          const rightDigit = rightNumberSelected.charAt(0);
          
          if (leftLetter && rightDigit) {
            const expectedMatchString = `${leftLetter}-${rightDigit}`;
            if (q.correctAnswer.includes(expectedMatchString)) {
              correctPairs++;
            }
          }
        });
        isCorrect = correctPairs === pairsCount;
        feedbackComment = `Ghép nối chính xác ${correctPairs}/${pairsCount} cặp thẻ.`;
      }

      const qScore = isCorrect ? pointsPerQuestion : 0;
      objectiveScore += qScore;
      gradingReport[q.id] = {
        score: parseFloat(qScore.toFixed(2)),
        comment: feedbackComment
      };
    });

    let totalScoreAccumulator = objectiveScore;

    // Essay grading via AI proxy API
    for (const eq of essayQuestions) {
      const studentEssayAns = finalAnswers[eq.id] || "Thí sinh bỏ trống câu này.";
      
      try {
        const response = await fetch("/api/grade-essay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionPrompt: eq.prompt,
            studentAnswer: studentEssayAns,
            correctAnswer: eq.correctAnswer,
            solution: eq.solution,
            difficulty: eq.difficulty
          })
        });

        if (!response.ok) {
          throw new Error("Không thể gọi trợ lý AI chấm bài.");
        }

        const data = await response.json();
        const rawScoreOutof10 = parseFloat(data.score) || 0;
        const mappedEssayScore = (rawScoreOutof10 / 10) * pointsPerQuestion;
        
        totalScoreAccumulator += mappedEssayScore;
        gradingReport[eq.id] = {
          score: parseFloat(mappedEssayScore.toFixed(2)),
          comment: `[Chấm bởi AI - Điểm đạt ${rawScoreOutof10}/10]: ${data.comment}`,
          isAIGraded: true
        };
      } catch (err: any) {
        console.error(err);
        gradingReport[eq.id] = {
          score: 0,
          comment: "Không thể gọi AI chấm tự luận chi tiết. Ghi nhận 0đ cho bài viết này."
        };
      }
    }

    const finalScore = parseFloat(Math.min(10, totalScoreAccumulator).toFixed(1));
    setScore(finalScore);
    setDetailedGrades(gradingReport);
    setIsAIGrading(false);
    setIsSubmitted(true);

    const submissionData: StudentSubmission = {
      id: "sub-" + Date.now(),
      quizId: quiz.id,
      studentId: finalStudentId || undefined,
      studentName: finalStudentName,
      studentClass: finalStudentClass,
      submittedAt: new Date().toISOString(),
      answers: finalAnswers,
      score: finalScore,
      feedback: gradingReport,
      isGraded: true,
      attempt: finalAttempt
    };

    onAddSubmission(submissionData);

    if (isAutoSubmit) {
      alert("Thời gian làm bài đã kết thúc! Hệ thống tự động ghi nhận và nộp bài ôn tập của bạn.");
    }
  };

  return (
    <div className="space-y-6">
      {!testStarted ? (
        /* Form entry authentication and attempt control */
        <div className="max-w-lg mx-auto rounded-2xl border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto rounded-full bg-blue-50 dark:bg-blue-950/40 h-12 w-12 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <User className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-lg">Đăng Nhập Phòng Ôn Luyện</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Nhập mã học sinh được giáo viên cấp phát để xác minh danh tính và kiểm tra lượt làm bài còn lại.
            </p>
          </div>

          <form onSubmit={handleVerifyStudentCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mã Học Sinh (Do giáo viên cấp)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: HS001"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="w-full text-xs font-mono font-bold p-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl active:scale-95 transition-all flex items-center gap-1 shrink-0"
                >
                  <UserCheck className="h-4 w-4" /> Xác minh
                </button>
              </div>
            </div>

            {authError && (
              <p className="text-2xs font-semibold text-rose-500 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg">
                <AlertTriangle className="h-3.5 w-3.5" /> {authError}
              </p>
            )}

            {authSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl space-y-1">
                <p className="text-2xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {authSuccess}
                </p>
              </div>
            )}
          </form>

          {/* Verification Actions & Attempts block */}
          {studentId && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/40 dark:bg-slate-950/20 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-blue-500" /> Trạng thái làm bài đề ôn tập:
                </h4>
                
                {accessibility.allowed ? (
                  <div className="space-y-3.5">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Đề bài: <span className="font-bold text-slate-900 dark:text-slate-100">{quiz.title}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5 text-2xs">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold dark:bg-blue-950/40 dark:text-blue-400">
                        LƯỢT LÀM BÀI: {accessibility.attempt}/2
                      </span>
                      {quiz.timeLimit ? (
                        <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-600 font-bold dark:bg-orange-950/40 dark:text-orange-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {quiz.timeLimit} phút
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold dark:bg-slate-800 dark:text-slate-400">
                          Thời gian tự do
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={handleStartTest}
                      className="w-full py-3 rounded-xl bg-orange-400 hover:bg-orange-500 text-white font-bold text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play className="h-4 w-4 fill-current" /> Bắt đầu làm bài (Lượt {accessibility.attempt})
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    <div className="flex gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 font-semibold text-2xs">
                      <Lock className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                      <span>{accessibility.reason}</span>
                    </div>

                    {accessibility.needsRequest && (
                      <button
                        onClick={handleRequestUnlock}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-2xs tracking-wide shadow-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Unlock className="h-3.5 w-3.5" /> Gửi yêu cầu mở khóa làm bài Lượt 2
                      </button>
                    )}

                    {accessibility.pendingRequest && (
                      <div className="text-center py-2">
                        <p className="text-2xs text-slate-400">Vui lòng tải lại trang hoặc liên hệ giáo viên để được phê duyệt nhanh chóng.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quiz Basic Constraints info summary */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-850 p-4 bg-slate-50/20 dark:bg-slate-950/10 space-y-2 text-2xs text-slate-400">
            <h4 className="font-bold text-slate-600 dark:text-slate-400">Thông tin bổ sung đề kiểm tra:</h4>
            <div className="grid grid-cols-2 gap-2">
              <span>Đơn vị soạn: {quiz.schoolName || "GDPT Kết nối tri thức"}</span>
              <span>Số lượng: {quiz.questions.length} câu</span>
              {quiz.startTime && <span>Mở từ: {new Date(quiz.startTime).toLocaleDateString("vi-VN")} {new Date(quiz.startTime).toLocaleTimeString("vi-VN")}</span>}
              {quiz.endTime && <span>Đến hạn: {new Date(quiz.endTime).toLocaleDateString("vi-VN")} {new Date(quiz.endTime).toLocaleTimeString("vi-VN")}</span>}
            </div>
          </div>

          {currentStudent && onSelectQuiz && (
            <button
              onClick={() => onSelectQuiz(null)}
              className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại cổng học sinh
            </button>
          )}
        </div>
      ) : (
        /* Quiz Gameplay and Score reports */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel: Question Board Navigation */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Phiếu làm bài (Lượt {currentAttempt})
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-lg">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {quiz.timeLimit && quiz.timeLimit > 0
                    ? formatCountdownTime(elapsedTime, quiz.timeLimit)
                    : formatElapsedTime(elapsedTime)
                  }
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isActive = currentQuestionIndex === idx;
                
                let btnColor = "bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-950 dark:border-slate-850";
                if (isAnswered) btnColor = "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900";
                if (isActive) btnColor = "bg-orange-500 border-orange-500 text-white dark:text-white";

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-9 rounded-lg border text-xs font-bold flex items-center justify-center transition-all ${btnColor}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-2xs text-slate-400">Thí sinh: <span className="font-bold text-slate-700 dark:text-slate-300">{studentName}</span></p>
              <p className="text-2xs text-slate-400">Lớp: <span className="font-bold text-slate-700 dark:text-slate-300">{studentClass}</span></p>
              <p className="text-2xs text-slate-400">Mã số: <span className="font-mono font-bold text-blue-500">{studentId}</span></p>
            </div>

            {!isSubmitted && (
              <button
                onClick={() => handleSubmitTest(false)}
                disabled={isAIGrading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isAIGrading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Chấm tự động...
                  </>
                ) : (
                  "Nộp bài & Chấm điểm"
                )}
              </button>
            )}
          </div>

          {/* Center Panel: Active Question Display OR Scoreboard */}
          <div className="lg:col-span-3 space-y-6">
            {isSubmitted ? (
              /* Submission Score Report */
              <div className="space-y-6">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 md:p-8 border border-indigo-950 shadow-xl flex items-center justify-between flex-wrap gap-6 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl"></div>
                  
                  <div className="space-y-2 relative z-10">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-2xs font-semibold text-blue-200">
                      <Award className="h-3 w-3" /> PHIẾU ĐIỂM CHẤM TỰ ĐỘNG
                    </div>
                    <h3 className="font-display font-bold text-lg md:text-xl">{studentName} - {studentClass}</h3>
                    <p className="text-xs text-slate-400">Lượt thi số: {currentAttempt} • Mã số HS: {studentId}</p>
                    <p className="text-xs text-slate-400">Thời gian hoàn thành: {formatElapsedTime(elapsedTime)}</p>
                  </div>

                  <div className="text-center relative z-10 shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl min-w-[120px]">
                    <span className="text-3xs font-bold uppercase tracking-wider text-orange-400 block">KẾT QUẢ</span>
                    <span className="text-4xl md:text-5xl font-black font-display text-white">{score}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">/10 điểm</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5">
                  <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" /> Báo cáo giải trình và lời giải chi tiết
                  </h3>

                  <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800/60">
                    {quiz.questions.map((q, idx) => {
                      const grade = detailedGrades[q.id];
                      const points = 10 / quiz.questions.length;
                      const isCorrect = grade?.score === points;

                      return (
                        <div key={q.id} className="pt-5 first:pt-0 space-y-3">
                          <div className="flex justify-between items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300">
                              Câu hỏi {idx + 1}
                            </h4>
                            <div className="flex items-center gap-1.5">
                              <span className="text-3xs font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5">
                                Điểm đạt: {grade?.score || 0} / {parseFloat(points.toFixed(2))}đ
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
                            <p className="text-slate-500">Bài làm của bạn:</p>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {q.type === "essay" 
                                ? (answers[q.id] || "Không làm.") 
                                : q.type === "multiple_choice"
                                ? `Lựa chọn ${answers[q.id] || "Bỏ trống"}`
                                : JSON.stringify(answers[q.id] || "Bỏ trống")
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
                              <strong>Giải thích chi tiết:</strong> {q.solution}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-start gap-3">
                  <button
                    onClick={() => {
                      setTestStarted(false);
                      setIsSubmitted(false);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 font-semibold text-xs px-5 py-2.5"
                  >
                    <ArrowLeft className="h-4 w-4" /> Xem lại bài thi vừa làm
                  </button>
                  {currentStudent && onSelectQuiz && (
                    <button
                      onClick={() => {
                        setTestStarted(false);
                        setIsSubmitted(false);
                        onSelectQuiz(null);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 shadow-md"
                    >
                      <BookOpen className="h-4 w-4" /> Quay về danh sách bài ôn tập
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz active questions */
              <div className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5">
                {/* Active Question details */}
                {(() => {
                  const q = quiz.questions[currentQuestionIndex];
                  return (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                        <span className="text-xs font-bold text-slate-500">
                          Câu {currentQuestionIndex + 1} trên tổng {quiz.questions.length} câu
                        </span>
                        <span className="text-3xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                          Mức độ: {DIFFICULTY_LABELS[q.difficulty].split(" ")[0]}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm md:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {renderMath(q.prompt)}
                        </p>

                        {/* Interactive Inputs */}
                        {q.type === "multiple_choice" && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {q.options.map((opt, oIdx) => {
                              const letter = opt.trim().charAt(0);
                              const isSelected = answers[q.id] === letter;
                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleMCQSelect(q.id, letter)}
                                  className={`option-transition text-left p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
                                    isSelected
                                      ? "bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900"
                                      : "bg-white border-slate-100 hover:bg-slate-50 text-slate-600 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-300"
                                  }`}
                                >
                                  <span>{renderMath(opt)}</span>
                                  <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white"}`}>
                                    {isSelected && <div className="h-2 w-2 rounded-full bg-white"></div>}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {q.type === "true_false" && q.trueFalseStatements && (
                          <div className="space-y-2.5 pt-2">
                            {q.trueFalseStatements.map((tf) => {
                              const userTFAnswers = answers[q.id] || {};
                              const activeTF = userTFAnswers[tf.id];

                              return (
                                <div key={tf.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10 flex-wrap gap-2 text-xs">
                                  <span className="font-semibold text-slate-600 dark:text-slate-400">{renderMath(tf.statement)}</span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleTFSelect(q.id, tf.id, true)}
                                      className={`px-4 py-1.5 rounded-lg text-2xs font-semibold border ${
                                        activeTF === true
                                          ? "bg-emerald-500 border-emerald-500 text-white"
                                          : "bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800"
                                      } transition-all`}
                                    >
                                      Đúng
                                    </button>
                                    <button
                                      onClick={() => handleTFSelect(q.id, tf.id, false)}
                                      className={`px-4 py-1.5 rounded-lg text-2xs font-semibold border ${
                                        activeTF === false
                                          ? "bg-rose-500 border-rose-500 text-white"
                                          : "bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800"
                                      } transition-all`}
                                    >
                                      Sai
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.type === "matching" && q.matchingPairs && (
                          <div className="space-y-3 pt-2 text-xs">
                            <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Ghép Cột A với số tương ứng Cột B:</p>
                            {q.matchingPairs.map((pair) => {
                              const userMatches = answers[q.id] || {};
                              const matchObj = userMatches[pair.id];

                              return (
                                <div key={pair.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10 gap-3">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">{renderMath(pair.left)}</span>
                                  
                                  <div className="w-full sm:w-60">
                                    <select
                                      value={matchObj?.rightSelected || ""}
                                      onChange={(e) => handleMatchingSelect(q.id, pair.id, pair.left, e.target.value)}
                                      className="w-full text-2xs font-bold px-2 py-1.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                                    >
                                      <option value="">-- Chọn ghép nối --</option>
                                      {q.matchingPairs.map((p) => (
                                        <option key={p.id} value={p.right}>{p.right}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.type === "fill_blank" && (
                          <div className="pt-2 space-y-1.5">
                            <label className="text-2xs font-semibold text-slate-500">Điền số hoặc đáp số chuẩn:</label>
                            <input
                              type="text"
                              value={answers[q.id] || ""}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                              placeholder="Gõ đáp số của bạn vào đây..."
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                            />
                          </div>
                        )}

                        {q.type === "essay" && (
                          <div className="pt-2 space-y-1.5">
                            <label className="text-2xs font-semibold text-slate-500">Lời giải chi tiết tự luận (Trợ lý AI sẽ chấm điểm dựa trên từng bước giải của bạn):</label>
                            <textarea
                              value={answers[q.id] || ""}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                              placeholder="Trình bày chi tiết lời giải gồm giả thiết, các bước suy luận, phép toán và đáp số..."
                              className="w-full h-44 text-xs p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Question Navigation Controls footer */}
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-4 mt-4">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs px-4 py-2 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" /> Câu Trước
                  </button>

                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                    disabled={currentQuestionIndex === quiz.questions.length - 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs px-4 py-2 disabled:opacity-40"
                  >
                    Câu Tiếp <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full-screen Loading Overlay for AI Grading */}
      {isAIGrading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 text-center space-y-6 shadow-2xl">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-lg">AI Đang Chấm Bài</h3>
              <p className="text-xs font-semibold text-orange-500 animate-pulse">Trợ lý sư phạm đang đọc lời giải và chấm điểm tự luận chi tiết...</p>
            </div>

            <p className="text-2xs text-slate-400">Tiến trình chấm tự luận bằng Gemini có thể mất 5 - 15 giây tùy vào độ dài lời giải học sinh.</p>
          </div>
        </div>
      )}
    </div>
  );
}
