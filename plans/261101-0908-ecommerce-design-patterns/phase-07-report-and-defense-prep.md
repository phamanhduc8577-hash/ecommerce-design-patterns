---
phase: 7
title: "Báo cáo Hoàn chỉnh, Sơ đồ UML & Bộ Câu hỏi Vấn đáp"
status: pending
priority: P1
effort: "0.5d"
dependencies: ["phase-06-testing-and-demo"]
---

# Phase 7: Báo cáo Hoàn chỉnh, Sơ đồ UML & Bộ Câu hỏi Vấn đáp

## Overview
Tổng hợp toàn bộ nội dung thành file báo cáo chính thức theo chuẩn quy định của giảng viên, hoàn thiện đầy đủ các sơ đồ UML (Class Diagram, Sequence Diagram), định dạng tài liệu đạt chuẩn học thuật (APA/IEEE) và biên soạn bộ câu hỏi - câu trả lời vấn đáp giúp sinh viên tự tin đạt điểm tối đa khi bảo vệ trước hội đồng.

## Requirements
1. **Cấu trúc Báo cáo theo chuẩn Rubric (Điểm Bố cục 1.5đ & Hình thức 1.5đ):**
   - Trang bìa chuẩn mẫu.
   - Mục lục tự động, Danh mục hình ảnh, Danh mục bảng biểu, Danh mục từ viết tắt.
   - Bảng phân công nhiệm vụ và tỷ lệ đóng góp của từng thành viên (100%).
   - Căn lề chuẩn (Trên/Dưới 2cm, Trái 3cm, Phải 2cm), Font Times New Roman hoặc Arial, giãn dòng 1.3 - 1.5.
   - Trích dẫn tài liệu tham khảo theo chuẩn IEEE hoặc APA.
2. **Nội dung chuyên môn (7.0đ):**
   - Chương 1: Tổng quan về bài toán TMĐT & Use Cases (0.5đ).
   - Chương 2: Cơ sở lý thuyết Design Patterns, SOLID & Kiến trúc Clean Architecture (1.5đ).
   - Chương 3: Phân tích & Thiết kế chi tiết 6 Design Patterns (2.5đ) - Đầy đủ Class Diagrams, Sequence Diagrams, so sánh ưu nhược và phân tích SOLID.
   - Chương 4: Cài đặt, Kịch bản Kiểm thử & Đánh giá kết quả (1.5đ).
   - Chương 5: Kết luận & Hướng phát triển.
   - Tài liệu tham khảo.
3. **Bộ Câu hỏi Vấn đáp bảo vệ (1.0đ):**
   - Chuẩn bị sẵn 15-20 câu hỏi phỏng vấn thường gặp của giảng viên về từng pattern.
   - Câu trả lời mẫu súc tích, đi thẳng vào bản chất: "Tại sao chọn pattern này mà không dùng cách thông thường?", "Pattern này vi phạm hay thỏa mãn OCP/DIP như thế nào?", "Nếu hệ thống mở rộng tính năng X thì sửa đổi code ở đâu?".

## Deliverables
- Create: `plans/reports/BAO_CAO_TIEU_LUAN_MAU_THIET_KE_PM.md` (hoặc file Word/PDF xuất từ mẫu).
- Create: `docs/defense-qa/cau-hoi-van-dap.md`
- Create: `docs/diagrams/...` (Export ảnh PNG/SVG từ PlantUML hoặc Mermaid).

## Implementation Steps
1. Soạn thảo toàn bộ nội dung báo cáo theo bố cục 5 chương quy định.
2. Xuất các sơ đồ UML thành file hình ảnh rõ nét, đánh số Hình và chú thích đầy đủ.
3. Rà soát lỗi chính tả, kỹ thuật in ấn, trích dẫn tài liệu tham khảo chuẩn IEEE/APA.
4. Biên soạn bộ cẩm nang vấn đáp cho các thành viên trong nhóm ôn luyện trước ngày báo cáo (10 hoặc 12/11).
5. Đóng gói repository mã nguồn, kiểm tra link GitHub và hướng dẫn chạy trong file `README.md`.

## Success Criteria
- [x] Báo cáo đầy đủ 100% các mục theo rubric chấm điểm của giảng viên.
- [x] Không có lỗi chính tả, hình thức chỉn chu, chuyên nghiệp.
- [x] Thành viên nắm chắc kiến thức và trả lời trôi chảy các câu hỏi vấn đáp.
