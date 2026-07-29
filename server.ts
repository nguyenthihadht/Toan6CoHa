import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper for lazy loading Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "Chưa cấu hình GEMINI_API_KEY. Vui lòng cấu hình khóa API trong mục Settings > Secrets của AI Studio để sử dụng chức năng AI."
    );
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to call Gemini with robust retries and fallback models
async function generateContentWithRetry(ai: GoogleGenAI, params: { model: string; contents: any; config?: any }) {
  const modelsToTry = [
    params.model,
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-flash-latest"
  ];
  const uniqueModels = Array.from(new Set(modelsToTry)).filter(Boolean);
  
  let lastError: any = null;
  
  for (const modelName of uniqueModels) {
    let delay = 1000;
    const maxRetriesForModel = 2; // Try each model up to 2 times
    
    for (let attempt = 0; attempt < maxRetriesForModel; attempt++) {
      try {
        console.log(`[AI] Attempting generation with model: ${modelName} (Attempt ${attempt + 1}/${maxRetriesForModel})...`);
        const response = await ai.models.generateContent({
          ...params,
          model: modelName,
        });
        return response;
      } catch (error: any) {
        lastError = error;
        console.error(`[AI] Error with ${modelName} on attempt ${attempt + 1}:`, error.message || error);
        
        // If model not found or invalid model string, break immediately to try next fallback model
        if (error.status === 404 || error.message?.includes("404") || error.message?.includes("not found")) {
          console.warn(`[AI] Model ${modelName} returned 404 (not found). Switching model...`);
          break;
        }

        const isTemporary = 
          error.message?.includes("503") || 
          error.message?.includes("UNAVAILABLE") ||
          error.message?.includes("429") ||
          error.message?.includes("RESOURCE_EXHAUSTED") ||
          error.status === 503 ||
          error.status === 429;
          
        if (isTemporary && attempt < maxRetriesForModel - 1) {
          console.log(`[AI] Temporary error. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        
        // If it's a non-temporary error, or we reached max retries, move to next model
        break;
      }
    }
  }
  
  throw lastError || new Error("Không thể kết nối đến máy chủ AI sau nhiều lần thử.");
}

// Helper to robustly parse JSON containing markdown codeblocks or trailing whitespaces
function parseRobustJson(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/i, "");
    cleaned = cleaned.replace(/\n?```$/, "");
    cleaned = cleaned.trim();
  }
  return JSON.parse(cleaned);
}

// API Route: AI Generate Questions
app.post("/api/generate-questions", async (req, res) => {
  try {
    const {
      chapterTitle,
      lessonName,
      keyKnowledge,
      targets,
      difficultyLevels,
      questionCount,
      types,
      customPrompt,
    } = req.body;

    if (!lessonName || !difficultyLevels || !types || !questionCount) {
      return res.status(400).json({
        error: "Thiếu thông tin yêu cầu tạo đề (bài học, mức độ, dạng bài, số lượng câu).",
      });
    }

    const ai = getGeminiClient();

    // Construct detailed prompt
    const systemInstruction = `Bạn là một Chuyên gia sư phạm Toán THCS hàng đầu Việt Nam, am hiểu sâu sắc Chương trình GDPT 2018 môn Toán lớp 6.
Nhiệm vụ của bạn là tạo đề ôn luyện hoặc kiểm tra môn Toán lớp 6 bám sát kiến thức môn học.
Mỗi câu hỏi được sinh ra phải đạt các yêu cầu sau:
1. TẬP TRUNG TÍNH TOÁN VÀ THỰC HÀNH: Đề bài chủ yếu rèn luyện kỹ năng tính toán, thực hiện phép tính, tìm x, tính nhanh, ước lượng, tìm ước chung, bội chung... Tuyệt đối tránh các câu hỏi lý thuyết suông hoặc định nghĩa (Ví dụ không hỏi "Định nghĩa lũy thừa là gì", không yêu cầu phát biểu lý thuyết hay chọn khẳng định lý thuyết đúng/sai). Biến đổi mọi kiến thức thành các bài tập tính toán cụ thể.
2. TỰ SÁNG TÁC MỚI, TUYỆT ĐỐI KHÔNG SAO CHÉP SGK: Tất cả các câu hỏi phải được tự thiết kế/sáng tác mới với số liệu ngẫu nhiên, tình huống mới dựa trên chủ đề bài học. Tuyệt đối không được lấy nguyên văn hay sao chép bất kỳ câu hỏi nào trực tiếp từ Sách giáo khoa (SGK), Sách bài tập (SBT) hay các đề thi cũ.
3. HIỂN THỊ ĐẦY ĐỦ ĐỀ BÀI, TUYỆT ĐỐI KHÔNG TRÍCH DẪN NGUỒN: Nội dung câu hỏi (trường "prompt") phải hiển thị đầy đủ, chi tiết, rõ ràng mọi số liệu, giả thiết để học sinh có thể tự tính toán độc lập. TUYỆT ĐỐI KHÔNG trích dẫn nguồn (Ví dụ: KHÔNG ghi "Bài 1.12 trang 15 SGK...", "Theo sách giáo khoa Kết nối tri thức...", "Trích đề thi học kỳ..."). Hãy ẩn hoàn toàn mọi chỉ dẫn về nguồn gốc câu hỏi hay sách giáo khoa, chỉ hiển thị đề bài toán học thuần túy.
4. Đúng lứa tuổi: Sử dụng ngôn từ trong sáng, dễ hiểu, phù hợp với trình độ học sinh lớp 6 tại Việt Nam. Không ra đề quá khó, không dùng các ký hiệu toán học chưa được học ở lớp 6.
5. Không lặp lại: Không sinh trùng câu hỏi hoặc ý tưởng trùng lắp. Các câu hỏi phân hóa rõ ràng.
6. Tính thực tế và số liệu tính toán: Đối với các câu hỏi vận dụng hoặc tự luận, ưu tiên các bài toán thực tế lồng ghép ngữ cảnh đời sống Việt Nam nhưng phải có yêu cầu tính toán ra con số cụ thể, rõ ràng từng bước tính.
7. Đúng định dạng JSON được yêu cầu dưới đây.`;

    const userPrompt = `Hãy tạo một bộ gồm đúng ${questionCount} câu hỏi toán học thực hành tính toán thuộc:
- Chương: ${chapterTitle || "Toán 6"}
- Bài học: ${lessonName}
- Kiến thức trọng tâm: ${keyKnowledge || "Kiến thức lớp 6 liên quan"}
- Mục tiêu cần đạt: ${targets ? targets.join(", ") : "Chuẩn kiến thức lớp 6"}

Các yêu cầu kỹ thuật đối với đề bài:
- Tổng số lượng câu hỏi cần tạo: ${questionCount} câu.
- CHỈ tập trung vào rèn luyện KỸ NĂNG TÍNH TOÁN và giải bài tập thực hành số học/hình học (thực hiện phép tính, tìm x, tìm ước/bội, tính diện tích/chu vi, bài toán có lời văn cần tính toán số liệu cụ thể). TRÁNH các câu hỏi kiểm tra định nghĩa lý thuyết, phát biểu khái niệm hoặc câu hỏi đúng/sai mang tính lý thuyết suông.
- KHÔNG LẤY CÂU HỎI TRONG SÁCH GIÁO KHOA: Phải tự tạo câu hỏi với số liệu mới, bối cảnh thực tế mới, cách đặt vấn đề mới. Tuyệt đối không sao chép nguyên văn từ bất kỳ bộ SGK, SBT hay sách tham khảo nào.
- HIỂN THỊ ĐẦY ĐỦ NỘI DUNG, KHÔNG TRÍCH DẪN NGUỒN: Toàn bộ nội dung câu hỏi phải được viết rõ ràng và chi tiết trong thuộc tính "prompt". Tuyệt đối không ghi các thông tin trích dẫn nguồn (ví dụ: cấm ghi "Bài 1.5 SGK...", "Theo SGK Kết nối tri thức...", "Sách bài tập toán 6 trang 25"...).
- Mức độ câu hỏi (phân bổ ngẫu nhiên hoặc chia đều theo các mức sau): ${difficultyLevels.join(", ")}. (easy = Nhận biết, medium = Thông hiểu, hard = Vận dụng, very_hard = Vận dụng cao).
- Các dạng bài được phép tạo: ${types.join(", ")}. (multiple_choice = Trắc nghiệm, true_false = Đúng Sai, matching = Ghép đôi, fill_blank = Điền số, essay = Tự luận/Giải toán thực tế).
${customPrompt ? `- Yêu cầu thêm từ giáo viên: "${customPrompt}"` : ""}

Bạn PHẢI trả về một đối tượng JSON có thuộc tính duy nhất là "questions", là một mảng các đối tượng câu hỏi. Mỗi đối tượng câu hỏi phải tuân thủ nghiêm ngặt cấu trúc sau:
{
  "id": "chuỗi định danh duy nhất ví dụ q1, q2, q3...",
  "type": "một trong các giá trị: 'multiple_choice', 'true_false', 'matching', 'fill_blank', 'essay'",
  "difficulty": "một trong các giá trị: 'easy', 'medium', 'hard', 'very_hard'",
  "prompt": "nội dung câu hỏi rèn luyện tính toán bằng tiếng Việt, viết rõ ràng bằng Latex hoặc văn bản thường cho công thức (Ví dụ: 'Thực hiện phép tính: 3^2 + 5 * 4', 'Tìm x biết: x - 12 = 15'). Hãy chú thích đề bài và số liệu rõ ràng.",
  "options": ["mảng 4 lựa chọn đáp số cho trắc nghiệm, ví dụ: ['A. 5', 'B. 6', 'C. 7', 'D. 8']. Bỏ qua nếu không phải multiple_choice."],
  "correctAnswer": "đáp án đúng. Cách điền đáp án đúng:
     - Với 'multiple_choice': ghi chữ cái đại diện viết hoa, ví dụ: 'C' (không ghi 'C. 7').
     - Với 'true_false': ghi tóm tắt kết quả tính đúng/sai của các phép tính được đưa ra, ví dụ 'Câu A: Đúng, Câu B: Sai...'. Ví dụ: Phát biểu A: 'Kết quả của phép tính 2^3 + 5 là 13' -> True.
     - Với 'matching': ghi chỉ dẫn ghép cặp đúng (ví dụ: cột trái là phép tính, cột phải là kết quả), ví dụ 'A-2, B-1, C-3'.
     - Với 'fill_blank': ghi số kết quả tính toán cần điền trực tiếp, ví dụ '12'.
     - Với 'essay': ghi tóm tắt đáp số cuối cùng, ví dụ 'x = 15'.",
  "trueFalseStatements": [
     { "id": "tf1", "statement": "Kết quả của biểu thức A là 25", "answer": true },
     { "id": "tf2", "statement": "Số dư của phép chia B cho 3 là 1", "answer": false }
  ], // CHỈ cung cấp mảng này nếu type là 'true_false'. Đảm bảo các phát biểu là các mệnh đề khẳng định về kết quả tính toán/tính chất số học có số liệu cụ thể để học sinh tính toán và kiểm tra Đúng/Sai. Tránh phát biểu lý thuyết suông định nghĩa.
  "matchingPairs": [
     { "id": "m1", "left": "A. Phép tính 2^3 + 4", "right": "1. Kết quả là 6" },
     { "id": "m2", "left": "B. Phép tính 18 : 3", "right": "2. Kết quả là 12" },
     { "id": "m3", "left": "C. Phép tính 3 * 5 - 6", "right": "3. Kết quả là 9" }
  ], // CHỈ cung cấp mảng này nếu type là 'matching'. Học sinh sẽ ghép nối cột trái với cột phải. Đảm bảo các vế ghép đôi chứa phép tính và kết quả tính toán tương ứng, hoặc số và tính chất số học cụ thể. Thứ tự cột phải lộn xộn để học sinh ghép.
  "solution": "Lời giải chi tiết từng bước tính toán bằng tiếng Việt, giải thích cặn kẽ cách biến đổi và tính ra kết quả.",
  "hint": "Gợi ý hoặc mẹo tính nhanh/phương pháp làm bài giúp học sinh định hướng.",
  "comment": "Nhận xét sư phạm về câu hỏi này (ví dụ: Lưu ý thứ tự thực hiện phép tính, tránh nhầm lẫn dấu...)",
  "competency": "Năng lực toán học được đánh giá (Ví dụ: 'Năng lực tư duy và lập luận toán học', 'Năng lực giải quyết vấn đề toán học')"
}

LƯU Ý QUAN TRỌNG:
- Trả về mã JSON thô sạch sẽ, không có bao bọc bới các chuỗi khác ngoài đối tượng JSON. Không dùng các ký hiệu đặc biệt làm vỡ cú pháp JSON.
- Đảm bảo các công thức toán học dễ đọc. Tránh ký hiệu toán học quá phức tạp.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description: "Danh sách câu hỏi được tạo bởi AI",
              items: {
                type: Type.OBJECT,
                required: ["id", "type", "difficulty", "prompt", "correctAnswer", "solution", "competency"],
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING },
                  trueFalseStatements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["id", "statement", "answer"],
                      properties: {
                        id: { type: Type.STRING },
                        statement: { type: Type.STRING },
                        answer: { type: Type.BOOLEAN }
                      }
                    }
                  },
                  matchingPairs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["id", "left", "right"],
                      properties: {
                        id: { type: Type.STRING },
                        left: { type: Type.STRING },
                        right: { type: Type.STRING }
                      }
                    }
                  },
                  solution: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  comment: { type: Type.STRING },
                  competency: { type: Type.STRING }
                }
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Mô hình AI phản hồi rỗng.");
    }

    const data = parseRobustJson(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return res.status(500).json({ error: error.message || "Lỗi không xác định khi AI tạo đề toán." });
  }
});

// API Route: AI Parse Raw Exam Document Text or PDF/Word File
app.post("/api/parse-exam-document", async (req, res) => {
  try {
    const { rawText, fileBase64, fileMimeType } = req.body;

    if (!rawText && !fileBase64) {
      return res.status(400).json({
        error: "Thiếu nội dung văn bản hoặc file PDF/Word đề thi cần phân tích.",
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Bạn là một chuyên gia phân tích và trích xuất đề thi môn Toán cấp 2 (Lớp 6) hàng đầu.
Nhiệm vụ của bạn là tiếp nhận tài liệu/văn bản đề thi do giáo viên tải lên (từ file PDF, Word, hoặc dán trực tiếp), phân tích tiêu đề đề thi, các phần mức độ nhận thức (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao), các câu hỏi trắc nghiệm A/B/C/D (hoặc Đúng/Sai, Ghép cột, Tự luận), và tự động đối chiếu với bảng đáp án ở cuối đề (hoặc đáp án trong bài) để ghép đáp án đúng và sinh lời giải chi tiết chuẩn xác cho từng câu.`;

    const jsonInstructions = `Hãy phân tích tài liệu và trích xuất toàn bộ cấu trúc đề thi, trả về định dạng JSON theo đúng schema sau:
- 'title': Tiêu đề đề thi (Ví dụ: "BÀI 12. ƯỚC CHUNG. ƯỚC CHUNG LỚN NHẤT.").
- 'timeLimit': Thời gian làm bài tính bằng phút (mặc định 45 nếu không đề cập).
- 'questions': Mảng các câu hỏi trích xuất được.
   Với mỗi câu:
   + 'type': "multiple_choice" (Trắc nghiệm 4 phương án), "true_false" (Đúng / Sai), "matching" (Ghép nối), "fill_blank" (Điền đáp số), hoặc "essay" (Tự luận).
   + 'difficulty': "easy" (Nhận biết / Mức 1), "medium" (Thông hiểu / Mức 2), "hard" (Vận dụng / Mức 3), "very_hard" (Vận dụng cao / Mức 4).
   + 'prompt': Nội dung câu hỏi (chỉ lấy phần câu hỏi, giữ lại công thức ký hiệu toán học như ∈, ∉, ⊂, Ư(a), ƯC, ƯCLN, số mũ...).
   + 'options': Mảng các phương án ["A. ...", "B. ...", "C. ...", "D. ..."] (nếu type là multiple_choice).
   + 'correctAnswer': Phương án đúng chính xác. Hãy tra cứu BẢNG ĐÁP ÁN ở cuối văn bản/trang cuối (nếu có) để lấy chữ cái đáp án tương ứng với số thứ tự câu hỏi và ghi kèm nội dung phương án đầy đủ (Ví dụ: "C. x ∈ Ư(a) và x ∈ Ư(b)").
   + 'solution': Lời giải toán chi tiết, giải thích rõ ràng tại sao chọn đáp án đó.
   + 'competency': Năng lực toán học (Ví dụ: "Năng lực tư duy và lập luận toán học", "Năng lực giải quyết vấn đề toán học", "Năng lực tính toán").`;

    let contentsParam: any;
    if (fileBase64 && fileMimeType) {
      contentsParam = [
        {
          inlineData: {
            mimeType: fileMimeType,
            data: fileBase64
          }
        },
        `Hãy phân tích tài liệu đề thi PDF/Word được đính kèm ở trên và thực hiện nhiệm vụ:\n${jsonInstructions}`
      ];
    } else {
      contentsParam = `Hãy phân tích và trích xuất toàn bộ cấu trúc đề thi từ đoạn văn bản thô sau đây:\n\n[VĂN BẢN ĐỀ THI TRÍCH XUẤT]\n${(rawText || "").slice(0, 30000)}\n\n${jsonInstructions}`;
    }

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.0-flash",
      contents: contentsParam,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "questions"],
          properties: {
            title: { type: Type.STRING },
            timeLimit: { type: Type.NUMBER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["type", "difficulty", "prompt", "correctAnswer", "solution"],
                properties: {
                  type: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING },
                  trueFalseStatements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["id", "statement", "answer"],
                      properties: {
                        id: { type: Type.STRING },
                        statement: { type: Type.STRING },
                        answer: { type: Type.BOOLEAN }
                      }
                    }
                  },
                  matchingPairs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["id", "left", "right"],
                      properties: {
                        id: { type: Type.STRING },
                        left: { type: Type.STRING },
                        right: { type: Type.STRING }
                      }
                    }
                  },
                  solution: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  competency: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Mô hình AI trích xuất đề thi phản hồi rỗng.");
    }

    const data = parseRobustJson(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Error parsing exam document:", error);
    return res.status(500).json({ error: error.message || "Lỗi không thể phân tích văn bản đề thi." });
  }
});

// API Route: AI Grade Essay
app.post("/api/grade-essay", async (req, res) => {
  try {
    const { questionPrompt, studentAnswer, correctAnswer, solution, difficulty } = req.body;

    if (!questionPrompt || !studentAnswer) {
      return res.status(400).json({
        error: "Thiếu dữ liệu chấm bài (đề bài hoặc lời giải của học sinh).",
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Bạn là một Giáo viên chấm thi môn Toán lớp 6 tận tụy, công tâm và giàu tính sư phạm.
Nhiệm vụ của bạn là chấm điểm bài làm tự luận của học sinh, nhận xét chi tiết ưu điểm và lỗi sai, và đề xuất giải pháp sửa chữa.`;

    const userPrompt = `Hãy chấm bài làm tự luận Toán lớp 6 sau đây:
[Đề bài]
${questionPrompt}

[Độ khó]
${difficulty || "Không xác định"}

[Đáp số chuẩn]
${correctAnswer || "Không có"}

[Lời giải mẫu]
${solution || "Không có"}

[Bài làm của học sinh]
"${studentAnswer}"

Hãy cho điểm bài làm này trên thang điểm 10 (thương lượng từ 0 đến 10, chấp nhận số lẻ thập phân ví dụ 7.5, 8.0, 9.5).
Bạn PHẢI phản hồi bằng một đối tượng JSON duy nhất có dạng:
{
  "score": "số điểm từ 0 đến 10",
  "comment": "Nhận xét chi tiết bằng tiếng Việt: chỉ rõ học sinh làm đúng ở bước nào, sai ở bước nào (nếu có), phân tích nguyên nhân sai lầm (ví dụ: nhầm dấu, sai phép nhân...) và lời khuyên/khích lệ sư phạm chân thành để học sinh học tốt hơn."
}

Hãy trả về chuỗi JSON thô, sạch sẽ.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["score", "comment"],
          properties: {
            score: { type: Type.NUMBER, description: "Điểm số từ 0 đến 10" },
            comment: { type: Type.STRING, description: "Nhận xét sư phạm chi tiết" }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Mô hình AI chấm điểm rỗng.");
    }

    const data = parseRobustJson(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Error grading essay:", error);
    return res.status(500).json({ error: error.message || "Lỗi không thể chấm điểm tự động bài luận." });
  }
});

// Serve frontend build in production, otherwise Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AI Math Grade 6 Server] Khởi chạy thành công tại http://0.0.0.0:${PORT}`);
  });
}

startServer();
