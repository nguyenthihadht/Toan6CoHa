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
  const modelsToTry = [params.model, "gemini-flash-latest", "gemini-3.5-flash"];
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
    const systemInstruction = `Bạn là một Chuyên gia sư phạm Toán THCS hàng đầu Việt Nam, am hiểu sâu sắc Chương trình GDPT 2018 môn Toán lớp 6 (Bộ sách Kết nối tri thức với cuộc sống).
Nhiệm vụ của bạn là tạo đề ôn luyện hoặc kiểm tra môn Toán lớp 6 bám sát kiến thức SGK Kết nối tri thức.
Mỗi câu hỏi được sinh ra phải đạt các yêu cầu sau:
1. Độ chính xác tuyệt đối: Nội dung toán học, phép tính, khái niệm phải hoàn toàn chính xác.
2. Đúng lứa tuổi: Sử dụng ngôn từ trong sáng, dễ hiểu, phù hợp với trình độ học sinh lớp 6 tại Việt Nam. Không ra đề quá khó, không dùng các ký hiệu toán học chưa được học ở lớp 6.
3. Không lặp lại: Không sinh trùng câu hỏi hoặc ý tưởng trùng lắp. Các câu hỏi phân hóa rõ ràng.
4. Tính thực tế: Đối với các câu hỏi vận dụng hoặc tự luận, ưu tiên các bài toán thực tế lồng ghép ngữ cảnh đời sống Việt Nam (mua bán, trồng cây, chia lớp, tính tiền, đo đạc...) để kích thích tư duy học sinh.
5. Đúng định dạng JSON được yêu cầu dưới đây.`;

    const userPrompt = `Hãy tạo một bộ gồm đúng ${questionCount} câu hỏi toán học thuộc:
- Chương: ${chapterTitle || "Toán 6"}
- Bài học: ${lessonName}
- Kiến thức trọng tâm: ${keyKnowledge || "Kiến thức lớp 6 liên quan"}
- Mục tiêu cần đạt: ${targets ? targets.join(", ") : "Chuẩn kiến thức lớp 6"}

Các yêu cầu kỹ thuật đối với đề bài:
- Tổng số lượng câu hỏi cần tạo: ${questionCount} câu.
- Mức độ câu hỏi (phân bổ ngẫu nhiên hoặc chia đều theo các mức sau): ${difficultyLevels.join(", ")}. (easy = Nhận biết, medium = Thông hiểu, hard = Vận dụng, very_hard = Vận dụng cao).
- Các dạng bài được phép tạo: ${types.join(", ")}. (multiple_choice = Trắc nghiệm, true_false = Đúng Sai, matching = Ghép đôi, fill_blank = Điền số, essay = Tự luận/Giải toán thực tế).
${customPrompt ? `- Yêu cầu thêm từ giáo viên: "${customPrompt}"` : ""}

Bạn PHẢI trả về một đối tượng JSON có thuộc tính duy nhất là "questions", là một mảng các đối tượng câu hỏi. Mỗi đối tượng câu hỏi phải tuân thủ nghiêm ngặt cấu trúc sau:
{
  "id": "chuỗi định danh duy nhất ví dụ q1, q2, q3...",
  "type": "một trong các giá trị: 'multiple_choice', 'true_false', 'matching', 'fill_blank', 'essay'",
  "difficulty": "một trong các giá trị: 'easy', 'medium', 'hard', 'very_hard'",
  "prompt": "nội dung câu hỏi bằng tiếng Việt, viết rõ ràng bằng Latex hoặc văn bản thường cho công thức (Ví dụ 3^2, x \\in \\mathbb{N}). Hãy chú thích đề bài rõ ràng.",
  "options": ["mảng 4 lựa chọn cho trắc nghiệm, ví dụ: ['A. 5', 'B. 6', 'C. 7', 'D. 8']. Bỏ qua nếu không phải multiple_choice."],
  "correctAnswer": "đáp án đúng. Cách điền đáp án đúng:
     - Với 'multiple_choice': ghi chữ cái đại diện viết hoa, ví dụ: 'C' (không ghi 'C. 7').
     - Với 'true_false': ghi tóm tắt đáp án đúng, ví dụ 'Câu A: Đúng, Câu B: Sai...'.
     - Với 'matching': ghi chỉ dẫn ghép cặp đúng, ví dụ 'A-2, B-1, C-3'.
     - Với 'fill_blank': ghi số hoặc từ cần điền trực tiếp, ví dụ '12' hoặc 'số nguyên tố'.
     - Với 'essay': ghi tóm tắt đáp án cuối cùng, ví dụ 'x = 15'.",
  "trueFalseStatements": [
     { "id": "tf1", "statement": "Phát biểu 1", "answer": true },
     { "id": "tf2", "statement": "Phát biểu 2", "answer": false }
  ], // CHỈ cung cấp mảng này nếu type là 'true_false'. Mảng gồm ít nhất 2 đến 4 phát biểu để học sinh tích chọn Đúng hoặc Sai.
  "matchingPairs": [
     { "id": "m1", "left": "A. Luỹ thừa 2^3", "right": "1. Giá trị là 6" },
     { "id": "m2", "left": "B. Luỹ thừa 3^2", "right": "2. Giá trị là 8" },
     { "id": "m3", "left": "C. Tích 2.3", "right": "3. Giá trị là 9" }
  ], // CHỈ cung cấp mảng này nếu type là 'matching'. Học sinh sẽ ghép nối cột trái với cột phải. Hãy đảm bảo thứ tự cột phải lộn xộn để học sinh ghép.
  "solution": "Lời giải chi tiết từng bước bằng tiếng Việt, giảng giải cặn kẽ để học sinh học tập tốt nhất.",
  "hint": "Gợi ý hoặc mẹo nhỏ giúp học sinh định hướng cách làm bài.",
  "comment": "Nhận xét sư phạm về câu hỏi này (ví dụ: Lưu ý lỗi tính toán, nhắc nhở định nghĩa...)",
  "competency": "Năng lực toán học được đánh giá (Ví dụ: 'Năng lực tư duy và lập luận toán học', 'Năng lực giải quyết vấn đề toán học')"
}

LƯU Ý QUAN TRỌNG:
- Trả về mã JSON thô sạch sẽ, không có bao bọc bới các chuỗi khác ngoài đối tượng JSON. Không dùng các ký hiệu đặc biệt làm vỡ cú pháp JSON.
- Đảm bảo các công thức toán học dễ đọc. Tránh ký hiệu toán học quá phức tạp.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
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
      model: "gemini-3.5-flash",
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
