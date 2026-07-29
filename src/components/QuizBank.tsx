import React, { useState, useEffect } from "react";
import mammoth from "mammoth";
import { Quiz, Question, QuestionType, Difficulty, Student, StudentSubmission } from "../types";
import { Chapter } from "../data/curriculum";
import { MOCK_QUIZZES } from "../data/mockQuizzes";
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
  Plus,
  Sparkles,
  FileJson,
  Upload,
  FileUp,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { renderMath } from "../utils/mathFormatter";

interface QuizBankProps {
  quizzes: Quiz[];
  curriculum: Chapter[];
  students: Student[];
  submissions: StudentSubmission[];
  onDeleteQuiz: (id: string) => void;
  onDuplicateQuiz: (id: string) => void;
  onNavigate: (tab: string) => void;
  onSelectQuiz: (quiz: Quiz) => void;
  selectedQuiz: Quiz | null;
  onUpdateQuiz: (quiz: Quiz) => void;
  onSaveQuiz: (quiz: Quiz) => void;
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
  submissions,
  onDeleteQuiz,
  onDuplicateQuiz,
  onNavigate,
  onSelectQuiz,
  selectedQuiz,
  onUpdateQuiz,
  onSaveQuiz
}: QuizBankProps) {
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChapterId, setFilterChapterId] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [showSampleTemplatesModal, setShowSampleTemplatesModal] = useState(false);
  
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

  const handleImportSampleQuiz = (sampleQuiz: Quiz) => {
    const importedQuiz: Quiz = {
      ...sampleQuiz,
      id: "quiz-sample-import-" + Date.now(),
      title: `${sampleQuiz.title} (Từ đề mẫu)`,
      createdAt: new Date().toISOString(),
      createdBy: "Cô Nguyễn Hà (Tải từ đề mẫu)",
    };
    onSaveQuiz(importedQuiz);
    onSelectQuiz(importedQuiz);
    setShowSampleTemplatesModal(false);
    alert(`Đã tải lên và nhập đề mẫu "${sampleQuiz.title}" thành công vào ngân hàng đề của bạn!`);
  };

  const handleDownloadWordTemplate = () => {
    const sampleQuiz: Quiz = {
      id: "sample-word-template",
      title: "Đề thi ôn tập Toán 6 tự soạn mẫu",
      chapterId: "chuong-1",
      lessonId: "bai-1",
      difficultyLevels: ["easy", "medium"],
      questionCount: 5,
      types: ["multiple_choice", "true_false", "matching", "fill_blank", "essay"],
      questions: [
        {
          id: "sq-1",
          type: "multiple_choice",
          difficulty: "easy",
          prompt: "Kết quả của phép tính 12 + 15 là:",
          options: ["A. 27", "B. 25", "C. 37", "D. 35"],
          correctAnswer: "A. 27",
          solution: "Ta thực hiện cộng trực tiếp: 12 + 15 = 27.",
          competency: "Năng lực giải quyết vấn đề toán học"
        },
        {
          id: "sq-2",
          type: "true_false",
          difficulty: "medium",
          prompt: "Xét tính đúng sai của các khẳng định sau về số nguyên tố:",
          correctAnswer: "Phát biểu 1: Đúng, Phát biểu 2: Sai",
          trueFalseStatements: [
            { "id": "tf-1", "statement": "Số 2 là số nguyên tố chẵn duy nhất.", "answer": true },
            { "id": "tf-2", "statement": "Mọi số lẻ đều là số nguyên tố.", "answer": false }
          ],
          solution: "Số 2 là số nguyên tố chẵn duy nhất (Đúng). Số 9 là số lẻ nhưng không phải số nguyên tố vì chia hết cho 3 (Sai).",
          competency: "Năng lực tư duy và lập luận toán học"
        },
        {
          id: "sq-3",
          type: "matching",
          difficulty: "medium",
          prompt: "Hãy ghép mỗi biểu thức ở cột A với kết quả tương ứng ở cột B:",
          correctAnswer: "3^2 ghép với 9, 2^3 ghép với 8",
          matchingPairs: [
            { "id": "p-1", "left": "3^2", "right": "9" },
            { "id": "p-2", "left": "2^3", "right": "8" }
          ],
          solution: "3^2 = 9; 2^3 = 8.",
          competency: "Năng lực tư duy và lập luận toán học"
        },
        {
          id: "sq-4",
          type: "fill_blank",
          difficulty: "easy",
          prompt: "Tìm số tự nhiên x biết x - 5 = 10. Giá trị của x là:",
          correctAnswer: "15",
          solution: "x = 10 + 5 = 15.",
          competency: "Năng lực tính toán"
        },
        {
          id: "sq-5",
          type: "essay",
          difficulty: "hard",
          prompt: "Một lớp học có 24 học sinh nam và 18 học sinh nữ. Cô giáo muốn chia lớp thành các nhóm sao cho số nam và số nữ ở mỗi nhóm đều bằng nhau. Hỏi cô giáo có thể chia được nhiều nhất bao nhiêu nhóm?",
          correctAnswer: "6 nhóm",
          solution: "Số nhóm nhiều nhất là ƯCLN(24, 18). Ta có 24 = 2^3 * 3, 18 = 2 * 3^2. Do đó ƯCLN(24, 18) = 2 * 3 = 6. Vậy chia được nhiều nhất là 6 nhóm.",
          competency: "Năng lực giải quyết vấn đề toán học"
        }
      ],
      createdAt: new Date().toISOString(),
      createdBy: "Cô Nguyễn Hà (Đề mẫu Word)",
      timeLimit: 45
    };

    handleExportToWord(sampleQuiz, true);
  };

  const handleExportToJSON = (quiz: Quiz) => {
    const quizToExport = {
      title: quiz.title,
      chapterId: quiz.chapterId || "chuong-1",
      lessonId: quiz.lessonId || "bai-1",
      difficultyLevels: quiz.difficultyLevels,
      timeLimit: quiz.timeLimit || 0,
      questions: quiz.questions.map(q => ({
        type: q.type,
        difficulty: q.difficulty,
        prompt: q.prompt,
        options: q.options || undefined,
        correctAnswer: q.correctAnswer,
        trueFalseStatements: q.trueFalseStatements || undefined,
        matchingPairs: q.matchingPairs || undefined,
        solution: q.solution,
        hint: q.hint || undefined,
        comment: q.comment || undefined,
        competency: q.competency || "Năng lực giải quyết vấn đề toán học"
      }))
    };

    const blob = new Blob([JSON.stringify(quizToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.title.replace(/\s+/g, "_")}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadJSONQuiz = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed.title || typeof parsed.title !== "string") {
          throw new Error("Thiếu hoặc sai định dạng thuộc tính 'title' (Tiêu đề đề thi)");
        }
        if (!parsed.questions || !Array.isArray(parsed.questions)) {
          throw new Error("Thiếu hoặc sai định dạng thuộc tính 'questions' (Danh sách câu hỏi phải là một mảng)");
        }
        if (parsed.questions.length === 0) {
          throw new Error("Danh sách câu hỏi trống!");
        }

        const validatedQuestions: Question[] = parsed.questions.map((q: any, index: number) => {
          const qNum = index + 1;
          if (!q.type || !["multiple_choice", "true_false", "matching", "fill_blank", "essay"].includes(q.type)) {
            throw new Error(`Câu hỏi số ${qNum}: Thiếu hoặc loại câu hỏi 'type' không hợp lệ (Phải là multiple_choice, true_false, matching, fill_blank hoặc essay).`);
          }
          if (!q.prompt || typeof q.prompt !== "string") {
            throw new Error(`Câu hỏi số ${qNum}: Thiếu hoặc sai định dạng 'prompt' (Nội dung câu hỏi).`);
          }
          if (q.type === "multiple_choice" && (!q.options || !Array.isArray(q.options) || q.options.length === 0)) {
            throw new Error(`Câu hỏi số ${qNum}: Dạng trắc nghiệm yêu cầu mảng 'options' không được rỗng.`);
          }
          if (q.type === "true_false" && (!q.trueFalseStatements || !Array.isArray(q.trueFalseStatements) || q.trueFalseStatements.length === 0)) {
            throw new Error(`Câu hỏi số ${qNum}: Dạng Đúng/Sai yêu cầu mảng 'trueFalseStatements' chứa các phát biểu.`);
          }
          if (q.type === "matching" && (!q.matchingPairs || !Array.isArray(q.matchingPairs) || q.matchingPairs.length === 0)) {
            throw new Error(`Câu hỏi số ${qNum}: Dạng ghép đôi yêu cầu mảng 'matchingPairs' chứa các cặp ghép.`);
          }
          if (q.correctAnswer === undefined || q.correctAnswer === null) {
            throw new Error(`Câu hỏi số ${qNum}: Thiếu đáp án đúng 'correctAnswer'.`);
          }

          return {
            id: q.id || `q-upload-${Date.now()}-${index}`,
            type: q.type,
            difficulty: q.difficulty || "medium",
            prompt: q.prompt,
            options: q.options || undefined,
            correctAnswer: String(q.correctAnswer),
            trueFalseStatements: q.trueFalseStatements || undefined,
            matchingPairs: q.matchingPairs || undefined,
            solution: q.solution || "Chưa có lời giải chi tiết cho câu hỏi này.",
            hint: q.hint || undefined,
            comment: q.comment || undefined,
            competency: q.competency || "Năng lực giải quyết vấn đề toán học"
          };
        });

        const difficultyLevels = Array.from(new Set(validatedQuestions.map(q => q.difficulty))) as Difficulty[];
        const types = Array.from(new Set(validatedQuestions.map(q => q.type))) as QuestionType[];

        const importedQuiz: Quiz = {
          id: "quiz-upload-import-" + Date.now(),
          title: parsed.title,
          chapterId: parsed.chapterId || "chuong-1",
          lessonId: parsed.lessonId || "bai-1",
          difficultyLevels: difficultyLevels.length > 0 ? difficultyLevels : ["medium"],
          questionCount: validatedQuestions.length,
          types: types.length > 0 ? types : ["multiple_choice"],
          questions: validatedQuestions,
          createdAt: new Date().toISOString(),
          createdBy: "Cô Nguyễn Hà (Upload từ file)",
          timeLimit: parsed.timeLimit || 0,
          schoolName: parsed.schoolName || undefined,
          examDate: parsed.examDate || undefined,
          assignedClasses: parsed.assignedClasses || undefined
        };

        onSaveQuiz(importedQuiz);
        onSelectQuiz(importedQuiz);
        alert(`Đã tải lên và nhập đề tự soạn "${importedQuiz.title}" thành công với ${validatedQuestions.length} câu hỏi!`);
      } catch (err: any) {
        alert(`Lỗi phân tích file đề thi: ${err.message || err}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Upload & AI Document Parse Modal state
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [uploadRawText, setUploadRawText] = useState("");
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string | null>(null);
  const [uploadedFileMimeType, setUploadedFileMimeType] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isParsingDocument, setIsParsingDocument] = useState(false);
  const [parseErrorMessage, setParseErrorMessage] = useState<string | null>(null);
  const [parsedResultQuiz, setParsedResultQuiz] = useState<Quiz | null>(null);

  const SAMPLE_EXAM_DOCUMENT = `BÀI 12. ƯỚC CHUNG. ƯỚC CHUNG LỚN NHẤT. 

I – MỨC ĐỘ NHẬN BIẾT
Câu 1. x là ước chung của số a và b nếu
A. x ∈ Ư(a) và x ∉ Ư(b)
B. x ⊂ Ư(a) và x ⊂ Ư(b)
C. x ∈ Ư(a) và x ∈ Ư(b)
D. x ∉ Ư(a) và x ∉ Ư(b)

Câu 2. Số nào sau đây không phải là ước chung của 12 và 16?
A. 1
B. 2
C. 3
D. 4

Câu 3. Khẳng định nào sau đây là đúng ?
A. 5 ∈ ƯC (4;6;8)
B. 2 ∈ ƯC (4;6;8)
C. 3 ∈ ƯC (4;6;8)
D. 4 ∈ ƯC (4;6;8)

Câu 4. Số nào sau đây vừa là ước của 75, vừa là ước của 63?
A. 7.
B. 3.
C. 6.
D. 4.

Câu 5. Trong các số sau số nào không phải là ước chung của 12 và 30?
A. 2.
B. 3.
C. 6.
D. 4.

II – MỨC ĐỘ THÔNG HIỂU
Câu 6. Ước chung của 9 và 15 là
A. {1;3}
B. {0;3}
C. {1;5}
D. {1;3;9}

Câu 7. Tập hợp ƯC (4; 6) bằng
A. {1;2}
B. {0;2}
C. {1;3}
D. {1;3;2}

Câu 8. ƯCLN (24,36) bằng
A. 24
B. 12
C. 36
D. 6

Câu 9. ƯCLN (18;60) bằng
A. 6.
B. 36.
C. 12.
D. 30

Câu 10. Tập hợp ƯC (24,36) bằng
A. {1; 2; 3; 4; 6; 12}
B. {1; 2; 3; 4; 6}

III – MỨC ĐỘ VẬN DỤNG
Câu 11. Trong các tập hợp sau, tập hợp nào là tập hợp ước chung của 12, 15, 18?
A. {1;3;6}
B. {0;180;360;...}
C. {1;3}
D. {0;36;72;...}

Câu 12. Khẳng định nào sau đây là đúng?
A. ƯC (12;24) = {1;2;3;4;6;12}
B. ƯC (12;24) = {1;2;3;8;12}
C. ƯC (12;24) = {1;2;8;12}
D. ƯC (12;24) = {2;3;4;6;12}

Câu 13. ƯCLN (16,80,32) bằng:
A. 16
B. 8
C. 90
D. 150

Câu 14. ƯCLN (2018,2019,2020) bằng:
A. 1009
B. 2
C. 1
D. 1010

Câu 15. Cho a = 2^4 . 3^3 . 5^2 và b = 2^2 . 3 . 5^2 . 7 khi đó ƯCLN (a,b) bằng
A. 100
B. 900
C. 300
D. 350

BẢNG ĐÁP ÁN BÀI TẬP TRẮC NGHIỆM
1 2 3 4 5 6 7 8 9 10
C C B B D A A B A A
11 12 13 14 15
C A A C C`;

  const handleWordOrTextFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith(".pdf")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const base64Data = dataUrl.split(",")[1];
          setUploadedFileBase64(base64Data);
          setUploadedFileMimeType("application/pdf");
          setUploadedFileName(file.name);
          setUploadRawText(`[Đã đính kèm file PDF: ${file.name}]\nAI sẽ đọc trực tiếp toàn bộ trang, hình ảnh, công thức và Bảng Đáp Án từ file PDF này.`);
        }
      };
      reader.readAsDataURL(file);
    } else if (fileName.endsWith(".docx")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setUploadedFileBase64(null);
        setUploadedFileMimeType(null);
        setUploadedFileName(file.name);
        if (result.value) {
          setUploadRawText(result.value);
        } else {
          alert("Không thể trích xuất văn bản từ file docx này. Vui lòng mở file Word và copy/dán văn bản trực tiếp.");
        }
      } catch (err: any) {
        alert("Lỗi khi đọc file Word (.docx): " + (err.message || err));
      }
    } else if (fileName.endsWith(".txt") || fileName.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFileBase64(null);
        setUploadedFileMimeType(null);
        setUploadedFileName(file.name);
        setUploadRawText(event.target?.result as string || "");
      };
      reader.readAsText(file);
    } else {
      alert("Hệ thống hỗ trợ file PDF (.pdf), file Word (.docx) hoặc file Text (.txt). Thầy cô cũng có thể mở file Word/PDF và dán trực tiếp vào khung văn bản!");
    }
    e.target.value = "";
  };

  const handleAIParseDocument = async () => {
    if (!uploadRawText.trim() && !uploadedFileBase64) {
      alert("Vui lòng dán hoặc tải lên nội dung/file đề thi trước!");
      return;
    }

    setIsParsingDocument(true);
    setParseErrorMessage(null);
    setParsedResultQuiz(null);

    try {
      const res = await fetch("/api/parse-exam-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: uploadRawText,
          fileBase64: uploadedFileBase64,
          fileMimeType: uploadedFileMimeType
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Không thể phân tích đề thi bằng AI.");
      }

      const data = await res.json();
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("Không trích xuất được câu hỏi nào từ văn bản đã cho.");
      }

      const validatedQuestions: Question[] = data.questions.map((q: any, idx: number) => ({
        id: `q-parsed-${Date.now()}-${idx}`,
        type: q.type || "multiple_choice",
        difficulty: q.difficulty || "medium",
        prompt: q.prompt,
        options: q.options || undefined,
        correctAnswer: q.correctAnswer || "Chưa xác định",
        trueFalseStatements: q.trueFalseStatements || undefined,
        matchingPairs: q.matchingPairs || undefined,
        solution: q.solution || "Lời giải chi tiết cho câu hỏi này.",
        hint: q.hint || undefined,
        competency: q.competency || "Năng lực giải quyết vấn đề toán học"
      }));

      const difficultyLevels = Array.from(new Set(validatedQuestions.map(q => q.difficulty))) as Difficulty[];
      const types = Array.from(new Set(validatedQuestions.map(q => q.type))) as QuestionType[];

      const newQuiz: Quiz = {
        id: `quiz-parsed-${Date.now()}`,
        title: data.title || (uploadedFileName ? `Đề thi từ ${uploadedFileName}` : "Đề thi phân tích từ file Word/PDF"),
        chapterId: "chuong-1",
        lessonId: "bai-12",
        difficultyLevels: difficultyLevels.length > 0 ? difficultyLevels : ["medium"],
        questionCount: validatedQuestions.length,
        types: types.length > 0 ? types : ["multiple_choice"],
        questions: validatedQuestions,
        createdAt: new Date().toISOString(),
        createdBy: "Giáo viên (AI phân tích từ file PDF/Word)",
        timeLimit: data.timeLimit || 45
      };

      setParsedResultQuiz(newQuiz);
    } catch (err: any) {
      console.error("Lỗi AI Parse Document:", err);
      setParseErrorMessage(err.message || "Xảy ra lỗi khi phân tích văn bản đề thi.");
    } finally {
      setIsParsingDocument(false);
    }
  };

  const handleConfirmSaveParsedQuiz = () => {
    if (!parsedResultQuiz) return;
    onSaveQuiz(parsedResultQuiz);
    onSelectQuiz(parsedResultQuiz);
    setShowUploadDocumentModal(false);
    setParsedResultQuiz(null);
    setUploadRawText("");
    alert(`Đã lưu thành công đề thi "${parsedResultQuiz.title}" gồm ${parsedResultQuiz.questionCount} câu hỏi vào Ngân hàng đề của bạn!`);
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

  // Export submissions to CSV (Excel)
  const handleExportSubmissions = (quiz: Quiz) => {
    const quizSubmissions = submissions.filter(sub => sub.quizId === quiz.id);
    if (quizSubmissions.length === 0) {
      alert("Chưa có học sinh nào nộp bài ôn tập này để xuất bảng điểm!");
      return;
    }

    // Tiêu đề & nội dung CSV
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += `BÁO CÁO KẾT QUẢ ÔN TẬP: ${quiz.title.toUpperCase()}\n`;
    csvContent += `Người phụ trách: Cô Nguyễn Hà\n`;
    csvContent += `Thời gian xuất báo cáo: ${new Date().toLocaleString("vi-VN")}\n\n`;
    csvContent += "Mã học sinh,Họ và tên,Lớp,Thời gian nộp,Điểm số (thang điểm 10)\n";

    quizSubmissions.forEach(sub => {
      const formattedDate = new Date(sub.submittedAt).toLocaleString("vi-VN").replace(/,/g, " -");
      csvContent += `"${sub.studentId || "" || "Tự do"}","${sub.studentName}","${sub.studentClass}","${formattedDate}",${sub.score.toFixed(2)}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Bang_Diem_${quiz.title.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to format math and LaTeX for Word export compatibility
  const formatMathForWord = (text: string | null | undefined): string => {
    if (!text) return "";
    let s = text;
    // Remove LaTeX block/inline markers
    s = s.replace(/\$\$/g, "");
    s = s.replace(/\$/g, "");
    s = s.replace(/\\\(|\\\)/g, "");
    s = s.replace(/\\\[|\\\]/g, "");

    // Translate common LaTeX operators and symbols
    s = s.replace(/\\in\b/g, " ∈ ");
    s = s.replace(/\\notin\b/g, " ∉ ");
    s = s.replace(/\\mathbb\{N\}\^\*/g, " ℕ* ");
    s = s.replace(/\\mathbb\{N\}/g, " ℕ ");
    s = s.replace(/\\mathbb N\b/g, " ℕ ");
    s = s.replace(/\\mathbb\{Z\}/g, " ℤ ");
    s = s.replace(/\\mathbb Z\b/g, " ℤ ");
    s = s.replace(/\\mathbb\{Q\}/g, " ℚ ");
    s = s.replace(/\\mathbb Q\b/g, " ℚ ");
    s = s.replace(/\\mathbb\{R\}/g, " ℝ ");
    s = s.replace(/\\mathbb R\b/g, " ℝ ");
    s = s.replace(/\\emptyset\b/g, " ∅ ");
    s = s.replace(/\\subset\b/g, " ⊂ ");
    s = s.replace(/\\cap\b/g, " ∩ ");
    s = s.replace(/\\cup\b/g, " ∪ ");
    s = s.replace(/\\leq\b|\\le\b/g, " ≤ ");
    s = s.replace(/\\geq\b|\\ge\b/g, " ≥ ");
    s = s.replace(/\\neq\b|\\ne\b/g, " ≠ ");
    s = s.replace(/\\times\b/g, " × ");
    s = s.replace(/\\cdot\b/g, " · ");
    s = s.replace(/\\dots\b/g, " … ");
    s = s.replace(/\\degree\b/g, "°");
    s = s.replace(/\\pi\b/g, "π");

    // Translate fractions \frac{a}{b} -> (a/b)
    while (s.includes("\\frac{")) {
      s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)");
    }

    // Translate \sqrt{a} -> √(a)
    while (s.includes("\\sqrt{")) {
      s = s.replace(/\\sqrt\{([^{}]+)\}/g, "√($1)");
    }

    // Superscripts base^power -> base<sup>power</sup>
    const regex = /([a-zA-Z0-9ℕℤℝ∅⊂()]+)\^(\{([^}]+)\}|\(([^)]+)\)|([a-zA-Z0-9\-+*\/]+))/g;
    s = s.replace(regex, "$1<sup>$3$4$5</sup>");

    return s;
  };

  // Export to Word (.doc / .docx HTML Proxy)
  const handleExportToWord = (quiz: Quiz, includeAnswers: boolean = printIncludeAnswers) => {
    const quizTitleHTML = `<h2 style="text-align: center; font-family: Arial, sans-serif; color: #1e40af; margin-bottom: 5px;">${formatMathForWord(quiz.title)}</h2>`;
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
      questionsHTML += `<li style="margin-bottom: 15px;"><strong>[${DIFFICULTY_LABELS[q.difficulty].split(" ")[0]}]</strong> ${formatMathForWord(q.prompt)}`;
      
      if (q.type === "multiple_choice" && q.options) {
        questionsHTML += `<table style="width: 100%; margin-top: 5px; font-size: 10pt;"><tr>`;
        q.options.forEach((opt, idx) => {
          questionsHTML += `<td style="width: 25%;">${formatMathForWord(opt)}</td>`;
        });
        questionsHTML += `</tr></table>`;
      }

      if (q.type === "true_false" && q.trueFalseStatements) {
        questionsHTML += `<table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 10pt;">`;
        questionsHTML += `<tr style="background-color: #f1f5f9;"><th style="border: 1.5px solid #cbd5e1; padding: 4px; text-align: left;">Phát biểu</th><th style="border: 1.5px solid #cbd5e1; padding: 4px; width: 60px;">Đúng</th><th style="border: 1.5px solid #cbd5e1; padding: 4px; width: 60px;">Sai</th></tr>`;
        q.trueFalseStatements.forEach((tf) => {
          questionsHTML += `<tr><td style="border: 1.5px solid #cbd5e1; padding: 4px;">${formatMathForWord(tf.statement)}</td><td style="border: 1.5px solid #cbd5e1; padding: 4px; text-align: center;">[   ]</td><td style="border: 1.5px solid #cbd5e1; padding: 4px; text-align: center;">[   ]</td></tr>`;
        });
        questionsHTML += `</table>`;
      }

      if (q.type === "matching" && q.matchingPairs) {
        questionsHTML += `<table style="width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 10pt;">`;
        questionsHTML += `<tr style="background-color: #f1f5f9;"><th style="border: 1.5px solid #cbd5e1; padding: 4px; text-align: left; width: 50%;">Cột A</th><th style="border: 1.5px solid #cbd5e1; padding: 4px; text-align: left; width: 50%;">Cột B (Cần ghép nối)</th></tr>`;
        q.matchingPairs.forEach((pair) => {
          questionsHTML += `<tr><td style="border: 1.5px solid #cbd5e1; padding: 4px;">${formatMathForWord(pair.left)}</td><td style="border: 1.5px solid #cbd5e1; padding: 4px;">${formatMathForWord(pair.right)}</td></tr>`;
        });
        questionsHTML += `</table>`;
      }
      
      questionsHTML += `</li>`;
    });
    
    questionsHTML += `</ol>`;

    let answersHTML = "";
    if (includeAnswers) {
      answersHTML += `<br/><h3 style="font-family: Arial, sans-serif; border-bottom: 1.5px solid #f97316; padding-bottom: 5px; color: #f97316; page-break-before: always;">PHẦN II: HƯỚNG DẪN GIẢI VÀ ĐÁP ÁN CHI TIẾT</h3><ol style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6;">`;
      quiz.questions.forEach((q) => {
        answersHTML += `<li style="margin-bottom: 20px;"><strong>Câu hỏi:</strong> ${formatMathForWord(q.prompt)}<br/>`;
        answersHTML += `<strong style="color: #16a34a;">Đáp án đúng:</strong> ${formatMathForWord(q.correctAnswer)}<br/>`;
        answersHTML += `<strong>Hướng dẫn giải chi tiết:</strong> ${formatMathForWord(q.solution)}<br/>`;
        if (q.hint) answersHTML += `<em>* Gợi ý học sinh: ${formatMathForWord(q.hint)}</em><br/>`;
        answersHTML += `<em>* Đánh giá năng lực: ${formatMathForWord(q.competency)}</em><br/>`;
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
        <div className="flex flex-wrap items-center gap-2">
          {/* Upload & Parse PDF/Word/Text Exam Document with AI */}
          <button
            onClick={() => {
              setShowUploadDocumentModal(true);
              setParseErrorMessage(null);
            }}
            className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-4 py-2.5 shadow-md flex items-center gap-1.5 active:scale-95 transition-all shrink-0 ring-2 ring-purple-300 dark:ring-purple-900"
            title="Tải file PDF (.pdf), Word (.docx) hoặc dán văn bản đề thi để AI tự động trích xuất thành đề thi"
          >
            <Sparkles className="h-4 w-4 text-purple-200" /> Upload Đề PDF / Word / Text (AI Trích xuất)
          </button>

          {/* Tải Đề Mẫu Word (.doc) */}
          <button
            onClick={handleDownloadWordTemplate}
            className="rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold text-xs px-4 py-2.5 shadow-md flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
            title="Tải đề thi mẫu định dạng file Word (.doc) về máy"
          >
            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Tải đề mẫu Word
          </button>

          {/* Upload Đề Tự Soạn JSON */}
          <label className="rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 active:scale-95 cursor-pointer transition-all shrink-0" title="Tải lên file đề thi JSON tự soạn">
            <Upload className="h-4 w-4" /> JSON
            <input 
              type="file" 
              accept=".json" 
              onChange={handleUploadJSONQuiz} 
              className="hidden" 
            />
          </label>

          <button
            onClick={() => setShowSampleTemplatesModal(true)}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-4 py-2.5 shadow-md flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
          >
            <Download className="h-4 w-4" /> Đề Mẫu
          </button>
          
          <button
            onClick={() => onNavigate("generator")}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 shadow-md flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
          >
            <Edit className="h-4 w-4" /> Soạn Đề Mới
          </button>
        </div>
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
            filteredQuizzes.map((quiz) => {
              // Tính toán thống kê làm bài cho card
              const cardClasses = quiz.assignedClasses && quiz.assignedClasses.length > 0
                ? quiz.assignedClasses
                : Array.from(new Set(students.map(st => st.class))).filter(Boolean).sort();
              const cardStudents = students.filter(st => cardClasses.includes(st.class));
              const cardCompleted = cardStudents.filter(st => {
                return submissions.some(sub => 
                  sub.quizId === quiz.id && 
                  (sub.studentId === st.id || (sub.studentName === st.name && sub.studentClass === st.class))
                );
              });

              return (
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

                    {/* Thống kê thu gọn dưới đề thi */}
                    <div className="text-[10px] space-y-1 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl mt-1.5 border border-slate-100/60 dark:border-slate-800/40">
                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-semibold truncate">
                          <Users className="h-3 w-3 text-blue-500 shrink-0" />
                          {quiz.assignedClasses && quiz.assignedClasses.length > 0 
                            ? `Lớp: ${quiz.assignedClasses.join(", ")}` 
                            : "Tất cả lớp"}
                        </span>
                        <span className="font-bold shrink-0 text-slate-600 dark:text-slate-300">
                          {cardCompleted.length}/{cardStudents.length} HS đã làm
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-1 rounded-full transition-all"
                          style={{ width: `${cardStudents.length > 0 ? (cardCompleted.length / cardStudents.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex flex-wrap gap-1">
                        {quiz.difficultyLevels.map((diff) => (
                          <span key={diff} className="text-3xs px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                            {DIFFICULTY_LABELS[diff].split(" ")[0]}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent selecting the quiz when clicking delete
                          if (confirm(`Bạn có chắc chắn muốn xóa bộ đề thi: "${quiz.title}"?`)) {
                            onDeleteQuiz(quiz.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                        title="Xóa đề thi"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
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
                    onClick={() => handleExportToWord(selectedQuiz, true)}
                    className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 hover:bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 font-semibold text-xs px-3 py-2 transition-all active:scale-95"
                    title="Tải nhanh đề thi thành file Word (.doc) bao gồm cả đề bài và lời giải chi tiết"
                  >
                    <FileText className="h-3.5 w-3.5 text-indigo-550 dark:text-indigo-400" /> Tải file Word (.doc)
                  </button>

                  <button
                    onClick={() => handleExportToJSON(selectedQuiz)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs px-3 py-2"
                    title="Xuất đề thi ra file JSON để lưu trữ hoặc chỉnh sửa"
                  >
                    <FileJson className="h-3.5 w-3.5 text-blue-500" /> Xuất file JSON
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

              {/* Submission Statistics & Class Reports Section */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4 no-print">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-500" />
                      Tình hình nộp bài của các lớp học được giao
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1">Số liệu trực quan về học sinh đã làm và chưa làm bài tập này.</p>
                  </div>
                  {/* Export Button */}
                  <button
                    onClick={() => handleExportSubmissions(selectedQuiz)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 shadow-sm active:scale-95 transition-all self-start sm:self-auto"
                    title="Xuất bảng điểm ra file Excel/CSV"
                  >
                    <Download className="h-3.5 w-3.5" /> Xuất bảng điểm (Excel/CSV)
                  </button>
                </div>

                {/* Class-by-class breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(selectedQuiz.assignedClasses && selectedQuiz.assignedClasses.length > 0
                    ? selectedQuiz.assignedClasses
                    : Array.from(new Set(students.map(st => st.class))).filter(Boolean).sort()
                  ).map((cls) => {
                    const studentsInClass = students.filter(st => st.class === cls);
                    
                    const isStudentSubmitted = (studentId: string, studentName: string, studentClass: string) => {
                      return submissions.some(sub => 
                        sub.quizId === selectedQuiz.id && 
                        (sub.studentId === studentId || 
                         (sub.studentName === studentName && sub.studentClass === studentClass))
                      );
                    };

                    const completed = studentsInClass.filter(st => isStudentSubmitted(st.id, st.name, st.class));
                    const notCompleted = studentsInClass.filter(st => !isStudentSubmitted(st.id, st.name, st.class));

                    return (
                      <div key={cls} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5 shadow-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            Lớp {cls}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            Sĩ số: {studentsInClass.length} HS
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${studentsInClass.length > 0 ? (completed.length / studentsInClass.length) * 100 : 0}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-semibold">
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Đã làm: {completed.length} HS
                            </span>
                            <span className="text-rose-500 dark:text-rose-400">
                              Chưa làm: {notCompleted.length} HS
                            </span>
                          </div>
                        </div>

                        {/* Dropdown list of non-completed */}
                        {notCompleted.length > 0 ? (
                          <div className="text-[10px] text-slate-400 border-t border-dashed border-slate-100 dark:border-slate-800/80 pt-2 leading-relaxed">
                            <span className="font-bold text-slate-500">Chưa làm:</span> {notCompleted.map(st => st.name).join(", ")}
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 border-t border-dashed border-slate-100 dark:border-slate-800/80 pt-2">
                            <Check className="h-3 w-3" /> Tất cả học sinh đã nộp bài
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Detailed submission list with individual scores */}
                <div className="space-y-2 pt-3 border-t border-slate-150 dark:border-slate-850">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bảng chi tiết nộp bài & Điểm số</h5>
                  <div className="overflow-x-auto border border-slate-150 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 font-semibold text-[10px] uppercase">
                          <th className="py-2 px-3">Họ và tên học sinh</th>
                          <th className="py-2 px-3">Lớp</th>
                          <th className="py-2 px-3">Thời gian nộp</th>
                          <th className="py-2 px-3 text-right">Điểm số</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                        {submissions.filter(sub => sub.quizId === selectedQuiz.id).length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 px-3 text-center text-slate-400 italic text-xs">
                              Chưa có học sinh nào nộp bài ôn tập này.
                            </td>
                          </tr>
                        ) : (
                          submissions
                            .filter(sub => sub.quizId === selectedQuiz.id)
                            .map((sub, sIdx) => (
                              <tr key={sub.id || sIdx} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                                <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                                  {sub.studentName}
                                </td>
                                <td className="py-2 px-3 text-slate-500 font-medium text-2xs">{sub.studentClass}</td>
                                <td className="py-2 px-3 text-slate-400 text-3xs">
                                  {new Date(sub.submittedAt).toLocaleString("vi-VN")}
                                </td>
                                <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                  {sub.score.toFixed(2)} / 10 điểm
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

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
                        {renderMath(q.prompt)}
                      </p>

                      {/* Display formats */}
                      {q.type === "multiple_choice" && q.options && (
                        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                              {renderMath(opt)}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === "true_false" && q.trueFalseStatements && (
                        <div className="space-y-1 pt-1 text-xs">
                          {q.trueFalseStatements.map((statement) => (
                            <div key={statement.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
                              <span>{renderMath(statement.statement)}</span>
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
                                {renderMath(pair.left)}
                              </div>
                            ))}
                          </div>
                          <div className="space-y-1">
                            {q.matchingPairs.map((pair) => (
                              <div key={pair.id} className="bg-slate-50 dark:bg-slate-950 p-1.5 rounded border border-slate-100 dark:border-slate-850">
                                {renderMath(pair.right)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Answers & Solutions block */}
                      <div className="bg-blue-50/20 border border-blue-100/30 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-600">✓ ĐS đúng:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{renderMath(q.correctAnswer)}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          <strong>Lời giải chi tiết:</strong> {renderMath(q.solution)}
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

      {/* Sample Templates Modal */}
      {showSampleTemplatesModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm p-4 flex justify-center items-center">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[85vh] flex flex-col text-left">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-lg">Kho Đề Ôn Tập Mẫu Chuẩn</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Chọn đề ôn tập chất lượng cao biên soạn sẵn để tải lên và tùy chỉnh.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSampleTemplatesModal(false)}
                className="rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List of sample templates */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 py-2">
              {MOCK_QUIZZES.map((sampleQuiz) => {
                return (
                  <div 
                    key={sampleQuiz.id} 
                    className="border border-slate-150 dark:border-slate-800 rounded-xl p-4 hover:border-blue-500/50 dark:hover:border-blue-500/30 bg-slate-50/50 dark:bg-slate-950/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                          {sampleQuiz.questions.length} CÂU HỎI
                        </span>
                        {sampleQuiz.difficultyLevels.map((diff, idx) => (
                          <span key={idx} className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded capitalize">
                            {DIFFICULTY_LABELS[diff]?.split(" ")[0]}
                          </span>
                        ))}
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{sampleQuiz.title}</h4>
                      <p className="text-2xs text-slate-400 leading-relaxed">
                        Biên soạn bởi: <span className="font-semibold text-slate-600 dark:text-slate-300">{sampleQuiz.createdBy}</span> • Gồm các dạng: {Array.from(new Set(sampleQuiz.questions.map(q => QUESTION_TYPE_LABELS[q.type]?.split(" ")[0] || q.type))).join(", ")}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 self-start md:self-auto shrink-0">
                      <button
                        onClick={() => handleExportToWord(sampleQuiz as Quiz, true)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 active:scale-95 transition-all rounded-xl border border-slate-200 dark:border-slate-700"
                        title="Tải nhanh đề thi mẫu này về máy dưới dạng file Word (.doc) có đầy đủ lời giải"
                      >
                        <FileText className="h-3.5 w-3.5 text-indigo-550 dark:text-indigo-400" /> Tải file Word
                      </button>

                      <button
                        onClick={() => handleImportSampleQuiz(sampleQuiz)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all rounded-xl shadow-sm"
                      >
                        <Plus className="h-4 w-4" /> Nhập đề mẫu
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer advice */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setShowSampleTemplatesModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-250 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl transition-all"
              >
                Đóng cửa sổ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Upload Document Modal (Word / Text AI Extraction) */}
      {showUploadDocumentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto no-print">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-50 via-indigo-50 to-white dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-600 text-white shadow-md">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base md:text-lg">
                    Tải lên & AI Phân tích Đề thi (Word / Text / PDF)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tải file Word (.docx) hoặc dán trực tiếp văn bản đề thi để AI tự động trích xuất câu hỏi, mức độ nhận thức và Bảng Đáp Án.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadDocumentModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">

              {!parsedResultQuiz ? (
                <>
                  {/* File Upload zone & Quick Sample action */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-purple-300 dark:border-purple-800 hover:border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl cursor-pointer transition-all group">
                      <FileUp className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                        {uploadedFileName ? `Đã chọn: ${uploadedFileName}` : "Chọn file PDF (.pdf), Word (.docx) hoặc Text (.txt)"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt,.json"
                        onChange={handleWordOrTextFileChange}
                        className="hidden"
                      />
                    </label>

                    {uploadedFileBase64 && (
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFileBase64(null);
                          setUploadedFileMimeType(null);
                          setUploadedFileName(null);
                          setUploadRawText("");
                        }}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-900 transition-all shrink-0"
                      >
                        Xóa file PDF đã đính kèm
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFileBase64(null);
                        setUploadedFileMimeType(null);
                        setUploadedFileName(null);
                        setUploadRawText(SAMPLE_EXAM_DOCUMENT);
                        setParseErrorMessage(null);
                      }}
                      className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Dán đề mẫu "Ước Chung & ƯCLN" (15 câu)
                    </button>
                  </div>

                  {/* Textarea for pasting raw text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nội dung văn bản đề thi (hoặc thông tin file PDF/Word đính kèm):
                    </label>
                    <textarea
                      value={uploadRawText}
                      onChange={(e) => setUploadRawText(e.target.value)}
                      placeholder="Dán toàn bộ văn bản đề thi tại đây (Ví dụ: Tiêu đề đề thi, Mức độ Nhận biết / Thông hiểu / Vận dụng, nội dung các Câu 1, Câu 2... và BẢNG ĐÁP ÁN TRẮC NGHIỆM ở cuối nếu có)..."
                      className="w-full h-64 p-4 text-xs font-mono border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none shadow-inner"
                    />
                    <div className="mt-1 flex justify-between items-center text-[11px] text-slate-400">
                      <span>Mẹo: Với file PDF, AI Gemini sẽ đọc trực tiếp dữ liệu OCR hình ảnh/chữ/công thức và tự khớp Bảng Đáp Án ở trang cuối.</span>
                      <span>{uploadRawText.length} ký tự</span>
                    </div>
                  </div>

                  {parseErrorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>{parseErrorMessage}</span>
                    </div>
                  )}

                  {/* Parse Action Button */}
                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowUploadDocumentModal(false)}
                      className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      disabled={isParsingDocument || !uploadRawText.trim()}
                      onClick={handleAIParseDocument}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 active:scale-95 transition-all"
                    >
                      {isParsingDocument ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang phân tích cấu trúc & đối chiếu Bảng Đáp Án...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" /> AI Phân tích & Trích xuất Đề
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Preview Parsed Result Screen */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        AI đã trích xuất thành công {parsedResultQuiz.questionCount} câu hỏi!
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                        Kiểm tra lại xem nội dung câu hỏi và Bảng Đáp Án đã được khớp chính xác chưa trước khi lưu vào Ngân hàng đề thi của bạn.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiêu đề đề thi:</div>
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {parsedResultQuiz.title}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
                      <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
                        ⏱️ Thời gian: {parsedResultQuiz.timeLimit || 45} phút
                      </span>
                      <span className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">
                        📊 Mức độ: {parsedResultQuiz.difficultyLevels.map(d => DIFFICULTY_LABELS[d]).join(", ")}
                      </span>
                    </div>
                  </div>

                  {/* List of Questions Preview */}
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Danh sách {parsedResultQuiz.questions.length} câu hỏi đã bóc tách:
                    </div>

                    {parsedResultQuiz.questions.map((q, idx) => (
                      <div key={q.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            Câu {idx + 1}: [{DIFFICULTY_LABELS[q.difficulty]}]
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-mono">
                            {q.type}
                          </span>
                        </div>

                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {renderMath(q.prompt)}
                        </div>

                        {q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2 text-slate-600 dark:text-slate-400">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`p-1.5 rounded ${
                                  opt === q.correctAnswer || q.correctAnswer?.includes(opt)
                                    ? "bg-emerald-100 dark:bg-emerald-950/60 font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                    : "bg-slate-50 dark:bg-slate-800/50"
                                }`}
                              >
                                {renderMath(opt)}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-900/40 text-[11px]">
                          <strong>Đáp án đúng:</strong> {renderMath(q.correctAnswer)}<br />
                          <strong>Lời giải AI:</strong> {renderMath(q.solution)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setParsedResultQuiz(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl"
                    >
                      ← Phân tích lại văn bản khác
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmSaveParsedQuiz}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 active:scale-95 transition-all"
                    >
                      <Check className="h-4 w-4" /> Xác nhận & Lưu vào Ngân Hàng Đề Thi
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
