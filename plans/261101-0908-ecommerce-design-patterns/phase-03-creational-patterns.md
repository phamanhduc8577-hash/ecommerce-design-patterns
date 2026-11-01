---
phase: 3
title: "Cài đặt Nhóm Creational Patterns (Factory Method & Builder)"
status: pending
priority: P1
effort: "1.0d"
dependencies: ["phase-02-domain-and-architecture"]
---

# Phase 3: Cài đặt Nhóm Creational Patterns (Factory Method & Builder)

## Overview
Phân tích, thiết kế UML và hiện thực mã nguồn cho 2 mẫu khởi tạo (Creational Patterns): **Factory Method** (hoặc Abstract Factory) để tạo các dịch vụ cổng thanh toán và **Builder** để xây dựng các đối tượng Đơn hàng (`Order`) phức tạp với nhiều thuộc tính tùy chọn.

## Requirements
1. **Factory Method (hoặc Abstract Factory):**
   - Bài toán thực tế: Khởi tạo các phương thức thanh toán khác nhau (`VNPayPayment`, `MoMoPayment`, `CODPayment`, `CreditCardPayment`).
   - Client chỉ cần yêu cầu loại thanh toán, Factory chịu trách nhiệm khởi tạo đối tượng thích hợp mà không để lộ logic khởi tạo.
   - Chứng minh SOLID: Tuân thủ OCP (thêm cổng thanh toán mới chỉ cần thêm ConcreteCreator mới, không sửa mã cũ) và DIP (phụ thuộc vào `IPaymentService` trừu tượng).
2. **Builder Pattern:**
   - Bài toán thực tế: Xây dựng đơn hàng `Order` phức tạp gồm: mã đơn, thông tin khách hàng, danh sách `OrderItem`, địa chỉ nhận hàng, phương thức vận chuyển, mã voucher, tùy chọn gói quà, ghi chú đặc biệt.
   - Tách biệt quá trình xây dựng đối tượng phức tạp khỏi biểu diễn của nó, cho phép cùng một tiến trình xây dựng có thể tạo ra các biểu diễn khác nhau.
   - Tránh anti-pattern Telescoping Constructor (constructor quá nhiều tham số).

## Architecture & UML
- **Class Diagram:**
  - `PaymentFactory` và các `ConcretePaymentFactory` tạo `IPaymentService`.
  - `OrderBuilder` với các hàm `setCustomer()`, `addItem()`, `setShippingAddress()`, `applyDiscount()`, `withGiftWrap()`, `build()`.
- **Sequence Diagram:** Luồng client gọi Factory tạo cổng thanh toán và gọi Builder tạo đối tượng đơn hàng.
- **Bảng so sánh:** So sánh cách khởi tạo trực tiếp (new cụ thể, constructor 10 tham số) với việc dùng Factory & Builder.

## Related Code Files
- Create: `src/domain/patterns/creational/factory/...`
- Create: `src/domain/patterns/creational/builder/...`
- Create: `docs/patterns/01-factory-method.md`
- Create: `docs/patterns/02-builder.md`

## Implementation Steps
1. Viết Interface trừu tượng `IPaymentGateway` và các lớp triển khai cụ thể (`VNPayGateway`, `MoMoGateway`, `CODPaymentGateway`).
2. Viết `PaymentFactory` áp dụng Factory Method pattern.
3. Thiết kế lớp `Order` với private constructor và lớp con hoặc lớp ngoài `OrderBuilder` cung cấp fluent interface.
4. Vẽ Class Diagram và Sequence Diagram cho cả 2 pattern bằng PlantUML.
5. Viết tài liệu phân tích ưu/nhược điểm và đánh giá sự tuân thủ nguyên lý SOLID (OCP, DIP, SRP).

## Success Criteria
- [x] Code Factory Method & Builder chạy ổn định, không lỗi.
- [x] Đủ sơ đồ Class Diagram và Sequence Diagram cho từng pattern.
- [x] Có phân tích so sánh chi tiết và đối chiếu 5 nguyên lý SOLID.
