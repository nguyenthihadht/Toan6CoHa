export interface Lesson {
  id: string;
  name: string;
  keyKnowledge: string;
  targets: string[];
  commonMistakes: string[];
  sampleProblem: {
    question: string;
    answer: string;
    solution: string;
  };
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export const INITIAL_CURRICULUM: Chapter[] = [
  {
    id: "chuong-1",
    title: "Chương I: Tập hợp các số tự nhiên",
    description: "Khái niệm tập hợp, cách ghi số tự nhiên, các phép tính cơ bản, lũy thừa và thứ tự thực hiện phép tính.",
    lessons: [
      {
        id: "bai-1",
        name: "Bài 1: Tập hợp. Phần tử của tập hợp",
        keyKnowledge: "Khái niệm tập hợp, phần tử thuộc (∈) và không thuộc (∉) tập hợp. Cách mô tả tập hợp bằng 2 cách: Liệt kê phần tử hoặc Chỉ ra tính chất đặc trưng.",
        targets: [
          "Nhận biết được tập hợp và các phần tử của nó",
          "Sử dụng đúng các kí hiệu ∈ và ∉",
          "Biết cách viết một tập hợp bằng hai cách"
        ],
        commonMistakes: [
          "Viết các phần tử là số mà không cách nhau bằng dấu chấm phẩy (;), gây nhầm lẫn",
          "Viết lặp lại một phần tử nhiều lần trong tập hợp (mỗi phần tử chỉ được liệt kê 1 lần)"
        ],
        sampleProblem: {
          question: "Viết tập hợp A các số tự nhiên lớn hơn 5 và nhỏ hơn hoặc bằng 10 bằng hai cách.",
          answer: "Cách 1: A = {6; 7; 8; 9; 10}. Cách 2: A = {x ∈ ℕ | 5 < x ≤ 10}",
          solution: "Các số tự nhiên lớn hơn 5 và không vượt quá 10 là 6, 7, 8, 9, 10. Liệt kê ta có Cách 1. Chỉ ra tính chất đặc trưng ta có Cách 2."
        }
      },
      {
        id: "bai-2",
        name: "Bài 2: Cách ghi số tự nhiên",
        keyKnowledge: "Hệ thập phân, giá trị các chữ số theo vị trí. Chữ số La Mã (I, V, X, L, C, D, M) và cách viết.",
        targets: [
          "Hiểu cấu trúc hệ thập phân, giá trị của từng chữ số theo vị trí",
          "Biết đọc và viết số tự nhiên đến lớp triệu",
          "Biết viết và chuyển đổi các số La Mã từ 1 đến 30"
        ],
        commonMistakes: [
          "Lầm tưởng chữ số La Mã ghép tùy tiện (Ví dụ viết VX thay vì V)",
          "Xác định sai giá trị vị trí của một chữ số (nhầm hàng chục với hàng trăm)"
        ],
        sampleProblem: {
          question: "Viết số tự nhiên 2038 thành tổng giá trị các chữ số của nó và biểu diễn số 24 bằng chữ số La Mã.",
          answer: "2038 = 2000 + 30 + 8. Số 24 viết bằng chữ số La Mã là: XXIV",
          solution: "Chữ số 2 ở hàng nghìn (giá trị 2000), chữ số 0 hàng trăm, 3 hàng chục (giá trị 30), 8 hàng đơn vị. Số La Mã 24 gồm XX (20) và IV (4), viết ghép là XXIV."
        }
      },
      {
        id: "bai-3",
        name: "Bài 3: Thứ tự trong tập hợp các số tự nhiên",
        keyKnowledge: "So sánh hai số tự nhiên, biểu diễn số tự nhiên trên tia số. Kí hiệu ≤, ≥.",
        targets: [
          "Biết so sánh hai số tự nhiên bất kỳ",
          "Hiểu và vẽ được tia số, xác định điểm biểu diễn",
          "Sử dụng thành thạo kí hiệu nhỏ hơn hoặc bằng (≤), lớn hơn hoặc bằng (≥)"
        ],
        commonMistakes: [
          "Quên số 0 là số tự nhiên nhỏ nhất",
          "Nhầm lẫn chiều mũi tên tia số hoặc khoảng cách không đều"
        ],
        sampleProblem: {
          question: "Tìm các số tự nhiên x sao cho 12 ≤ x < 15.",
          answer: "x ∈ {12; 13; 14}",
          solution: "Vì x là số tự nhiên và thỏa mãn 12 ≤ x < 15, nên x có thể bằng 12 (do có dấu bằng ở 12) và x phải nhỏ hơn 15 (không lấy 15). Vậy x là 12, 13, 14."
        }
      },
      {
        id: "bai-4",
        name: "Bài 4: Phép cộng và phép trừ số tự nhiên",
        keyKnowledge: "Tính chất phép cộng (giao hoán, kết hợp, cộng với số 0). Phép trừ có số bị trừ lớn hơn hoặc bằng số trừ. Tính toán nhanh, tính nhẩm.",
        targets: [
          "Thực hiện thành thạo phép cộng và phép trừ số tự nhiên",
          "Áp dụng tính chất giao hoán, kết hợp để tính nhanh hợp lý",
          "Giải bài toán thực tế liên quan đến cộng trừ số tự nhiên"
        ],
        commonMistakes: [
          "Áp dụng nhầm tính chất kết hợp cho phép trừ (Ví dụ: a - b - c = a - (b - c) là sai, đúng là a - (b + c))",
          "Nhầm lẫn khi mượn trong phép trừ viết tay"
        ],
        sampleProblem: {
          question: "Tính nhanh: 135 + 360 + 65 + 40",
          answer: "600",
          solution: "Nhóm hợp lý: (135 + 65) + (360 + 40) = 200 + 400 = 600."
        }
      },
      {
        id: "bai-5",
        name: "Bài 5: Phép nhân và phép chia số tự nhiên",
        keyKnowledge: "Tính chất phép nhân (giao hoán, kết hợp, phân phối đối với phép cộng). Phép chia hết và phép chia có dư (a = b.q + r với 0 ≤ r < b).",
        targets: [
          "Thực hiện thành thạo phép nhân, chia số tự nhiên",
          "Biết viết kết quả phép chia có dư dưới dạng a = b.q + r",
          "Áp dụng tính chất phân phối để tính nhẩm nhanh"
        ],
        commonMistakes: [
          "Số dư r lớn hơn hoặc bằng số chia b là sai quy tắc",
          "Quên viết số 0 ở thương khi thực hiện phép chia (ví dụ 105 : 5 = 21 nhưng lại nhầm phép tính khác có số 0 ở giữa)"
        ],
        sampleProblem: {
          question: "Một xe ô tô chở được nhiều nhất 45 học sinh. Hỏi cần ít nhất bao nhiêu xe để chở hết 190 học sinh?",
          answer: "Cần ít nhất 5 xe.",
          solution: "Ta có phép chia: 190 : 45 = 4 (dư 10). Như vậy cần 4 xe chở đầy và dư ra 10 học sinh. Do đó cần thêm 1 xe nữa cho 10 học sinh này. Tổng số xe là 4 + 1 = 5 xe."
        }
      },
      {
        id: "bai-6",
        name: "Bài 6: Lũy thừa với số mũ tự nhiên",
        keyKnowledge: "Định nghĩa lũy thừa bậc n của a: a^n = a.a...a (n thừa số a). Nhân, chia hai lũy thừa cùng cơ số: a^m . a^n = a^(m+n); a^m : a^n = a^(m-n) (a ≠ 0, m ≥ n). Quy ước a^0 = 1 (a ≠ 0).",
        targets: [
          "Hiểu khái niệm lũy thừa, cơ số và số mũ",
          "Thực hiện thành thạo nhân và chia hai lũy thừa cùng cơ số",
          "Biết viết một số tự nhiên dưới dạng lũy thừa"
        ],
        commonMistakes: [
          "Tính nhầm a^n thành a . n (Ví dụ: 2^3 = 2 . 3 = 6 là sai, đúng là 2^3 = 2.2.2 = 8)",
          "Cộng các số mũ khi chia hai lũy thừa cùng cơ số (nhầm lẫn giữa nhân và chia)"
        ],
        sampleProblem: {
          question: "Viết kết quả phép tính sau dưới dạng một lũy thừa: 3^4 . 3^5 : 27",
          answer: "3^6",
          solution: "Ta có: 27 = 3^3. Do đó phép tính viết lại là: 3^4 . 3^5 : 3^3 = 3^(4+5-3) = 3^6."
        }
      },
      {
        id: "bai-7",
        name: "Bài 7: Thứ tự thực hiện các phép tính",
        keyKnowledge: "Biểu thức không có ngoặc: Lũy thừa -> Nhân, chia -> Cộng, trừ. Biểu thức có ngoặc: ngoặc tròn () -> ngoặc vuông [] -> ngoặc nhọn {}.",
        targets: [
          "Nhớ và áp dụng đúng quy tắc thứ tự thực hiện các phép tính",
          "Tính toán chính xác các biểu thức nhiều tầng dấu ngoặc và phép toán"
        ],
        commonMistakes: [
          "Thực hiện phép cộng trước phép nhân (Ví dụ 2 + 3 * 5 = 5 * 5 = 25 là sai, đúng là 2 + 15 = 17)",
          "Thực hiện phép tính từ phải qua trái với các phép tính cùng ưu tiên (như chia trước nhân sau khi viết liền)"
        ],
        sampleProblem: {
          question: "Tính giá trị biểu thức: 100 - [60 - (9 - 4)^2]",
          answer: "75",
          solution: "100 - [60 - 5^2] = 100 - [60 - 25] = 100 - 35 = 75."
        }
      }
    ]
  },
  {
    id: "chuong-2",
    title: "Chương II: Tính chia hết",
    description: "Quan hệ chia hết, các dấu hiệu chia hết cho 2, 5, 3, 9. Số nguyên tố, hợp số và tìm Ước chung lớn nhất, Bội chung nhỏ nhất.",
    lessons: [
      {
        id: "bai-8",
        name: "Bài 8: Quan hệ chia hết và tính chất chia hết",
        keyKnowledge: "Khái niệm chia hết (a ⋮ b). Tính chất chia hết của một tổng: Nếu a ⋮ m và b ⋮ m thì (a + b) ⋮ m. Tính chất chia hết của một tích.",
        targets: [
          "Hiểu khái niệm chia hết và kí hiệu ⋮, không chia hết",
          "Phát biểu và vận dụng được tính chất chia hết của một tổng/hiệu để xét chia hết mà không cần tính cụ thể"
        ],
        commonMistakes: [
          "Lầm tưởng nếu tổng chia hết cho m thì từng số hạng phải chia hết cho m (Ví dụ: 3 + 5 = 8 chia hết cho 2 nhưng 3 và 5 không chia hết cho 2)"
        ],
        sampleProblem: {
          question: "Không tính giá trị, hãy giải thích vì sao tổng A = 120 + 360 + 48 chia hết cho 12.",
          answer: "Do mỗi số hạng trong tổng đều chia hết cho 12.",
          solution: "Ta có: 120 ⋮ 12 (120 = 12 * 10); 360 ⋮ 12 (360 = 12 * 30); 48 ⋮ 12 (48 = 12 * 4). Theo tính chất chia hết của một tổng, tất cả các số hạng đều chia hết cho 12 nên tổng A ⋮ 12."
        }
      },
      {
        id: "bai-9",
        name: "Bài 9: Dấu hiệu chia hết cho 2, cho 5",
        keyKnowledge: "Các số có chữ số tận cùng là 0, 2, 4, 6, 8 thì chia hết cho 2. Tận cùng là 0, 5 thì chia hết cho 5. Tận cùng là 0 thì chia hết cho cả 2 và 5.",
        targets: [
          "Nhận biết nhanh các số chia hết cho 2, cho 5 thông qua chữ số tận cùng",
          "Giải các bài toán tìm chữ số tận cùng thỏa mãn điều kiện chia hết"
        ],
        commonMistakes: [
          "Nhầm lẫn dấu hiệu chia hết của 2, 5 (chỉ dựa vào chữ số tận cùng) với dấu hiệu của 3, 9 (dựa vào tổng các chữ số)"
        ],
        sampleProblem: {
          question: "Thay chữ số x bằng chữ số nào để số 35x chia hết cho cả 2 và 5?",
          answer: "x = 0",
          solution: "Để số 35x chia hết cho 2 thì x phải là chữ số chẵn (0, 2, 4, 6, 8). Để số 35x chia hết cho 5 thì x phải là 0 hoặc 5. Để thỏa mãn cả hai, x phải bằng 0. Số cần tìm là 350."
        }
      },
      {
        id: "bai-10",
        name: "Bài 10: Dấu hiệu chia hết cho 3, cho 9",
        keyKnowledge: "Các số có tổng các chữ số chia hết cho 9 thì chia hết cho 9. Các số có tổng các chữ số chia hết cho 3 thì chia hết cho 3.",
        targets: [
          "Hiểu và áp dụng dấu hiệu chia hết cho 3, cho 9",
          "Biết rằng số chia hết cho 9 thì chắc chắn chia hết cho 3, nhưng số chia hết cho 3 chưa chắc chia hết cho 9"
        ],
        commonMistakes: [
          "Chỉ nhìn chữ số cuối cùng để xét chia hết cho 3, cho 9 (sai lầm phổ biến nhất)"
        ],
        sampleProblem: {
          question: "Số 234 có chia hết cho 9 không? Vì sao?",
          answer: "Có chia hết cho 9 vì tổng các chữ số là 9.",
          solution: "Xét tổng các chữ số của số 234: 2 + 3 + 4 = 9. Vì 9 chia hết cho 9 nên số 234 chia hết cho 9."
        }
      },
      {
        id: "bai-11",
        name: "Bài 11: Ước và bội",
        keyKnowledge: "Nếu a chia hết cho b thì b là ước của a, a là bội của b. Cách tìm ước bằng cách chia thử, cách tìm bội bằng cách nhân liên tiếp.",
        targets: [
          "Hiểu định nghĩa ước và bội, kí hiệu Ư(a) và B(a)",
          "Biết cách tìm tập hợp các ước của một số tự nhiên",
          "Biết cách tìm các bội của một số tự nhiên"
        ],
        commonMistakes: [
          "Tìm thiếu ước (thường bỏ quên số 1 và chính nó)",
          "Viết tập bội B(a) mà quên số 0 hoặc viết tập bội là tập hữu hạn (bội của số tự nhiên khác 0 là vô hạn)"
        ],
        sampleProblem: {
          question: "Viết tập hợp các ước của 12 và tập hợp 5 bội đầu tiên lớn hơn 0 của 6.",
          answer: "Ư(12) = {1; 2; 3; 4; 6; 12}. 5 bội của 6 là {6; 12; 18; 24; 30}",
          solution: "Ta chia 12 lần lượt cho từ 1 đến 12 để tìm các phép chia hết, ta được Ư(12). Bội của 6 lớn hơn 0 được tìm bằng cách lấy 6 nhân lần lượt với 1, 2, 3, 4, 5."
        }
      },
      {
        id: "bai-12",
        name: "Bài 12: Số nguyên tố. Hợp số",
        keyKnowledge: "Số nguyên tố là số tự nhiên lớn hơn 1, chỉ có 2 ước là 1 và chính nó. Hợp số là số tự nhiên lớn hơn 1, có nhiều hơn 2 ước. Số 0 và số 1 không là số nguyên tố cũng không là hợp số. Phân tích một số ra thừa số nguyên tố.",
        targets: [
          "Phân biệt được số nguyên tố và hợp số",
          "Thuộc các số nguyên tố nhỏ hơn 20 (2, 3, 5, 7, 11, 13, 17, 19)",
          "Thành thạo kỹ năng phân tích một số ra thừa số nguyên tố (sơ đồ cột hoặc sơ đồ cây)"
        ],
        commonMistakes: [
          "Nhầm lẫn số lẻ là số nguyên tố (Ví dụ nghĩ 9, 15 là số nguyên tố)",
          "Nhầm lẫn số 2 là hợp số vì nghĩ số nguyên tố phải là số lẻ (số 2 là số nguyên tố chẵn duy nhất)"
        ],
        sampleProblem: {
          question: "Phân tích số 60 ra thừa số nguyên tố.",
          answer: "60 = 2^2 . 3 . 5",
          solution: "Chia liên tiếp cho các số nguyên tố: 60 : 2 = 30; 30 : 2 = 15; 15 : 3 = 5; 5 : 5 = 1. Vậy 60 = 2 . 2 . 3 . 5 = 2^2 . 3 . 5."
        }
      },
      {
        id: "bai-13",
        name: "Bài 13: Ước chung. Ước chung lớn nhất",
        keyKnowledge: "Khái niệm ước chung, ước chung lớn nhất (ƯCLN). Hai số nguyên tố cùng nhau (ƯCLN bằng 1). Quy tắc tìm ƯCLN bằng cách phân tích ra thừa số nguyên tố.",
        targets: [
          "Hiểu thế nào là ước chung, ƯCLN của hai hay nhiều số",
          "Biết tìm ƯCLN bằng cách phân tích ra thừa số nguyên tố",
          "Áp dụng ƯCLN vào các bài toán chia đều trong thực tế"
        ],
        commonMistakes: [
          "Khi tìm ƯCLN, lấy thừa số với số mũ lớn nhất (nhầm với tìm BCNN, ƯCLN phải lấy số mũ nhỏ nhất)"
        ],
        sampleProblem: {
          question: "Tìm ƯCLN của 18 và 30.",
          answer: "ƯCLN(18, 30) = 6",
          solution: "Phân tích: 18 = 2 . 3^2; 30 = 2 . 3 . 5. Các thừa số nguyên tố chung là 2 và 3. Số mũ nhỏ nhất của 2 là 1, của 3 là 1. Vậy ƯCLN(18, 30) = 2^1 . 3^1 = 6."
        }
      },
      {
        id: "bai-14",
        name: "Bài 14: Bội chung. Bội chung nhỏ nhất",
        keyKnowledge: "Khái niệm bội chung, bội chung nhỏ nhất (BCNN). Quy tắc tìm BCNN bằng phân tích thừa số nguyên tố. Tìm bội chung thông qua BCNN.",
        targets: [
          "Hiểu khái niệm bội chung và BCNN",
          "Vận dụng thành thạo quy tắc tìm BCNN",
          "Giải quyết các bài toán thực tế có chu kỳ (báo thức, xe chạy, trồng cây)"
        ],
        commonMistakes: [
          "Khi tìm BCNN, chỉ chọn thừa số chung mà bỏ qua thừa số riêng (BCNN phải lấy cả chung lẫn riêng với số mũ lớn nhất)"
        ],
        sampleProblem: {
          question: "Hai bạn An và Bình cùng trực nhật thư viện. An cứ 6 ngày trực một lần, Bình cứ 8 ngày trực một lần. Hỏi sau ít nhất bao nhiêu ngày hai bạn lại cùng trực nhật?",
          answer: "Sau ít nhất 24 ngày.",
          solution: "Số ngày để hai bạn lại cùng trực nhật là bội chung nhỏ nhất của 6 và 8. Ta có: 6 = 2 . 3; 8 = 2^3. BCNN(6, 8) = 2^3 . 3 = 24. Vậy sau ít nhất 24 ngày hai bạn lại cùng trực nhật."
        }
      }
    ]
  },
  {
    id: "chuong-3",
    title: "Chương III: Số nguyên",
    description: "Khái niệm số nguyên âm, tập hợp số nguyên Z, biểu diễn số nguyên, thứ tự, cộng trừ nhân chia các số nguyên và quy tắc dấu ngoặc.",
    lessons: [
      {
        id: "bai-15",
        name: "Bài 15: Số nguyên âm và tập hợp các số nguyên",
        keyKnowledge: "Số nguyên âm biểu thị đại lượng có hướng ngược lại (nhiệt độ dưới 0 độ, độ cao dưới mực nước biển, nợ tiền). Tập hợp ℤ = {..., -3, -2, -1, 0, 1, 2, 3, ...}. Biểu diễn số nguyên trên trục số. Số đối của một số nguyên.",
        targets: [
          "Hiểu ý nghĩa thực tế của số nguyên âm",
          "Biết đọc, viết và so sánh các số nguyên",
          "Biểu diễn được các số nguyên trên trục số thẳng đứng hoặc nằm ngang",
          "Tìm được số đối của một số nguyên"
        ],
        commonMistakes: [
          "Nghĩ rằng số đối của một số luôn là số nguyên âm (sai, số đối của số âm là số dương)",
          "So sánh sai các số nguyên âm: nghĩ rằng -5 > -3 vì nghĩ 5 > 3 (thực tế -5 < -3)"
        ],
        sampleProblem: {
          question: "So sánh các cặp số sau: a) -8 và -5; b) -3 và 2. Tìm số đối của -10.",
          answer: "a) -8 < -5; b) -3 < 2. Số đối của -10 là 10.",
          solution: "Trên trục số nằm ngang, điểm -8 nằm bên trái điểm -5 nên -8 < -5. Số âm luôn nhỏ hơn số dương nên -3 < 2. Số đối của -10 là số dương có cùng khoảng cách đến gốc 0, tức là 10."
        }
      },
      {
        id: "bai-16",
        name: "Bài 16: Phép cộng và phép trừ hai số nguyên",
        keyKnowledge: "Cộng hai số nguyên cùng dấu, khác dấu. Phép trừ hai số nguyên: a - b = a + (-b). Quy tắc dấu ngoặc: khi bỏ ngoặc có dấu '+' đằng trước thì giữ nguyên dấu, có dấu '-' thì đổi dấu tất cả các số hạng trong ngoặc.",
        targets: [
          "Thực hiện thành thạo phép cộng và phép trừ hai số nguyên",
          "Áp dụng chính xác quy tắc dấu ngoặc",
          "Tính nhanh biểu thức số nguyên hợp lý"
        ],
        commonMistakes: [
          "Quên đổi dấu các số hạng bên trong khi bỏ ngoặc có dấu trừ đằng trước",
          "Cộng khác dấu sai quy tắc (lấy tổng hai trị tuyệt đối thay vì lấy hiệu)"
        ],
        sampleProblem: {
          question: "Tính giá trị biểu thức: A = (25 - 40) - (15 - 40)",
          answer: "10",
          solution: "Bỏ ngoặc: A = 25 - 40 - 15 + 40 = (25 - 15) + (40 - 40) = 10 + 0 = 10. Hoặc tính trong ngoặc trước: A = (-15) - (-25) = -15 + 25 = 10."
        }
      },
      {
        id: "bai-17",
        name: "Bài 17: Phép nhân hai số nguyên",
        keyKnowledge: "Quy tắc dấu của phép nhân: Cùng dấu ra dương (+ . + = +; - . - = +). Khác dấu ra âm (+ . - = -; - . + = -). Tính chất của phép nhân (giao hoán, kết hợp, phân phối).",
        targets: [
          "Thực hiện chính xác phép nhân hai số nguyên",
          "Nhớ quy tắc nhân dấu: cùng dấu ra dương, khác dấu ra âm"
        ],
        commonMistakes: [
          "Nhầm quy tắc dấu của phép nhân với phép cộng (Ví dụ nghĩ -3 * -5 = -15 vì nhầm với -3 + (-5) = -8)"
        ],
        sampleProblem: {
          question: "Tính nhanh tích sau: (-4) . 125 . (-25) . (-8)",
          answer: "-100000",
          solution: "Nhóm hợp lý: [(-4) . (-25)] . [125 . (-8)] = 100 . (-1000) = -100000."
        }
      },
      {
        id: "bai-18",
        name: "Bài 18: Phép chia hết. Ước và bội của một số nguyên",
        keyKnowledge: "Khái niệm chia hết trong tập số nguyên Z. Cách tìm ước và bội của một số nguyên (bao gồm cả số nguyên dương và số nguyên âm).",
        targets: [
          "Hiểu quan hệ chia hết trong Z, quy tắc dấu của phép chia giống phép nhân",
          "Tìm được tất cả ước và bội của một số nguyên cho trước"
        ],
        commonMistakes: [
          "Khi tìm ước của một số nguyên b, chỉ liệt kê ước dương mà quên ước âm (Ví dụ ước của 4 là {1, 2, 4} mà quên {-1, -2, -4})"
        ],
        sampleProblem: {
          question: "Tìm tất cả các ước nguyên của số 6.",
          answer: "Ư(6) = {1; -1; 2; -2; 3; -3; 6; -6}",
          solution: "Các ước tự nhiên của 6 là 1, 2, 3, 6. Do đó các ước nguyên của 6 bao gồm cả các số đối của chúng. Vậy có 8 ước nguyên là ±1, ±2, ±3, ±6."
        }
      }
    ]
  },
  {
    id: "chuong-4",
    title: "Chương IV: Một số hình phẳng trong thực tiễn",
    description: "Nhận biết các hình phẳng quen thuộc: Tam giác đều, hình vuông, lục giác đều, hình thoi, hình chữ nhật, hình bình hành, hình thang cân và tính chu vi, diện tích của chúng.",
    lessons: [
      {
        id: "bai-19",
        name: "Bài 19: Tam giác đều. Hình vuông. Hình lục giác đều",
        keyKnowledge: "Đặc điểm cấu tạo cạnh, góc, đường chéo của tam giác đều, hình vuông, lục giác đều. Cách vẽ hình vuông, tam giác đều bằng thước và compa.",
        targets: [
          "Nhận dạng và mô tả các yếu tố cơ bản (cạnh, góc, đường chéo) của tam giác đều, hình vuông, hình lục giác đều",
          "Biết vẽ tam giác đều, hình vuông bằng dụng cụ học tập"
        ],
        commonMistakes: [
          "Xác định sai số lượng đường chéo chính của hình lục giác đều (có 3 đường chéo chính chứ không phải 9 đường chéo nói chung)"
        ],
        sampleProblem: {
          question: "Nêu các đặc điểm về cạnh và góc của một hình vuông.",
          answer: "Có 4 cạnh bằng nhau, 4 góc bằng nhau và bằng 90 độ.",
          solution: "Theo định nghĩa hình vuông, bốn cạnh của hình vuông có độ dài bằng nhau và bốn góc đều là góc vuông."
        }
      },
      {
        id: "bai-20",
        name: "Bài 20: Hình chữ nhật. Hình thoi. Hình bình hành. Hình thang cân",
        keyKnowledge: "Đặc điểm của hình chữ nhật, hình thoi, hình bình hành, hình thang cân. Công thức tính chu vi và diện tích các hình phẳng.",
        targets: [
          "Nhận dạng và nêu đặc điểm các hình phẳng",
          "Vận dụng thành thạo công thức tính chu vi, diện tích: S_hình_chữ_nhật = a.b; S_hình_thoi = 1/2.m.n; S_hình_bình_hành = a.h; S_hình_thang = 1/2.(a+b).h"
        ],
        commonMistakes: [
          "Nhầm lẫn chiều cao và cạnh bên khi tính diện tích hình bình hành hoặc hình thang",
          "Quên chia 2 trong công thức tính diện tích hình thoi và hình thang"
        ],
        sampleProblem: {
          question: "Một mảnh vườn hình thang cân có hai đáy là 6m và 10m, chiều cao là 5m. Tính diện tích mảnh vườn đó.",
          answer: "Diện tích là 40 m²",
          solution: "Áp dụng công thức tính diện tích hình thang: S = (a + b) * h : 2 = (6 + 10) * 5 : 2 = 16 * 5 : 2 = 40 (m²)."
        }
      }
    ]
  }
];
