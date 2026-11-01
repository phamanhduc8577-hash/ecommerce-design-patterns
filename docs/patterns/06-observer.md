# PHÂN TÍCH & THIẾT KẾ CHI TIẾT: OBSERVER PATTERN
**Nhóm:** Behavioral Pattern (Mẫu hành vi)

---

## 1. BÀI TOÁN NGHIỆP VỤ THỰC TẾ
Khi đơn hàng chuyển trạng thái sang `PAID` (Đã thanh toán thành công), một loạt các hành động phụ thuộc cần được kích hoạt:
1. `InventoryUpdateObserver`: Trừ trực tiếp số lượng tồn kho của các sản phẩm đã bán.
2. `EmailNotificationObserver`: Gửi email xác nhận kèm hóa đơn chi tiết cho khách hàng.
3. `SmsNotificationObserver`: Gửi tin nhắn SMS mã đơn hàng đến số điện thoại người nhận.
4. Trong tương lai: Đẩy thông tin sang hệ thống CRM, tích điểm thành viên, hoặc gửi tin nhắn Zalo ZNS.

### Nhược điểm nếu gọi trực tiếp (Hardcoded method calls):
```typescript
// CODE TRUYỀN THỐNG VI PHẠM (Tight Coupling):
async function onOrderPaid(order: Order) {
  await inventoryService.deductStock(order);
  await emailService.sendReceipt(order);
  await smsService.sendTrackingCode(order);
  // Cứ thêm dịch vụ là lại sửa hàm này!
}
```
**Hậu quả:**
- Lớp xử lý đơn hàng bị phụ thuộc trực tiếp vào hàng loạt dịch vụ ngoại vi.
- Nếu một dịch vụ bị lỗi hoặc muốn tạm dừng (ví dụ tạm ngừng gửi SMS để tiết kiệm chi phí), phải sửa trực tiếp mã nguồn.

---

## 2. GIẢI PHÁP VỚI OBSERVER PATTERN
Xây dựng cơ chế xuất bản - đăng ký sự kiện (Publish-Subscribe):
- `OrderEventPublisher` (Subject) quản lý danh sách `IOrderObserver` thông qua các hàm `attach()`, `detach()`, `notify()`.
- Các dịch vụ ngoại vi triển khai `IOrderObserver` và đăng ký lắng nghe sự kiện từ Publisher.
- Khi đơn hàng hoàn tất, Publisher gọi `notify()` và truyền `OrderEventPayload`.

### Sơ đồ lớp (Class Diagram):
```
+--------------------------------+                  +-------------------------------+
|      OrderEventPublisher       | <>-------------> |         <<interface>>         |
|           (Subject)            |                  |         IOrderObserver        |
+--------------------------------+                  +-------------------------------+
| - observers: IOrderObserver[]  |                  | + observerName: string        |
| + attach(observer)             |                  | + update(payload)             |
| + detach(observerName)         |                  +-------------------------------+
| + notify(payload): Promise     |                                  ^
+--------------------------------+                                  |
                                        +---------------------------+---------------------------+
                                        |                           |                           |
                          +---------------------------+ +-----------------------+ +-------------------------+
                          |  InventoryUpdateObserver  | | EmailNotificationObs  | |  SmsNotificationObserver|
                          +---------------------------+ +-----------------------+ +-------------------------+
                          | + update(payload)         | | + update(payload)     | | + update(payload)       |
                          +---------------------------+ +-----------------------+ +-------------------------+
```

---

## 3. CHỨNG MINH TUÂN THỦ NGUYÊN LÝ SOLID
- **Open/Closed Principle (OCP):** Khi thêm kênh thông báo Zalo hoặc Telegram, chỉ cần tạo `ZaloNotificationObserver` và `attach()` vào Publisher tại file bootstrap/config. Không sửa một dòng nào trong `OrderCheckoutService`.
- **Dependency Inversion Principle (DIP):** Publisher chỉ phụ thuộc vào Interface `IOrderObserver`, không biết và không phụ thuộc vào các lớp cụ thể.
