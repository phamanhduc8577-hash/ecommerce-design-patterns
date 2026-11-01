# TÀI LIỆU ĐẶC TẢ YÊU CẦU NGHIỆP VỤ & USE CASE
## ĐỀ TÀI: HỆ THỐNG QUẢN LÝ BÁN HÀNG VÀ THƯƠNG MẠI ĐIỆN TỬ (E-COMMERCE)

---

## 1. BỐI CẢNH & KHẢO SÁT BÀI TOÁN THỰC TẾ
Thương mại điện tử (E-commerce) đòi hỏi hệ thống phần mềm phải xử lý các luồng nghiệp vụ phức tạp, biến động liên tục:
- Đa dạng các dòng sản phẩm, thuộc tính và biến thể.
- Quy trình tạo và cấu hình đơn hàng linh hoạt (nhiều sản phẩm, voucher, gói bảo hiểm, đóng gói quà).
- Tích hợp nhiều đối tác thanh toán số (MoMo, VNPay, COD, Thẻ tín dụng) với giao thức API không đồng nhất.
- Chính sách chiết khấu linh hoạt thay đổi theo từng loại khách hàng (Thường, VIP, Doanh nghiệp) hoặc theo các dịp lễ (Flash Sale, Black Friday).
- Hệ thống cần phản ứng tự động theo thời gian thực (real-time notification) khi đơn hàng thay đổi trạng thái: thông báo cho khách hàng qua Email/SMS, cập nhật trừ số lượng kho hàng, và gửi dữ liệu sang hệ thống phân tích.

Mục tiêu của đề tài là áp dụng kiến trúc **Clean Architecture** và tối thiểu **6 Design Patterns** (2 Creational, 2 Structural, 2 Behavioral) tuân thủ triệt để **5 nguyên lý thiết kế SOLID**, giúp hệ thống mở rộng dễ dàng, giảm độ phụ thuộc (loose coupling) và dễ bảo trì.

---

## 2. PHẠM VI & ĐỐI TƯỢNG NGƯỜI DÙNG
- **Phạm vi bài toán:** Quản lý danh mục sản phẩm, cấu hình đơn hàng phức tạp, tính toán biểu phí dịch vụ, xử lý thanh toán đa cổng và thông báo sự kiện trạng thái đơn hàng.
- **Đối tượng người dùng:**
  - **Khách hàng (Customer):** Xem sản phẩm, tùy biến đơn hàng, chọn hình thức thanh toán, nhận thông báo.
  - **Quản trị viên / Nhân viên (Admin/Staff):** Quản lý trạng thái đơn hàng, theo dõi tồn kho.
  - **Hệ thống liên kết bên ngoài (External Services):** Cổng thanh toán (VNPay, MoMo), Dịch vụ gửi tin (Email, SMS).

---

## 3. YÊU CẦU HỆ THỐNG

### 3.1. Yêu cầu chức năng (Functional Requirements - FR)
- **FR-01: Quản lý danh mục & sản phẩm:** Duyệt danh sách sản phẩm, kiểm tra số lượng tồn kho.
- **FR-02: Khởi tạo và Tùy biến Đơn hàng (Custom Order Creation):** Cho phép khách hàng thêm các mặt hàng, chọn địa chỉ giao hàng, áp dụng mã voucher, yêu cầu đóng gói quà tặng và bảo hiểm vận chuyển.
- **FR-03: Tính toán giá & Chiết khấu (Pricing & Discount Calculation):** Tính tổng tiền hàng, tự động áp dụng chiết khấu theo hạng khách hàng (Regular: 0%, VIP: 15%, Holiday Promo), cộng dồn chi phí dịch vụ giá trị gia tăng (Gói quà, Bảo hiểm).
- **FR-04: Xử lý Thanh toán đa cổng (Multi-Gateway Payment Processing):** Hỗ trợ thanh toán qua VNPay, MoMo, COD. Cho phép cắm thêm cổng mới (ZaloPay, PayPal) trong tương lai mà không sửa đổi mã nguồn xử lý thanh toán cốt lõi.
- **FR-05: Cập nhật trạng thái & Phát sự kiện tự động (Order Lifecycle & Event Dispatching):** Khi đơn hàng chuyển trạng thái (`PENDING` -> `PAID` -> `CANCELLED`), hệ thống tự động kích hoạt các hành động: trừ tồn kho, gửi email hóa đơn, gửi SMS xác nhận.

### 3.2. Yêu cầu phi chức năng (Non-Functional Requirements - NFR)
- **NFR-01 (Tính mở rộng - Extensibility):** Áp dụng nguyên lý OCP (Open/Closed Principle) - thêm mới cổng thanh toán, chính sách giảm giá, hoặc kênh thông báo chỉ bằng cách tạo class mới.
- **NFR-02 (Tính độc lập - Loose Coupling):** Áp dụng nguyên lý DIP (Dependency Inversion Principle) - các tầng nghiệp vụ cấp cao phụ thuộc vào Abstraction/Interface, không phụ thuộc cụ thể vào third-party SDK.
- **NFR-03 (Tính sạch sẽ & Dễ bảo trì - Clean Code & Maintainability):** Phân chia tầng rõ ràng theo Clean Architecture, không có hiện tượng Spaghetti Code hoặc God Object.
- **NFR-04 (Tính tin cậy & Kiểm thử được - Testability):** 100% các thành phần nghiệp vụ và Design Patterns đều có thể viết Unit Test độc lập.

---

## 4. SƠ ĐỒ USE CASE TỔNG QUÁT

```
+-------------------------------------------------------------------------------+
|                       HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ                             |
|                                                                               |
|   (Khách hàng)                                                                |
|       |                                                                       |
|       +-----> [UC-01: Xem & Chọn sản phẩm]                                    |
|       |                                                                       |
|       +-----> [UC-02: Tùy biến & Xây dựng đơn hàng] (Builder Pattern)         |
|       |           |                                                           |
|       |           +--<<include>>--> [UC-03: Áp dụng chiết khấu & Dịch vụ]     |
|       |                                (Strategy & Decorator Pattern)         |
|       |                                                                       |
|       +-----> [UC-04: Thanh toán đơn hàng]                                    |
|       |           (Factory Method & Adapter Pattern)                          |
|       |               |                                                       |
|       |               +-------------> (Cổng thanh toán MoMo / VNPay)          |
|       |                                                                       |
|       +-----> [UC-05: Nhận thông báo & Cập nhật kho]                          |
|                   (Observer Pattern)                                          |
|                       |                                                       |
|                       +-------------> (Dịch vụ Email / SMS / Kho hàng)        |
+-------------------------------------------------------------------------------+
```

---

## 5. ĐẶC TẢ CHI TIẾT CÁC CA SỬ DỤNG CỐT LÕI

### 5.1. Ca sử dụng UC-02: Tùy biến & Xây dựng đơn hàng (Custom Order Creation)
- **Tác nhân:** Khách hàng.
- **Tiền điều kiện:** Khách hàng đã chọn ít nhất 01 sản phẩm hợp lệ trong hệ thống.
- **Luồng sự kiện chính (Main Flow):**
  1. Khách hàng bắt đầu tiến trình Checkout.
  2. Hệ thống khởi tạo đối tượng `OrderBuilder`.
  3. Khách hàng nhập thông tin người nhận (Họ tên, SĐT, Địa chỉ).
  4. Khách hàng chọn thêm các dịch vụ bổ sung: Gói quà tặng (`withGiftWrap`), Bảo hiểm vận chuyển (`withInsurance`).
  5. Khách hàng nhập mã giảm giá / hạng khách hàng.
  6. Khách hàng xác nhận và hệ thống gọi `OrderBuilder.build()` để tạo thực thể `Order` hoàn chỉnh có tính toàn vẹn dữ liệu.
- **Hậu điều kiện:** Đơn hàng được tạo ở trạng thái `PENDING`, sẵn sàng cho bước thanh toán.

### 5.2. Ca sử dụng UC-04: Thanh toán đơn hàng đa cổng
- **Tác nhân:** Khách hàng, Hệ thống thanh toán bên thứ ba (VNPay, MoMo).
- **Tiền điều kiện:** Đơn hàng đã được tạo (`PENDING`) với tổng số tiền hợp lệ.
- **Luồng sự kiện chính (Main Flow):**
  1. Khách hàng chọn phương thức thanh toán (`VNPAY`, `MOMO`, `COD`).
  2. Hệ thống ủy quyền cho `PaymentFactory` để trả về thể hiện tương ứng của `IPaymentProcessor`.
  3. Nếu là VNPay/MoMo, hệ thống thông qua `VNPayAdapter` / `MoMoAdapter` để đồng bộ giao tiếp sang thư viện bên ngoài.
  4. Thực hiện giao dịch thanh toán.
  5. Nhận kết quả thành công, cập nhật mã giao dịch `TransactionId`.
- **Hậu điều kiện:** Trạng thái đơn hàng chuyển thành `PAID`.

### 5.3. Ca sử dụng UC-05: Xử lý sự kiện sau thanh toán
- **Tác nhân:** Hệ thống (tự động kích hoạt qua `Observer Pattern`).
- **Tiền điều kiện:** Đơn hàng chuyển trạng thái thành `PAID`.
- **Luồng sự kiện chính (Main Flow):**
  1. `Order` phát tín hiệu sự kiện `ORDER_PAID`.
  2. `InventoryObserver` nhận sự kiện, tiến hành trừ số lượng tồn kho của các sản phẩm có trong đơn hàng.
  3. `EmailNotificationObserver` nhận sự kiện, gửi email thông báo chi tiết đơn hàng đến địa chỉ email của khách.
  4. `SmsNotificationObserver` nhận sự kiện, gửi SMS chứa mã đơn hàng và lời cảm ơn.
- **Hậu điều kiện:** Dữ liệu kho được cập nhật, khách hàng nhận đủ thông báo đa kênh.
