---
phase: 5
title: "Cài đặt Nhóm Behavioral Patterns (Strategy & Observer)"
status: pending
priority: P1
effort: "1.0d"
dependencies: ["phase-04-structural-patterns"]
---

# Phase 5: Cài đặt Nhóm Behavioral Patterns (Strategy & Observer)

## Overview
Phân tích, thiết kế UML và hiện thực mã nguồn cho 2 mẫu hành vi (Behavioral Patterns): **Strategy** để hoán đổi linh hoạt các chiến lược chiết khấu/khuyến mãi (Standard, Member Tier, Flash Sale) hoặc chiến lược tính phí vận chuyển và **Observer** để phát sự kiện thay đổi trạng thái đơn hàng (gửi thông báo Email, SMS, giảm số lượng tồn kho tự động).

## Requirements
1. **Strategy Pattern:**
   - Bài toán thực tế: Tính toán chiết khấu đơn hàng linh hoạt theo chính sách: Khách thường (NoDiscount), Khách hàng VIP (VipDiscountStrategy - giảm 15%), Khách hàng thân thiết (Silver/GoldStrategy), hoặc Khuyến mãi dịp lễ (HolidayPromotionStrategy - giảm theo bậc giá trị đơn).
   - Tách rời họ thuật toán tính chiết khấu vào các lớp riêng biệt có chung interface `IDiscountStrategy`, cho phép hoán đổi thuật toán linh hoạt tại runtime tùy thuộc vào loại khách hàng hoặc sự kiện.
   - Chứng minh SOLID: OCP (thêm chính sách giảm giá mới không làm ảnh hưởng lớp `Order` hay lớp tính toán khác), SRP, DIP.
2. **Observer Pattern:**
   - Bài toán thực tế: Khi đơn hàng được tạo hoặc chuyển trạng thái sang `PAID` (Đã thanh toán), một loạt các bên liên quan cần được thông báo:
     - `InventoryObserver`: Giảm trừ số lượng tồn kho thực tế.
     - `EmailNotificationObserver`: Gửi email xác nhận đơn hàng và hóa đơn điện tử cho khách.
     - `SmsNotificationObserver`: Gửi tin nhắn SMS mã đơn hàng cho khách.
     - `AnalyticsTrackingObserver`: Ghi nhận dữ liệu doanh thu vào hệ thống thống kê.
   - Định nghĩa mối quan hệ phụ thuộc một-nhiều (1-to-many) giữa các đối tượng để khi một đối tượng (`OrderSubject`) thay đổi trạng thái, tất cả các đối tượng phụ thuộc (`IOrderObserver`) của nó sẽ được thông báo và cập nhật tự động.
   - Chứng minh SOLID: OCP (thêm kênh thông báo mới như Zalo/Telegram chỉ cần tạo thêm Observer mới), SRP, DIP.

## Architecture & UML
- **Class Diagram:**
  - `OrderContext` chứa tham chiếu đến `IDiscountStrategy`. Các lớp `VipDiscount`, `RegularDiscount`, `HolidayDiscount`.
  - `OrderSubject` (hoặc `OrderEventManager`) quản lý danh sách `IOrderObserver`. Các lớp `InventoryServiceObserver`, `EmailServiceObserver`, `SmsServiceObserver`.
- **Sequence Diagram:** Luồng chọn Strategy tính toán giảm giá; Luồng kích hoạt `notifyObservers()` khi trạng thái đơn hàng chuyển đổi thành công.
- **Bảng so sánh:** So sánh cấu trúc dùng Strategy/Observer với việc viết chuỗi `switch-case` hoặc gọi hàm hardcode liên tục trong `OrderService`.

## Related Code Files
- Create: `src/domain/patterns/behavioral/strategy/...`
- Create: `src/domain/patterns/behavioral/observer/...`
- Create: `docs/patterns/05-strategy.md`
- Create: `docs/patterns/06-observer.md`

## Implementation Steps
1. Thiết kế interface `IDiscountStrategy` và các concrete strategies (`RegularCustomerStrategy`, `VipCustomerStrategy`, `FlashSaleStrategy`).
2. Thiết kế interface `IOrderObserver` và subject `OrderEventPublisher`.
3. Cài đặt các observers cụ thể (`InventoryObserver`, `EmailNotifierObserver`, `SmsNotifierObserver`).
4. Tích hợp Strategy và Observer vào luồng thanh toán và hoàn tất đơn hàng.
5. Vẽ Class Diagram và Sequence Diagram cho cả 2 pattern bằng PlantUML.
6. So sánh ưu/nhược điểm và phân tích tuân thủ các nguyên lý SOLID.

## Success Criteria
- [x] Chạy độc lập các kịch bản hoán đổi Strategy và phát thông báo qua Observer.
- [x] Đủ sơ đồ Class Diagram và Sequence Diagram cho từng pattern.
- [x] Báo cáo phân tích chuyên sâu tuân thủ SOLID (đặc biệt là OCP và DIP).
