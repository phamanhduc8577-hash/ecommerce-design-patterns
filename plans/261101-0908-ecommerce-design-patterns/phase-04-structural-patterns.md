---
phase: 4
title: "Cài đặt Nhóm Structural Patterns (Adapter & Decorator)"
status: pending
priority: P1
effort: "1.0d"
dependencies: ["phase-03-creational-patterns"]
---

# Phase 4: Cài đặt Nhóm Structural Patterns (Adapter & Decorator)

## Overview
Phân tích, thiết kế UML và hiện thực mã nguồn cho 2 mẫu cấu trúc (Structural Patterns): **Adapter** để chuẩn hóa giao tiếp với các thư viện/SDK bên thứ ba (SDK MoMo, VNPay với interface không tương thích) và **Decorator** để tính toán chi phí đơn hàng động (giá gốc cộng dồn gói bảo hành, gói quà, bảo hiểm hàng dễ vỡ).

## Requirements
1. **Adapter Pattern:**
   - Bài toán thực tế: Các hệ thống thanh toán bên thứ ba (ví dụ `ExternalVNPaySDK`, `ExternalMoMoSDK`) có API và tên hàm riêng biệt (`executeVNPayTransaction()`, `payWithMoMoQr()`), không khớp với interface chuẩn `IPaymentProcessor.processPayment(amount)` của hệ thống.
   - Sử dụng Adapter để chuyển đổi giao diện của lớp thứ ba thành giao diện mà client mong đợi, giúp các lớp không tương thích có thể làm việc cùng nhau mà không cần sửa mã nguồn của thư viện bên ngoài.
   - Chứng minh SOLID: OCP (thêm SDK ngân hàng mới chỉ viết thêm Adapter mới), SRP (tách biệt logic chuyển đổi giao diện), DIP.
2. **Decorator Pattern:**
   - Bài toán thực tế: Tính toán chi phí đơn hàng và dịch vụ đi kèm. Đơn hàng cơ bản (`BasicOrderPrice`) có thể được trang trí động thêm các dịch vụ: gói quà trang trọng (`GiftWrapDecorator`), bảo hiểm vận chuyển hàng giá trị cao (`ShippingInsuranceDecorator`), dịch vụ giao hàng hỏa tốc trong 2 giờ (`ExpressDeliveryDecorator`).
   - Mở rộng chức năng của đối tượng tại thời điểm runtime một cách linh hoạt mà không cần kế thừa hàng chục lớp con kết hợp (Class Explosion).
   - Chứng minh SOLID: OCP (mở rộng dịch vụ tính phí bằng cách thêm Decorator mới, không sửa code tính giá cơ bản), SRP.

## Architecture & UML
- **Class Diagram:**
  - `ITargetPayment` <- `VNPayAdapter` -> `Adaptee: ThirdPartyVNPayApi`.
  - `IOrderPricing` component, `BaseOrderPrice`, `OrderPricingDecorator`, `GiftWrapDecorator`, `InsuranceDecorator`.
- **Sequence Diagram:** Luồng gọi qua Adapter để gọi API bên thứ ba; luồng gọi đệ quy lồng nhau qua các tầng Decorator để tính tổng tiền cuối cùng.
- **Bảng so sánh:** So sánh với cách viết `if-else` lồng nhau hoặc tạo subclass kế thừa phức tạp.

## Related Code Files
- Create: `src/domain/patterns/structural/adapter/...`
- Create: `src/domain/patterns/structural/decorator/...`
- Create: `docs/patterns/03-adapter.md`
- Create: `docs/patterns/04-decorator.md`

## Implementation Steps
1. Giả lập lớp API bên thứ ba (`ThirdPartyMoMoApi`, `ThirdPartyVNPayApi`).
2. Hiện thực `MoMoPaymentAdapter` và `VNPayPaymentAdapter` kế thừa `IPaymentProcessor`.
3. Thiết kế interface `IOrderPricing` và lớp cơ sở `StandardOrderPricing`.
4. Hiện thực lớp trừu tượng `OrderPricingDecorator` và các concrete decorator (`GiftWrapDecorator`, `InsuranceDecorator`).
5. Vẽ Class Diagram và Sequence Diagram cho cả Adapter và Decorator bằng PlantUML.
6. So sánh ưu/nhược điểm và phân tích tuân thủ SOLID (OCP, LSP, ISP).

## Success Criteria
- [x] Mã nguồn Adapter và Decorator chạy độc lập, minh họa rõ việc biến đổi giao diện và cộng dồn chi phí linh hoạt.
- [x] Đủ sơ đồ Class Diagram và Sequence Diagram cho từng pattern.
- [x] Tài liệu phân tích rõ lý do không dùng đa kế thừa mà dùng Decorator.
