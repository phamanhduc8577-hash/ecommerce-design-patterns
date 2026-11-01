# PHÂN TÍCH & THIẾT KẾ CHI TIẾT: BUILDER PATTERN
**Nhóm:** Creational Pattern (Mẫu khởi tạo)

---

## 1. BÀI TOÁN NGHIỆP VỤ THỰC TẾ
Đối tượng đơn hàng (`Order`) trong hệ thống Thương mại điện tử có cấu trúc phức tạp với nhiều thuộc tính bắt buộc và tùy chọn:
- Bắt buộc: Mã đơn, Khách hàng, Danh sách mặt hàng (`OrderItem[]`), Địa chỉ giao hàng.
- Tùy chọn: Gói quà trang trọng (`withGiftWrap`), Bảo hiểm vận chuyển (`withInsurance`), Ghi chú đặc biệt (`specialNotes`).

Nếu sử dụng Constructor thông thường:
```typescript
// CODE TRUYỀN THỐNG VI PHẠM (Telescoping Constructor):
new Order(
  id, customer, items, address, 
  true,  // giftWrap?
  false, // insurance?
  "Giao gio hanh chinh", // notes
  undefined, // paymentTxn?
  OrderStatus.PENDING
);
```
**Nhược điểm:**
- Dễ nhầm lẫn thứ tự các tham số kiểu boolean (`true`, `false`).
- Khi thêm hoặc bớt thuộc tính, Constructor phình to, phá vỡ tính tương thích của mã nguồn hiện có.
- Khó kiểm soát logic kiểm tra tính hợp lệ dữ liệu (Validation) trước khi tạo đối tượng hoàn chỉnh.

---

## 2. GIẢI PHÁP VỚI BUILDER PATTERN
Tách biệt quá trình xây dựng đối tượng `Order` phức tạp khỏi biểu diễn của nó thông qua lớp `OrderBuilder` cung cấp giao diện Fluent Interface:
- `setCustomer(customer: Customer): this`
- `addItem(product: Product, quantity: number): this`
- `setShippingAddress(address: ShippingAddress): this`
- `enableGiftWrap(enable?: boolean): this`
- `enableInsurance(enable?: boolean): this`
- `setSpecialNotes(notes: string): this`
- `build(): Order`

### Sơ đồ lớp (Class Diagram):
```
+--------------------+            creates           +------------------------+
|   OrderBuilder     | ---------------------------> |         Order          |
+--------------------+                              +------------------------+
| - customer         |                              | - orderId: string      |
| - items: Item[]    |                              | - customer: Customer   |
| - shippingAddress  |                              | - items: OrderItem[]   |
| - giftWrap: bool   |                              | - shippingAddress      |
| - insurance: bool  |                              | - withGiftWrap: bool   |
+--------------------+                              | - withInsurance: bool  |
| + setCustomer()    |                              | - status: OrderStatus  |
| + addItem()        |                              +------------------------+
| + enableGiftWrap() |                              | + markAsPaid(...)      |
| + build(): Order   |                              | + subtotal: number     |
+--------------------+                              +------------------------+
```

---

## 3. CHỨNG MINH TUÂN THỦ NGUYÊN LÝ SOLID
- **Single Responsibility Principle (SRP):** Trách nhiệm xây dựng và kiểm tra tính hợp lệ dữ liệu (validation) thuộc về `OrderBuilder`, trong khi `Order` chỉ chịu trách nhiệm duy trì trạng thái dữ liệu nội tại.
- **Open/Closed Principle (OCP):** Khi thêm thuộc tính tùy chọn mới (ví dụ: mã giới thiệu `referralCode`), chỉ cần thêm method tương ứng vào Builder mà không làm xáo trộn các nơi đang gọi `build()` trước đó.
