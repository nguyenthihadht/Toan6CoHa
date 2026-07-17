import { Quiz } from "../types";

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: "quiz-sample-1",
    title: "Khảo sát đầu năm: Tập hợp và phần tử lớp 6",
    createdAt: "2026-07-15T08:30:00.000Z",
    createdBy: "Cô Nguyễn Hà",
    chapterId: "chuong-1",
    lessonId: "bai-1",
    difficultyLevels: ["easy", "medium"],
    questionCount: 5,
    types: ["multiple_choice", "true_false", "fill_blank"],
    schoolName: "Trường THCS Lê Quý Đôn",
    examDate: "2026-09-05",
    questions: [
      {
        id: "q_mc_1",
        type: "multiple_choice",
        difficulty: "easy",
        prompt: "Cho tập hợp M = {3; 4; 5; 6}. Trong các phát biểu sau, phát biểu nào ĐÚNG?",
        options: [
          "A. 3 ∉ M",
          "B. 7 ∈ M",
          "C. {4; 5} ∈ M",
          "D. 5 ∈ M"
        ],
        correctAnswer: "D",
        solution: "Tập hợp M có các phần tử là 3, 4, 5, 6. Do đó:\n- 3 là phần tử của M nên 3 ∈ M (phát biểu A sai).\n- 7 không nằm trong M nên 7 ∉ M (phát biểu B sai).\n- {4; 5} là một tập hợp con, không phải phần tử thuộc dạng ∈ (phát biểu C chưa chính xác về ký hiệu phần tử).\n- 5 là phần tử của M nên 5 ∈ M. Vậy D đúng.",
        hint: "Xem lại danh sách các số nằm giữa dấu ngoặc nhọn của tập hợp M.",
        comment: "Học sinh dễ nhầm lẫn ký hiệu tập hợp con (⊂) và phần tử thuộc (∈).",
        competency: "Năng lực tư duy và lập luận toán học"
      },
      {
        id: "q_tf_1",
        type: "true_false",
        difficulty: "easy",
        prompt: "Xét tính đúng/sai của các phát biểu về tập hợp sau đây:",
        correctAnswer: "A: Đúng, B: Sai, C: Đúng",
        trueFalseStatements: [
          { id: "tf_1_1", statement: "Tập hợp P = {x ∈ ℕ | x < 3} gồm có 3 phần tử là 0, 1, 2.", answer: true },
          { id: "tf_1_2", statement: "Cách viết tập hợp B = {1; 2; 2; 3} là một cách viết đúng chuẩn học thuật.", answer: false },
          { id: "tf_1_3", statement: "Kí hiệu ∉ dùng để chỉ một phần tử không thuộc một tập hợp cho trước.", answer: true }
        ],
        solution: "- Phát biểu 1: Đúng. Tập số tự nhiên ℕ bắt đầu từ 0. Các số tự nhiên nhỏ hơn 3 là 0, 1, 2.\n- Phát biểu 2: Sai. Trong một tập hợp, mỗi phần tử chỉ được liệt kê đúng một lần. Phần tử 2 bị lặp lại là sai quy tắc liệt kê.\n- Phát biểu 3: Đúng. Kí hiệu ∉ dùng biểu thị quan hệ không thuộc.",
        hint: "Nhớ rằng số tự nhiên bắt đầu từ số 0 và không liệt kê trùng phần tử.",
        comment: "Tránh lỗi lặp lại phần tử trong tập hợp.",
        competency: "Năng lực tư duy và lập luận toán học"
      },
      {
        id: "q_fb_1",
        type: "fill_blank",
        difficulty: "medium",
        prompt: "Cho tập hợp K các chữ số xuất hiện trong số tự nhiên 2026. Số phần tử của tập hợp K là bao nhiêu?",
        correctAnswer: "3",
        solution: "Số tự nhiên 2026 được cấu tạo từ các chữ số: 2, 0, 2, 6. \nKhi đưa vào tập hợp K, các phần tử trùng nhau chỉ ghi một lần. \nDo đó, K = {2; 0; 6}.\nVậy tập hợp K có 3 phần tử.",
        hint: "Đọc kỹ các chữ số tạo thành số 2026 và loại bỏ các chữ số trùng lặp.",
        comment: "Lưu ý học sinh đếm chữ số trùng nhau thành 1 phần tử duy nhất.",
        competency: "Năng lực giải quyết vấn đề toán học"
      },
      {
        id: "q_mc_2",
        type: "multiple_choice",
        difficulty: "medium",
        prompt: "Viết tập hợp B các số tự nhiên lớn hơn 4 và nhỏ hơn hoặc bằng 9 bằng cách chỉ ra tính chất đặc trưng.",
        options: [
          "A. B = {x ∈ ℕ | 4 < x < 9}",
          "B. B = {x ∈ ℕ | 4 < x ≤ 9}",
          "C. B = {x ∈ ℕ | 4 ≤ x ≤ 9}",
          "D. B = {x ∈ ℕ | 5 < x ≤ 9}"
        ],
        correctAnswer: "B",
        solution: "Số tự nhiên x lớn hơn 4 biểu diễn bằng: x > 4 (hoặc 4 < x).\nSố tự nhiên x không vượt quá 9 biểu diễn bằng: x ≤ 9.\nKết hợp hai điều kiện ta được: B = {x ∈ ℕ | 4 < x ≤ 9}.",
        hint: "Cụm từ 'nhỏ hơn hoặc bằng' tương ứng với kí hiệu ≤.",
        comment: "Nhận diện đúng điều kiện biên (giới hạn đầu và cuối) của tập hợp.",
        competency: "Năng lực tư duy và lập luận toán học"
      },
      {
        id: "q_fb_2",
        type: "fill_blank",
        difficulty: "medium",
        prompt: "Điền số tự nhiên thích hợp vào chỗ trống để hoàn thành tập hợp các ước của 6: Ư(6) = {1; 2; ...; 6}",
        correctAnswer: "3",
        solution: "Các ước tự nhiên của 6 là các số mà 6 chia hết. Ta có 6 chia hết cho 1, 2, 3, 6. Số còn thiếu trong danh sách tăng dần là số 3.",
        hint: "Ước của 6 là các số chia hết cho 6. Lấy 6 chia cho 2 sẽ được kết quả cần tìm.",
        comment: "Kiểm tra kiến thức cơ bản về tìm ước của một số.",
        competency: "Năng lực giải quyết vấn đề toán học"
      }
    ]
  },
  {
    id: "quiz-sample-2",
    title: "Đề ôn tập Chương II: Số nguyên tố và Số nguyên",
    createdAt: "2026-07-16T10:15:00.000Z",
    createdBy: "Thầy Trần Minh",
    chapterId: "chuong-2",
    lessonId: "bai-12",
    difficultyLevels: ["medium", "hard", "very_hard"],
    questionCount: 4,
    types: ["multiple_choice", "matching", "essay"],
    schoolName: "Trường THCS Lê Quý Đôn",
    examDate: "2026-10-15",
    questions: [
      {
        id: "q_mc_3",
        type: "multiple_choice",
        difficulty: "medium",
        prompt: "Số tự nhiên nào sau đây là hợp số?",
        options: [
          "A. 2",
          "B. 11",
          "C. 15",
          "D. 19"
        ],
        correctAnswer: "C",
        solution: "- Số 2, 11, 19 chỉ chia hết cho 1 và chính nó nên là các số nguyên tố.\n- Số 15 chia hết cho 1, 3, 5, 15 nên có nhiều hơn 2 ước, do đó 15 là hợp số. Đáp án đúng là C.",
        hint: "Hãy thử chia các số này cho 3 hoặc 5 xem có chia hết không.",
        comment: "Học sinh dễ nhầm các số lẻ đều là số nguyên tố.",
        competency: "Năng lực tư duy và lập luận toán học"
      },
      {
        id: "q_mat_1",
        type: "matching",
        difficulty: "medium",
        prompt: "Hãy ghép nối các biểu thức luỹ thừa ở cột bên trái với giá trị đúng ở cột bên phải:",
        correctAnswer: "A-2, B-3, C-1",
        matchingPairs: [
          { id: "m_1_1", left: "A. Luỹ thừa 2^4", right: "1. Giá trị là 27" },
          { id: "m_1_2", left: "B. Luỹ thừa 3^3", right: "2. Giá trị là 16" },
          { id: "m_1_3", left: "C. Luỹ thừa 5^2", right: "3. Giá trị là 25" }
        ],
        solution: "- 2^4 = 2.2.2.2 = 16 (Ghép A với 2)\n- 3^3 = 3.3.3 = 27 (Ghép B với 1)\n- 5^2 = 5.5 = 25 (Ghép C with 3)",
        hint: "Tính toán kỹ luỹ thừa bằng cách nhân liên tiếp, tránh nhầm lẫn cơ số nhân với số mũ.",
        comment: "Sửa lỗi học sinh tính nhầm 2^4 = 2 * 4 = 8.",
        competency: "Năng lực giải quyết vấn đề toán học"
      },
      {
        id: "q_es_1",
        type: "essay",
        difficulty: "hard",
        prompt: "Bác Năm có 48 quả cam và 72 quả táo. Bác muốn chia đều số cam và quả táo này vào các đĩa sao cho mỗi đĩa đều có số quả cam và quả táo như nhau. Hỏi bác Năm có thể chia được nhiều nhất vào bao nhiêu đĩa? Khi đó mỗi đĩa có bao nhiêu quả cam, bao nhiêu quả táo?",
        correctAnswer: "24 đĩa. Mỗi đĩa 2 quả cam và 3 quả táo.",
        solution: "Gọi x là số đĩa nhiều nhất có thể chia (x ∈ ℕ*).\nTheo đề bài, để chia đều 48 quả cam và 72 quả táo vào x đĩa thì x phải là ước của 48 và 72. Do x là số đĩa nhiều nhất nên x = ƯCLN(48, 72).\n\nPhân tích ra thừa số nguyên tố:\n48 = 2^4 . 3\n72 = 2^3 . 3^2\nThừa số nguyên tố chung là 2 và 3.\nƯCLN(48, 72) = 2^3 . 3 = 8 . 3 = 24.\n\nVậy bác Năm có thể chia được nhiều nhất vào 24 đĩa.\nKhi đó, mỗi đĩa có:\n- Số quả cam: 48 : 24 = 2 (quả)\n- Số quả táo: 72 : 24 = 3 (quả).\n\nĐáp số: 24 đĩa; 2 quả cam, 3 quả táo.",
        hint: "Số đĩa nhiều nhất chính là ước chung lớn nhất của số quả cam và quả táo.",
        comment: "Bài toán thực tế áp dụng ƯCLN cực kỳ phổ biến trong đề thi học kỳ 1.",
        competency: "Năng lực giải quyết vấn đề toán học"
      },
      {
        id: "q_es_2",
        type: "essay",
        difficulty: "very_hard",
        prompt: "Tìm số tự nhiên n lớn nhất sao cho 15 chia hết cho (2n + 1).",
        correctAnswer: "n = 7",
        solution: "Để 15 chia hết cho (2n + 1) thì (2n + 1) phải là ước tự nhiên của 15.\nCác ước tự nhiên của 15 là: Ư(15) = {1; 3; 5; 15}.\nTa có các trường hợp:\n1) 2n + 1 = 1 => 2n = 0 => n = 0 (thỏa mãn)\n2) 2n + 1 = 3 => 2n = 2 => n = 1 (thỏa mãn)\n3) 2n + 1 = 5 => 2n = 4 => n = 2 (thỏa mãn)\n4) 2n + 1 = 15 => 2n = 14 => n = 7 (thỏa mãn)\n\nDo n là số tự nhiên lớn nhất nên n = 7.\nVậy n = 7.",
        hint: "Liệt kê tất cả ước của 15, sau đó tìm n tương ứng và chọn số n lớn nhất.",
        comment: "Câu hỏi vận dụng cao phân hóa học sinh giỏi.",
        competency: "Năng lực tư duy và lập luận toán học"
      }
    ]
  }
];
