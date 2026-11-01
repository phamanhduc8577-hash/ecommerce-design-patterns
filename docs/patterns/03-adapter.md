# PHÂN TÍCH & THIẾT KẾ CHI TIẾT: ADAPTER PATTERN
**Nhóm:** Structural Pattern (Mẫu cấu trúc)

---

## 1. BÀI TOÁN NGHIỆP VỤ THỰC TẾ
Hệ thống TMĐT cần tích hợp các cổng thanh toán số từ nhiều đối tác bên thứ ba (VNPay, MoMo). Mỗi đối tác cung cấp một bộ SDK hoặc định dạng API riêng biệt không đồng nhất:
- `ExternalVNPaySdk`: Yêu cầu hàm `doPaymentGateway({ vnp_TmnCode, vnp_Amount, vnp_TxnRef })` với số tiền phải nhân 100 và trả về kết quả qua thuộc tính `code === '00'`.
- `ExternalMoMoSdk`: Yêu cầu hàm `executeMoMoTransaction({ partnerCode, orderId, amount })` và trả về kết quả qua `status === 0`.

Trong khi đó, tầng nghiệp vụ của hệ thống đòi hỏi một chuẩn giao tiếp thống nhất:
```typescript
interface IPaymentProcessor {
  processPayment(amount: number, orderId: string): Promise<PaymentResult>;
}
```

Nếu gọi trực tiếp SDK trong luồng xử lý:
- Tầng nghiệp vụ bị phụ thuộc chặt chẽ (tight coupling) vào cấu trúc dữ liệu của các SDK bên thứ ba.
- Mỗi lần đối tác cập nhật phiên bản SDK, mã nguồn nghiệp vụ chính bị ảnh hưởng.

---

## 2. GIẢI PHÁP VỚI ADAPTER PATTERN
Sử dụng các lớp Adapter (`VNPayPaymentAdapter`, `MoMoPaymentAdapter`) để "phiên dịch" giao diện của thư viện bên ngoài về chuẩn `IPaymentProcessor`.

### Sơ đồ lớp (Class Diagram):
```
    +--------------------------------+
    |         <<interface>>          |
    |       IPaymentProcessor        |
    +--------------------------------+
    | + paymentMethodName: string    |
    | + processPayment(...): Promise |
    +--------------------------------+
                   ^
                   | implements
    +--------------------------------+          calls           +------------------------+
    |      VNPayPaymentAdapter       | -----------------------> |    ExternalVNPaySdk    |
    |                                |                          |       (Adaptee)        |
    +--------------------------------+                          +------------------------+
    | - vnpaySdk: ExternalVNPaySdk   |                          | + doPaymentGateway(..) |
    | + processPayment(amount, id)   |                          +------------------------+
    +--------------------------------+
```

---

## 3. CHỨNG MINH TUÂN THỦ NGUYÊN LÝ SOLID
- **Open/Closed Principle (OCP):** Khi tích hợp thêm cổng thanh toán ZaloPay hoặc Stripe, chỉ cần viết thêm một Adapter mới. Toàn bộ mã nguồn cũ được giữ nguyên.
- **Dependency Inversion Principle (DIP):** Hệ thống chỉ phụ thuộc vào Interface trừu tượng `IPaymentProcessor`, các thư viện bên thứ ba được cô lập hoàn toàn ở tầng ngoài (Infrastructure).
- **Single Responsibility Principle (SRP):** Adapter chỉ làm một nhiệm vụ duy nhất: chuyển đổi định dạng dữ liệu và gọi phương thức của Adaptee.
