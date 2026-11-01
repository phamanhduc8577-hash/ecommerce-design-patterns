# PHÂN TÍCH & THIẾT KẾ CHI TIẾT: DECORATOR PATTERN
**Nhóm:** Structural Pattern (Mẫu cấu trúc)

---

## 1. BÀI TOÁN NGHIỆP VỤ THỰC TẾ
Đơn hàng cơ bản (`BaseOrderPricing`) có thể được bổ sung thêm nhiều dịch vụ giá trị gia tăng tùy theo yêu cầu của khách hàng:
- Dịch vụ đóng gói quà cao cấp và thiệp chúc mừng (`GiftWrapDecorator`: +30,000đ).
- Dịch vụ bảo hiểm hàng hóa vận chuyển (`ShippingInsuranceDecorator`: +1% giá trị đơn hàng).
- Trong tương lai: Dịch vụ giao hàng hỏa tốc trong 2h, dịch vụ lắp đặt tận nơi.

### Nguy cơ "Bùng nổ lớp con" (Class Explosion) nếu dùng Kế thừa:
Nếu cố gắng giải quyết bài toán này bằng cơ chế kế thừa đơn thuần (Subclassing):
- $N = 2$ dịch vụ $\rightarrow 2^2 = 4$ lớp con: `BaseOrder`, `OrderWithGift`, `OrderWithInsurance`, `OrderWithGiftAndInsurance`.
- $N = 5$ dịch vụ $\rightarrow 2^5 = 32$ lớp con kết hợp! Cấu trúc này không thể duy trì và cực kỳ dễ sinh lỗi.

---

## 2. GIẢI PHÁP VỚI DECORATOR PATTERN
Định nghĩa Interface chung `IOrderPricing`:
- `BaseOrderPricing` đóng vai trò là Concrete Component tính tiền hàng ban đầu.
- `OrderPricingDecorator` là lớp trừu tượng duy trì tham chiếu đến đối tượng `IOrderPricing` được bọc.
- Các lớp con `GiftWrapDecorator` và `ShippingInsuranceDecorator` bọc lấy component và cộng dồn chi phí động tại thời điểm runtime:
```typescript
let pricing: IOrderPricing = new BaseOrderPricing(order);
if (order.withGiftWrap) pricing = new GiftWrapDecorator(pricing);
if (order.withInsurance) pricing = new ShippingInsuranceDecorator(pricing);
const total = pricing.calculateTotal();
```

### Sơ đồ lớp (Class Diagram):
```
                       +-----------------------------+
                       |        <<interface>>        |
                       |        IOrderPricing        |
                       +-----------------------------+
                       | + calculateTotal(): number  |
                       | + getBreakdown(): Item[]    |
                       +-----------------------------+
                                      ^
                                      |
                 +--------------------+--------------------+
                 |                                         |
    +-------------------------+             +-----------------------------+
    |    BaseOrderPricing     |             |    OrderPricingDecorator    |
    +-------------------------+             +-----------------------------+
    | - order: Order          |             | # wrappee: IOrderPricing    |
    | + calculateTotal()      |             +-----------------------------+
    | + getBreakdown()        |                            ^
    +-------------------------+                            |
                                            +--------------+--------------+
                                            |                             |
                             +----------------------+      +-----------------------------+
                             |  GiftWrapDecorator   |      |  ShippingInsuranceDecorator |
                             +----------------------+      +-----------------------------+
                             | - giftWrapFee: number|      | - insuranceFee: number      |
                             | + calculateTotal()   |      | + calculateTotal()          |
                             +----------------------+      +-----------------------------+
```

---

## 3. CHỨNG MINH TUÂN THỦ NGUYÊN LÝ SOLID
- **Single Responsibility Principle (SRP):** Tách nhỏ việc tính giá cơ bản và từng loại biểu phí gia tăng vào các lớp độc lập.
- **Open/Closed Principle (OCP):** Khi thêm dịch vụ mới (ví dụ giao hàng hỏa tốc `ExpressDeliveryDecorator`), chỉ cần tạo thêm class Decorator mới mà không cần chạm vào `BaseOrderPricing` hay các Decorator khác.
