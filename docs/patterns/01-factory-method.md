# PHÂN TÍCH & THIẾT KẾ CHI TIẾT: FACTORY METHOD PATTERN
**Nhóm:** Creational Pattern (Mẫu khởi tạo)

---

## 1. BÀI TOÁN NGHIỆP VỤ THỰC TẾ
Trong hệ thống TMĐT, việc thanh toán hỗ trợ nhiều phương thức:
- Thanh toán khi nhận hàng (COD).
- Chuyển khoản trực tiếp (Bank Transfer).
- Cổng thanh toán trực tuyến qua thẻ / ví điện tử (VNPay, MoMo).

Nếu hệ thống khởi tạo trực tiếp bằng toán tử `new` trong service xử lý đơn:
```typescript
// CODE TRUYỀN THỐNG VI PHẠM OCP:
if (method === 'COD') {
  processor = new CODPaymentProcessor();
} else if (method === 'BANK') {
  processor = new BankTransferProcessor();
} else if (method === 'VNPAY') {
  processor = new VNPayPaymentAdapter();
}
```
**Nhược điểm:**
- Khớp nối chặt (Tight Coupling) giữa tầng nghiệp vụ với các lớp thanh toán cụ thể.
- Vi phạm **Open/Closed Principle (OCP)**: Mỗi khi thêm cổng thanh toán mới (ví dụ ZaloPay), lập trình viên buộc phải can thiệp sửa đổi các lệnh `if-else` trong mã nguồn đang chạy ổn định.

---

## 2. GIẢI PHÁP VỚI FACTORY METHOD PATTERN
Định nghĩa phương thức nhà máy trừu tượng `createPaymentProcessor(): IPaymentProcessor` trong lớp cha `PaymentProcessorFactory`. Các lớp con cụ thể (`CODPaymentFactory`, `BankTransferPaymentFactory`, `VNPayPaymentFactory`) sẽ chịu trách nhiệm khởi tạo đối tượng tương ứng.

### Sơ đồ lớp (Class Diagram):
```
       +------------------------------------+
       |  <<abstract>>                      |
       |  PaymentProcessorFactory           |
       +------------------------------------+
       | + createPaymentProcessor()         |
       | + executePayment(amount, orderId)  |
       +------------------------------------+
                     ^
         +-----------+-----------+
         |                       |
+-------------------+   +-----------------------+
| CODPaymentFactory |   | VNPayPaymentFactory   |
+-------------------+   +-----------------------+
| + createPayment.. |   | + createPayment..     |
+-------------------+   +-----------------------+
         |                       | (creates)
         v                       v
+-------------------+   +-----------------------+
| CODPaymentProc..  |   | VNPayPaymentAdapter   |
+-------------------+   +-----------------------+
         \                       /
          \                     /
           v                   v
      +-----------------------------+
      |      <<interface>>          |
      |    IPaymentProcessor        |
      +-----------------------------+
      | + paymentMethodName: string |
      | + processPayment(...): Promise|
      +-----------------------------+
```

---

## 3. CHỨNG MINH TUÂN THỦ NGUYÊN LÝ SOLID
- **Single Responsibility Principle (SRP):** Trách nhiệm khởi tạo đối tượng thanh toán được tách rời khỏi lớp thực thi thanh toán và lớp dịch vụ đơn hàng.
- **Open/Closed Principle (OCP):** Khi thêm cổng ZaloPay, chỉ cần tạo `ZaloPayPaymentProcessor` và `ZaloPayPaymentFactory`. Không sửa một dòng code cũ nào trong `OrderCheckoutService`.
- **Dependency Inversion Principle (DIP):** Client (`OrderCheckoutService`) chỉ tương tác thông qua `PaymentProcessorFactory` và `IPaymentProcessor`, không phụ thuộc vào lớp cụ thể nào.
