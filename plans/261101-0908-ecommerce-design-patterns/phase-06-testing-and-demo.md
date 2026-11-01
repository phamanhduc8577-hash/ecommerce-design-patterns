---
phase: 6
title: "Bộ Kịch bản Kiểm thử & Chương trình Demo Trực quan"
status: pending
priority: P1
effort: "0.5d"
dependencies: ["phase-05-behavioral-patterns"]
---

# Phase 6: Bộ Kịch bản Kiểm thử & Chương trình Demo Trực quan

## Overview
Xây dựng bộ kịch bản kiểm thử (Test Cases / Unit Tests) chứng minh sự hoạt động đúng đắn của từng Design Pattern và chương trình demo tương tác chạy mượt mà trên console/giao diện, phục vụ báo cáo vấn đáp trực tiếp với giảng viên.

## Requirements
- Kịch bản kiểm thử (Test Cases):
  - Test 1 (Factory): Kiểm tra khởi tạo đúng loại cổng thanh toán theo tham số truyền vào; kiểm tra ném lỗi hợp lệ khi loại cổng không hỗ trợ.
  - Test 2 (Builder): Kiểm tra tạo đơn hàng với các cấu hình linh hoạt (đủ items, thiếu địa chỉ thì không build được, có/không có gói quà).
  - Test 3 (Adapter): Kiểm tra dữ liệu được chuẩn hóa đúng định dạng từ SDK bên thứ ba vào hệ thống.
  - Test 4 (Decorator): Kiểm tra tính toán cộng dồn chính xác số tiền khi bọc 1, 2 hoặc nhiều tầng decorator.
  - Test 5 (Strategy): Kiểm tra tính tiền giảm giá đúng công thức cho từng loại khách hàng (VIP 15%, Regular 0%, Holiday theo bậc).
  - Test 6 (Observer): Kiểm tra tất cả các Observers đăng ký đều nhận được sự kiện khi trạng thái đơn đổi sang `PAID`.
- Chương trình Demo (Runner/CLI):
  - Menu điều khiển trực quan bằng console có màu sắc hoặc giao diện web/CLI tối giản.
  - Mô phỏng toàn bộ luồng mua sắm: Chọn mặt hàng -> Dùng Builder dựng đơn -> Dùng Decorator thêm dịch vụ -> Dùng Strategy áp mã VIP -> Dùng Factory/Adapter thanh toán VNPay -> Kích hoạt Observer cập nhật kho và gửi email.
  - Log chi tiết từng bước cho thấy pattern nào đang được gọi và giải quyết vấn đề gì.
- Đánh giá chất lượng:
  - Đánh giá khả năng mở rộng (Extensibility).
  - Đánh giá khả năng bảo trì (Maintainability) và hiệu năng (Performance).

## Architecture & Test Structure
- Thư mục test rõ ràng: `tests/unit/creational`, `tests/unit/structural`, `tests/unit/behavioral`, `tests/integration`.
- Runner chính: `src/main.ts` hoặc `src/Program.cs` / `src/Main.java`.

## Related Code Files
- Create: `tests/...`
- Create: `src/demo-runner.ts` (hoặc tương ứng theo ngôn ngữ)
- Create: `docs/testing/test-cases-and-results.md`

## Implementation Steps
1. Viết bộ kiểm thử tự động (Unit Tests) cho cả 6 mẫu thiết kế.
2. Viết chương trình Demo kịch bản hoàn chỉnh (Interactive Console / Demo flow).
3. Ghi lại kết quả chạy thực tế (logs / screenshots) đưa vào tài liệu báo cáo.
4. Viết mục đánh giá hiệu năng và tính bảo trì của hệ thống.

## Success Criteria
- [x] 100% test cases pass, không có lỗi tiềm ẩn.
- [x] Chương trình demo chạy mượt mà trong 1 lệnh duy nhất (ví dụ: `npm start` hoặc `dotnet run` hoặc `mvn exec`).
- [x] Đạt trọn vẹn điểm mục "Cài đặt, Thử nghiệm và Đánh giá kết quả" (1.5đ).
