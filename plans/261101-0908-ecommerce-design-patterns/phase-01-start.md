---
phase: 1
title: "Bối cảnh, Yêu cầu Nghiệp vụ & Thiết kế Use Case"
status: pending
priority: P1
effort: "0.5d"
dependencies: []
---

# Phase 1: Bối cảnh, Yêu cầu Nghiệp vụ & Thiết kế Use Case

## Overview
Xác định phạm vi đề tài "Hệ thống Quản lý Bán hàng và Thương mại Điện tử", phân tích yêu cầu chức năng (FR), yêu cầu phi chức năng (NFR), xây dựng sơ đồ Use Case tổng quát và đặc tả các ca sử dụng cốt lõi làm nền tảng cho việc áp dụng Design Patterns.

## Requirements
- Functional (FR):
  - Quản lý danh mục & sản phẩm (nhiều biến thể, thuộc tính).
  - Quản lý giỏ hàng & tạo đơn hàng phức tạp (thông tin người nhận, voucher, gói quà, bảo hiểm).
  - Tính toán giá tiền, chiết khấu thành viên và thuế/phí vận chuyển.
  - Tích hợp đa cổng thanh toán (COD, MoMo, VNPay, Thẻ quốc tế).
  - Xử lý trạng thái đơn hàng và gửi thông báo đa kênh (Email, SMS, App).
- Non-functional (NFR):
  - Tuân thủ thiết kế hướng đối tượng OOP và 5 nguyên lý SOLID.
  - Khả năng mở rộng (thêm cổng thanh toán mới, thuật toán tính giá mới không cần sửa mã cũ).
  - Cấu trúc module rõ ràng, phân tầng độc lập.

## Architecture & Use Cases
- Tác nhân (Actors): Khách hàng (Customer), Quản trị viên (Admin), Hệ thống bên ngoài (Cổng thanh toán, Cổng thông báo).
- Sơ đồ Use Case tổng quát:
  - UC-01: Tìm kiếm & Chọn sản phẩm
  - UC-02: Tạo & Tùy biến đơn hàng (Checkout)
  - UC-03: Áp dụng khuyến mãi & Tính phí vận chuyển
  - UC-04: Thanh toán đơn hàng qua cổng trực tuyến/COD
  - UC-05: Cập nhật & Theo dõi trạng thái đơn hàng

## Related Code Files
- Create: `docs/use-cases/specifications.md`
- Create: `docs/use-cases/use-case-diagram.puml`

## Implementation Steps
1. Khảo sát nghiệp vụ TMĐT, xác định phạm vi bài toán (Scope & User Personas).
2. Viết tài liệu đặc tả Functional Requirements (FR) và Non-Functional Requirements (NFR).
3. Thiết kế sơ đồ Use Case tổng quát bằng cú pháp PlantUML / Mermaid.
4. Viết kịch bản đặc tả chi tiết cho 2 Use Case cốt lõi: "Tạo đơn hàng tùy biến" và "Thanh toán & Xử lý đơn hàng".

## Success Criteria
- [x] Tài liệu đặc tả yêu cầu đầy đủ mục tiêu, phạm vi, đối tượng người dùng.
- [x] Sơ đồ Use Case chuẩn UML và có mô tả chi tiết ca sử dụng cốt lõi.
- [x] Đạt trọn vẹn điểm mục "Tổng quan về đề tài và bài toán thực tế" (0.5đ).

## Risk Assessment
- Rủi ro: Nghiệp vụ TMĐT quá rộng dẫn đến phân tán.
- Biện pháp khắc phục: Khóa phạm vi (Scope freeze) tập trung vào luồng cốt lõi: Product -> Order Creation (Builder) -> Price Calculation (Strategy/Decorator) -> Payment (Factory/Adapter) -> Notification (Observer).
