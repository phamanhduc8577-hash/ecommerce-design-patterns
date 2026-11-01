# PHÂN TÍCH & THIẾT KẾ CHI TIẾT: STRATEGY PATTERN
**Nhóm:** Behavioral Pattern (Mẫu hành vi)

---

## 1. BÀI TOÁN NGHIỆP VỤ THỰC TẾ
Doanh nghiệp TMĐT cần áp dụng nhiều chính sách chiết khấu khác nhau:
- Khách hàng tiêu chuẩn: Không giảm giá (`RegularCustomerDiscountStrategy`).
- Khách hàng VIP: Giảm 15% tổng hóa đơn (`VipMemberDiscountStrategy`).
- Sự kiện khuyến mãi Flash Sale: Giảm theo bậc giá trị đơn (`HolidayTieredDiscountStrategy`).

### Nhược điểm nếu dùng chuỗi điều kiện `switch-case` thông thường:
```typescript
// CODE TRUYỀN THỐNG VI PHẠM OCP:
function calculateDiscount(type: string, amount: number) {
  switch (type) {
    case 'VIP': return amount * 0.15;
    case 'HOLIDAY': return amount >= 5000000 ? 600000 : 200000;
    default: return 0;
  }
}
```
**Hậu quả:**
- Hàm tính toán ngày càng phình to (God Method).
- Thay đổi một chính sách có thể làm ảnh hưởng hoặc làm sai lệch chính sách khác.
- Không thể hoán đổi thuật toán linh hoạt hoặc nạp động từ cấu hình bên ngoài.

---

## 2. GIẢI PHÁP VỚI STRATEGY PATTERN
Định nghĩa Interface `IDiscountStrategy`:
- Tách rời từng thuật toán chiết khấu vào các lớp cụ thể độc lập.
- `OrderCheckoutService` đóng vai trò là Context, nhận vào một thể hiện của `IDiscountStrategy` và thực thi tính toán mà không quan tâm bên trong tính như thế nào.

### Sơ đồ lớp (Class Diagram):
```
+-----------------------------------+               +--------------------------------------+
|       OrderCheckoutService        | ------------> |            <<interface>>             |
|             (Context)             |               |          IDiscountStrategy           |
+-----------------------------------+               +--------------------------------------+
| + checkout(order, strategy, fac)  |               | + strategyName: string               |
+-----------------------------------+               | + calculateDiscount(...): Result     |
                                                    +--------------------------------------+
                                                                       ^
                                                                       |
                             +-------------------------+---------------+-------------------------+
                             |                         |                                         |
               +---------------------------+ +------------------------+             +-------------------------------+
               | RegularCustomerDiscount.. | | VipMemberDiscountStrat |             | HolidayTieredDiscountStrategy |
               +---------------------------+ +------------------------+             +-------------------------------+
               | + calculateDiscount()     | | + calculateDiscount()  |             | + calculateDiscount()         |
               +---------------------------+ +------------------------+             +-------------------------------+
```

---

## 3. CHỨNG MINH TUÂN THỦ NGUYÊN LÝ SOLID
- **Open/Closed Principle (OCP):** Khi phòng Marketing tung ra chương trình "Black Friday 50%", ta chỉ cần tạo class `BlackFridayDiscountStrategy`. Toàn bộ mã nguồn cốt lõi trong `OrderCheckoutService` không thay đổi.
- **Single Responsibility Principle (SRP):** Mỗi thuật toán chiết khấu nằm trọn vẹn trong một file duy nhất, độc lập và dễ dàng kiểm thử đơn vị.
