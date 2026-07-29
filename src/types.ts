export type QuestionType =
  | "multiple_choice"   // Trắc nghiệm khách quan
  | "true_false"        // Đúng - Sai
  | "matching"          // Ghép đôi
  | "fill_blank"        // Điền số / Điền khuyết
  | "essay";            // Tự luận / Giải toán / Bài tập thực tế

export type Difficulty =
  | "easy"              // Nhận biết (Cơ bản)
  | "medium"            // Thông hiểu (Khá)
  | "hard"              // Vận dụng (Giỏi)
  | "very_hard";        // Vận dụng cao (Nâng cao)

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface TrueFalseStatement {
  id: string;
  statement: string;
  answer: boolean; // true for Đúng, false for Sai
}

export interface Question {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  cognitiveLevel?: string;      // Tên mức độ nhận thức (VD: I - MỨC ĐỘ NHẬN BIẾT)
  prompt: string;               // Nội dung câu hỏi
  options?: string[];           // Danh sách lựa chọn (cho trắc nghiệm)
  correctAnswer: string;        // Đáp án đúng (hoặc chỉ dẫn cho tự luận/điền khuyết)
  trueFalseStatements?: TrueFalseStatement[]; // Cho dạng câu hỏi Đúng/Sai
  matchingPairs?: MatchingPair[]; // Cho dạng câu hỏi Ghép đôi
  solution: string;             // Lời giải chi tiết từng bước
  hint?: string;                // Gợi ý làm bài
  comment?: string;             // Nhận xét sư phạm
  competency: string;           // Năng lực toán học được đánh giá (ví dụ: Tư duy lập luận toán học, Giải quyết vấn đề)
  hasError?: boolean;           // Đánh dấu phát hiện lỗi khi AI trích xuất/thẩm định
  errorMessage?: string;        // Chi tiết lỗi và chỉ dẫn câu cần sửa
}

export interface Quiz {
  id: string;
  title: string;
  createdAt: string;
  createdBy: string;
  chapterId: string;
  lessonId: string;
  difficultyLevels: Difficulty[];
  questionCount: number;
  types: QuestionType[];
  questions: Question[];
  schoolName?: string;
  examDate?: string;
  timeLimit?: number; // Giới hạn thời gian làm bài (phút), 0 hoặc undefined nghĩa là không giới hạn
  startTime?: string; // Khoảng thời gian bắt đầu làm bài (định dạng YYYY-MM-DDTHH:mm)
  endTime?: string;   // Khoảng thời gian kết thúc làm bài (định dạng YYYY-MM-DDTHH:mm)
  assignedClasses?: string[]; // Danh sách lớp được giao đề thi này
  isGameExercise?: boolean;  // Đánh dấu đây là bài tập dạng Trò chơi tương tác (Quizizz, Wordwall...)
  gameUrl?: string;          // Link trò chơi tương tác giáo viên gắn vào
  gamePlatform?: string;     // Nền tảng (Quizizz, Wordwall, Kahoot, Blooket, GeoGebra, Liveworksheets, Khác)
  gameInstructions?: string; // Hướng dẫn/lưu ý cho học sinh khi chơi trò chơi
  validationReport?: {
    totalQuestions: number;
    validCount: number;
    errorCount: number;
    issuesList?: string[];
  };
}

export interface StudentSubmission {
  id: string;
  quizId: string;
  studentId?: string; // Mã học sinh của học sinh làm bài
  studentName: string;
  studentClass: string;
  submittedAt: string;
  answers: Record<string, any>; // maps questionId to student answer (string for mcq/blank, Record<string, boolean> for true_false, Record<string, string> for matching, string for essay)
  score: number; // calculated score out of 10
  feedback: Record<string, {
    score: number;
    comment: string;
    isAIGraded?: boolean;
    isCorrect?: boolean;
  }>; // questionId -> grading info
  isGraded: boolean;
  attempt?: number; // Số thứ tự lượt làm bài (1 hoặc 2)
}

export interface Student {
  id: string; // Mã học sinh duy nhất (ví dụ: HS001, HS002...)
  name: string; // Họ và tên học sinh
  class: string; // Tên lớp học
}

export interface UnlockRequest {
  id: string; // Mã yêu cầu (unique)
  studentId: string;
  studentName: string;
  studentClass: string;
  quizId: string;
  quizTitle: string;
  requestedAt: string;
  unlocked: boolean; // Trạng thái đã mở khóa lượt làm bài thứ 2 hay chưa
}

export interface SystemStats {
  totalQuizzes: number;
  totalQuestions: number;
  totalSubmissions: number;
  averageScore: number;
  difficultyDistribution: Record<Difficulty, number>;
  typeDistribution: Record<QuestionType, number>;
}
