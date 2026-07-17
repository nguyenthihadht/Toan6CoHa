import React, { useState, useRef } from "react";
import { Chapter, Lesson } from "../data/curriculum";
import { 
  Database, 
  PlusCircle, 
  BookOpen, 
  Trash2, 
  Download, 
  Upload, 
  Check, 
  ChevronRight, 
  AlertTriangle,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface CurriculumAdminProps {
  curriculum: Chapter[];
  onAddCustomLesson: (chapterId: string, newLesson: Lesson) => void;
  onRestoreCurriculum: (newCurriculum: Chapter[]) => void;
  onResetCurriculum: () => void;
}

export default function CurriculumAdmin({ 
  curriculum, 
  onAddCustomLesson, 
  onRestoreCurriculum, 
  onResetCurriculum 
}: CurriculumAdminProps) {
  // Navigation inside Curriculum panel
  const [activeChapterId, setActiveChapterId] = useState(curriculum[0]?.id || "");
  const [activeLessonId, setActiveLessonId] = useState(curriculum[0]?.lessons[0]?.id || "");
  
  // Custom lesson insertion form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formChapterId, setFormChapterId] = useState(curriculum[0]?.id || "");
  const [formLessonName, setFormLessonName] = useState("");
  const [formKeyKnowledge, setFormKeyKnowledge] = useState("");
  const [formTargets, setFormTargets] = useState("");
  const [formCommonMistakes, setFormCommonMistakes] = useState("");
  const [formSampleQ, setFormSampleQ] = useState("");
  const [formSampleA, setFormSampleA] = useState("");
  const [formSampleS, setFormSampleS] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active selections
  const selectedChapter = curriculum.find(c => c.id === activeChapterId);
  const selectedLesson = selectedChapter?.lessons.find(l => l.id === activeLessonId);

  // Add Lesson Form handler
  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLessonName.trim() || !formKeyKnowledge.trim()) return;

    const newLesson: Lesson = {
      id: "bai-custom-" + Date.now(),
      name: formLessonName,
      keyKnowledge: formKeyKnowledge,
      targets: formTargets.split("\n").map(t => t.trim()).filter(Boolean),
      commonMistakes: formCommonMistakes.split("\n").map(m => m.trim()).filter(Boolean),
      sampleProblem: {
        question: formSampleQ || "Bài tập rèn luyện toán học",
        answer: formSampleA || "Kết quả",
        solution: formSampleS || "Lời giải"
      }
    };

    onAddCustomLesson(formChapterId, newLesson);
    
    // Clear inputs and close
    setFormLessonName("");
    setFormKeyKnowledge("");
    setFormTargets("");
    setFormCommonMistakes("");
    setFormSampleQ("");
    setFormSampleA("");
    setFormSampleS("");
    setShowAddForm(false);
    
    // Set active to the newly created lesson
    setActiveChapterId(formChapterId);
    setActiveLessonId(newLesson.id);
  };

  // Backup downloader
  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(curriculum, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "AI_Math6_Curriculum_Backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore file uploader
  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        // Basic schema verification
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].lessons) {
          onRestoreCurriculum(parsed);
          alert("Khôi phục cơ sở dữ liệu chương trình SGK thành công!");
          setActiveChapterId(parsed[0].id);
          setActiveLessonId(parsed[0].lessons[0]?.id || "");
        } else {
          throw new Error("File backup không đúng định dạng sơ đồ chương trình học.");
        }
      } catch (err: any) {
        alert("Lỗi: " + (err.message || "Không thể đọc dữ liệu từ file đính kèm. Vui lòng thử lại."));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header and top administrative panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-slate-900 dark:text-slate-100 text-lg md:text-xl flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-600" /> Chương Trình Học & Khung Sư Phạm
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tra cứu cấu trúc lý thuyết, quản lý bài học SGK Lớp 6, xuất và sao lưu cơ sở dữ liệu.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={handleRestoreClick}
            className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs px-3 py-2 flex items-center gap-1"
          >
            <Upload className="h-3.5 w-3.5" /> Khôi Phục
          </button>
          
          <button
            onClick={handleBackup}
            className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs px-3 py-2 flex items-center gap-1"
          >
            <Download className="h-3.5 w-3.5" /> Sao Lưu (.json)
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 flex items-center gap-1"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Thêm Bài Mới
          </button>
        </div>
      </div>

      {showAddForm ? (
        /* Create New Lesson Form inside Admin */
        <div className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-5">
          <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            Thêm Bài Học Mới Vào Khung Chương Trình
          </h3>

          <form onSubmit={handleAddLesson} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Gắn vào chương</label>
                <select
                  value={formChapterId}
                  onChange={(e) => setFormChapterId(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-lg focus:outline-none dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                >
                  {curriculum.map(c => (
                    <option key={c.id} value={c.id}>{c.title.split(":")[0]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tên bài học</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bài 21: Phép tính lũy thừa nâng cao"
                  value={formLessonName}
                  onChange={(e) => setFormLessonName(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-lg focus:outline-none dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Kiến thức cốt lõi / Trọng tâm</label>
              <textarea
                required
                placeholder="Tóm tắt công thức, định nghĩa, phạm vi số học sẽ cung cấp cho trợ lý AI..."
                value={formKeyKnowledge}
                onChange={(e) => setFormKeyKnowledge(e.target.value)}
                className="w-full h-24 text-xs p-2.5 border rounded-lg focus:outline-none dark:bg-slate-950 text-slate-700 dark:text-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mục tiêu cần đạt (Mỗi dòng một mục tiêu)</label>
                <textarea
                  placeholder="Ví dụ:&#10;- Nhận biết định nghĩa luỹ thừa&#10;- Thực hiện nhân hai luỹ thừa cùng cơ số"
                  value={formTargets}
                  onChange={(e) => setFormTargets(e.target.value)}
                  className="w-full h-24 text-xs p-2.5 border rounded-lg focus:outline-none dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sai lầm thường gặp (Mỗi dòng một lỗi sai)</label>
                <textarea
                  placeholder="Ví dụ:&#10;- Học sinh nhân cơ số với số mũ thay vì luỹ thừa&#10;- Nhầm phép chia sang phép cộng số mũ"
                  value={formCommonMistakes}
                  onChange={(e) => setFormCommonMistakes(e.target.value)}
                  className="w-full h-24 text-xs p-2.5 border rounded-lg focus:outline-none dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>

            {/* Sample problems subform */}
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mẫu bài tập biểu mẫu bổ sung (Để trợ lý AI bám sát cấu trúc đề)</h4>
              
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">Đề bài</label>
                <input
                  type="text"
                  placeholder="Viết đề bài mẫu"
                  value={formSampleQ}
                  onChange={(e) => setFormSampleQ(e.target.value)}
                  className="w-full text-xs p-2.5 border rounded-lg bg-slate-50/50 focus:outline-none dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500">Đáp số</label>
                  <input
                    type="text"
                    placeholder="Kết quả chuẩn"
                    value={formSampleA}
                    onChange={(e) => setFormSampleA(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-lg bg-slate-50/50 focus:outline-none dark:bg-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-500">Bài giải chi tiết</label>
                  <input
                    type="text"
                    placeholder="Từng bước giải thích..."
                    value={formSampleS}
                    onChange={(e) => setFormSampleS(e.target.value)}
                    className="w-full text-xs p-2.5 border rounded-lg bg-slate-50/50 focus:outline-none dark:bg-slate-950"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs px-4 py-2 text-slate-600 dark:text-slate-400"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2"
              >
                Tạo bài học
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Standard catalog view split-screen Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Chapters and Lessons List drill down */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-blue-500" /> Cấu trúc Giáo Trình
              </h3>

              <div className="space-y-3.5">
                {curriculum.map((chapter) => {
                  const isChapterActive = activeChapterId === chapter.id;
                  return (
                    <div key={chapter.id} className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveChapterId(chapter.id);
                          if (chapter.lessons.length > 0) {
                            setActiveLessonId(chapter.lessons[0].id);
                          } else {
                            setActiveLessonId("");
                          }
                        }}
                        className={`w-full text-left font-bold text-xs p-2 rounded-lg flex items-center justify-between ${
                          isChapterActive 
                            ? "bg-indigo-50/40 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400" 
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-850"
                        }`}
                      >
                        <span className="truncate">{chapter.title.split(":")[0]}</span>
                        <ChevronRight className={`h-3 w-3 shrink-0 transform transition-transform ${isChapterActive ? "rotate-90" : ""}`} />
                      </button>

                      {isChapterActive && (
                        <div className="pl-3.5 border-l-2 border-indigo-100 dark:border-indigo-950 space-y-1 pt-1">
                          {chapter.lessons.map((lesson) => {
                            const isLessonActive = activeLessonId === lesson.id;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setActiveLessonId(lesson.id)}
                                className={`w-full text-left text-2xs p-2 rounded-md truncate font-medium ${
                                  isLessonActive 
                                    ? "bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-semibold" 
                                    : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-850"
                                }`}
                              >
                                {lesson.name.split(":")[0]}: {lesson.name.split(":").slice(1).join(":")}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Reset button inside settings panel */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    if (confirm("Đặt lại toàn bộ chương trình học và các đề thi về trạng thái gốc của sách Kết nối tri thức? Thao tác này sẽ dọn dẹp sạch các thay đổi tùy chỉnh của bạn.")) {
                      onResetCurriculum();
                    }
                  }}
                  className="w-full py-2 rounded-xl border border-rose-200 dark:border-rose-950/50 hover:bg-rose-50 dark:hover:bg-rose-950/10 text-rose-600 dark:text-rose-400 font-semibold text-2xs"
                >
                  Khôi phục cài đặt gốc SGK
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Active Lesson inspection cards */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
                <div>
                  <span className="text-3xs uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">Bài học Đã chọn</span>
                  <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-lg mt-0.5">{selectedLesson.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Hệ chương trình toán 6 Kết nối tri thức với cuộc sống.</p>
                </div>

                {/* Core knowledge panel */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">1. Kiến Thức Trọng Tâm & Quy Tắc Toán Học</h4>
                  <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 leading-relaxed text-xs text-slate-600 dark:text-slate-400">
                    {selectedLesson.keyKnowledge}
                  </div>
                </div>

                {/* Objectives */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">2. Mục Tiêu Sư Phạm Cần Đạt (Targets)</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {selectedLesson.targets.map((target, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-400 leading-relaxed bg-indigo-50/10 p-2.5 rounded-lg border border-indigo-100/10">
                        <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{target}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common student mistakes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">3. Sai Lầm Học Sinh Thường Gặp (Pedagogy)</h4>
                  <ul className="space-y-2 text-xs">
                    {selectedLesson.commonMistakes.length === 0 ? (
                      <li className="text-slate-400 italic">Chưa cấu hình cảnh báo lỗi sai cho bài học này.</li>
                    ) : (
                      selectedLesson.commonMistakes.map((mistake, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-rose-800 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/15 p-3 rounded-lg border border-rose-100/10 leading-relaxed">
                          <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{mistake}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Sample problem */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-5">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">4. Mẫu Bài Tập SGK Điển Hình</h4>
                  <div className="border border-slate-100 dark:border-slate-850 rounded-xl p-4 bg-slate-50/30 dark:bg-slate-950/10 text-xs space-y-3">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      <strong>Bài toán:</strong> {selectedLesson.sampleProblem.question}
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                      <strong>Đáp số:</strong> {selectedLesson.sampleProblem.answer}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong>Lời giải:</strong> {selectedLesson.sampleProblem.solution}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <AlertCircle className="h-8 w-8 text-slate-300" />
                <span>Không có bài học khả dụng trong chương này. Bấm "Thêm Bài Mới" để mở rộng cơ sở dữ liệu.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
