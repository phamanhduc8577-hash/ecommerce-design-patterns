# BÁO CÁO KẾT QUẢ KIỂM THỬ VÀ ĐÁNH GIÁ CHẤT LƯỢNG (QA REPORT)
**Học phần:** Mẫu thiết kế cho phần mềm (HK1 2026-2027)  
**Đề tài:** Hệ thống Quản lý Bán hàng và Thương mại Điện tử (E-Commerce)  
**Công cụ kiểm thử:** Jest v29.7.0, ts-jest, TypeScript v5.4.5  
**Ngày thực hiện:** 01/11/2026

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM THỬ (TEST SUMMARY)

| Chỉ số | Kết quả | Đánh giá |
| :--- | :---: | :--- |
| **Tổng số Test Suites** | **4 / 4 PASS** | 100% Suites thành công |
| **Tổng số Test Cases** | **16 / 16 PASS** | 100% Tests đạt chuẩn (0 failed, 0 skipped) |
| **Tỷ lệ bao phủ dòng lệnh (% Lines)** | **93.92%** | Vượt xa tiêu chuẩn 80% |
| **Tỷ lệ bao phủ hàm (% Funcs)** | **98.30%** | Gần như tuyệt đối |
| **Tỷ lệ câu lệnh (% Statements)** | **94.00%** | Cực kỳ cao và tin cậy |
| **Build Status** | **SUCCESS** | `tsc --noEmit` & `npm run build` không có lỗi |

---

## 2. PHÂN TÍCH CHI TIẾT THEO TỪNG NHÓM TEST

### 2.1. Creational Patterns Test Suite (`tests/unit/creational/`)
- **Builder Pattern (3 test cases):**
  - Xây dựng thành công đơn hàng hoàn chỉnh với các thuộc tính tùy chọn (`enableGiftWrap`, `enableInsurance`, `setSpecialNotes`).
  - Kiểm tra bắt lỗi (Validation): Không thể `build()` nếu thiếu khách hàng hoặc không có sản phẩm nào trong giỏ.
  - Kiểm tra kiểm soát tồn kho: Ném lỗi `không đủ tồn kho` nếu đặt số lượng vượt quá số lượng hàng có trong kho.
- **Factory Method Pattern (2 test cases):**
  - `CODPaymentFactory` khởi tạo đúng đối tượng `CODPaymentProcessor` và thực hiện thanh toán thành công.
  - `BankTransferPaymentFactory` khởi tạo đúng `BankTransferPaymentProcessor` và xác nhận giao dịch.

### 2.2. Structural Patterns Test Suite (`tests/unit/structural/`)
- **Adapter Pattern (2 test cases):**
  - `VNPayPaymentAdapter` chuyển đổi thành công giao diện và tham số từ hệ thống sang thư viện `ExternalVNPaySdk` (xử lý mã `00` thành công).
  - `MoMoPaymentAdapter` chuyển đổi thành công sang định dạng của `ExternalMoMoSdk` (mã `status === 0`).
- **Decorator Pattern (3 test cases):**
  - `BaseOrderPricing`: Tính đúng giá trị đơn hàng gốc.
  - `GiftWrapDecorator`: Bọc lớp 1 và cộng dồn chính xác 30,000đ.
  - Bọc lồng đa tầng (`GiftWrapDecorator` + `ShippingInsuranceDecorator`): Tính toán cộng dồn chính xác biểu phí động tại thời điểm runtime.

### 2.3. Behavioral Patterns Test Suite (`tests/unit/behavioral/`)
- **Strategy Pattern (3 test cases):**
  - `RegularCustomerDiscountStrategy`: Tính đúng chiết khấu 0% cho khách hàng thông thường.
  - `VipMemberDiscountStrategy`: Giảm đúng 15% tổng giá trị đơn hàng cho khách hàng VIP.
  - `HolidayTieredDiscountStrategy`: Giảm giá theo các bậc giá trị đơn hàng (Flash Sale).
- **Observer Pattern (2 test cases):**
  - Tất cả các Observers đăng ký (`InventoryUpdateObserver`, `EmailNotificationObserver`, `SmsNotificationObserver`) đều tự động nhận sự kiện `ORDER_PAID`, trừ kho thực tế và gửi thông báo tương ứng.
  - Kiểm tra hàm `detach()`: Hủy đăng ký một Observer thành công, Observer bị hủy không còn nhận sự kiện.

### 2.4. Integration Test Suite (`tests/integration/`)
- **Full Checkout Flow (1 test case):**
  - Kiểm thử liên kết toàn diện toàn bộ 6 Design Patterns trong một chu trình mua sắm hoàn chỉnh:
    Dựng đơn (Builder) $\rightarrow$ Tính phí bọc quà & bảo hiểm (Decorator) $\rightarrow$ Áp chiết khấu VIP (Strategy) $\rightarrow$ Khởi tạo & gọi cổng thanh toán VNPay (Factory + Adapter) $\rightarrow$ Tự động trừ kho & gửi Email/SMS (Observer).
  - Kết quả: Đơn hàng hoàn tất ở trạng thái `PAID`, giao dịch hợp lệ, tồn kho được cập nhật chính xác.

---

## 3. KẾT LUẬN & ĐÁNH GIÁ CHẤT LƯỢNG
- Hệ thống đạt mức độ tin cậy rất cao (**100% tests pass, độ bao phủ > 93%**).
- Chứng minh mã nguồn tuân thủ chặt chẽ các nguyên lý **SOLID**:
  - Không có hiện tượng phụ thuộc vòng (circular dependency).
  - Khả năng mở rộng (Extensibility) đã được kiểm chứng qua việc các Adapter, Strategy và Observer có thể tháo lắp độc lập mà không ảnh hưởng đến các thành phần khác.
