# BỘ CÂU HỎI VÀ HƯỚNG DẪN TRẢ LỜI VẤN ĐÁP TIỂU LUẬN MẪU THIẾT KẾ PHẦN MỀM
**Đề tài:** Hệ thống Quản lý Bán hàng và Thương mại Điện tử (E-Commerce)  
**Môn học:** Mẫu thiết kế cho phần mềm | HK1 2026-2027

---

## I. CÂU HỎI CHUNG VỀ KIẾN TRÚC & NGUYÊN LÝ SOLID

### Câu 1: Em hãy trình bày kiến trúc tổng thể của hệ thống và giải thích tại sao chọn Clean Architecture?
- **Trả lời:**
  - Hệ thống được tổ chức theo **Clean Architecture** gồm 4 tầng phân lập:
    1. `Domain Layer`: Chứa các thực thể cốt lõi (`Order`, `Customer`, `Product`) và các Interface định nghĩa Design Patterns. Tầng này độc lập 100%, không phụ thuộc vào bất kỳ thư viện hay framework bên ngoài nào.
    2. `Application Layer`: Chứa các Use Case / Services điều phối luồng nghiệp vụ (ví dụ `OrderCheckoutService`).
    3. `Infrastructure Layer`: Chứa triển khai cụ thể tích hợp các cổng bên thứ ba (`ExternalVNPaySdk`, `ExternalMoMoSdk`, dịch vụ Email/SMS).
    4. `Presentation Layer`: Giao diện tương tác điều khiển (Interactive CLI Console Runner).
  - **Lý do chọn:** Thỏa mãn **Dependency Inversion Principle (DIP)**: Tầng bên trong quy định hợp đồng (Interface), tầng bên ngoài phụ thuộc vào tầng bên trong. Nhờ đó, việc thay đổi hoặc nâng cấp cổng thanh toán, cơ sở dữ liệu không làm ảnh hưởng tới core business logic.

---

### Câu 2: Hệ thống của em chứng minh nguyên lý Single Responsibility Principle (SRP) như thế nào?
- **Trả lời:**
  - Mỗi class chỉ đảm nhận một trách nhiệm duy nhất và chỉ có 1 lý do duy nhất để thay đổi:
    - `Order` chỉ lưu trữ trạng thái đơn hàng và các mục hàng, **không** tự tính toán biểu phí dịch vụ hay tự kết nối cổng thanh toán.
    - `OrderPricingDecorator` chỉ chịu trách nhiệm tính toán cộng dồn phí dịch vụ gia tăng.
    - `VNPayPaymentAdapter` chỉ chịu trách nhiệm chuyển đổi giao diện giữa hệ thống và SDK của VNPay.
    - `InventoryUpdateObserver` chỉ chịu trách nhiệm trừ kho khi nhận sự kiện `ORDER_PAID`.

---

### Câu 3: Hệ thống của em chứng minh nguyên lý Open/Closed Principle (OCP) như thế nào?
- **Trả lời:**
  - **Mở rộng (Open for extension):** Khi muốn thêm cổng thanh toán mới (ví dụ ZaloPay, PayPal), chúng ta chỉ cần tạo thêm class `ZaloPayPaymentAdapter` kế thừa `IPaymentProcessor` và `ZaloPayPaymentFactory` kế thừa `PaymentProcessorFactory`.
  - **Đóng việc sửa đổi (Closed for modification):** Hoàn toàn **không cần sửa một dòng code nào** trong `OrderCheckoutService`, `Order`, hay các cổng thanh toán cũ đã chạy ổn định.
  - Tương tự với việc thêm chính sách giảm giá mới (`IDiscountStrategy`) hoặc kênh thông báo mới (`IOrderObserver`).

---

### Câu 4: Nguyên lý Liskov Substitution Principle (LSP) được thể hiện ở đâu?
- **Trả lời:**
  - Mọi lớp con triển khai `IPaymentProcessor` (`CODPaymentProcessor`, `BankTransferPaymentProcessor`, `VNPayPaymentAdapter`, `MoMoPaymentAdapter`) đều có thể thay thế hoàn hảo cho nhau trong `OrderCheckoutService` mà không làm thay đổi tính đúng đắn của chương trình.
  - Mọi Decorator (`GiftWrapDecorator`, `ShippingInsuranceDecorator`) đều kế thừa `OrderPricingDecorator` và tuân thủ hoàn toàn hợp đồng của `IOrderPricing`.

---

### Câu 5: Nguyên lý Interface Segregation Principle (ISP) được áp dụng ra sao?
- **Trả lời:**
  - Các Interface được phân tách nhỏ, rõ ràng theo đúng nhu cầu sử dụng của Client:
    - `IPaymentProcessor`: Chỉ chứa method `processPayment()`.
    - `IOrderPricing`: Chỉ chứa `calculateTotal()` và `getBreakdown()`.
    - `IDiscountStrategy`: Chỉ chứa `calculateDiscount()`.
    - `IOrderObserver`: Chỉ chứa `update()`.
  - Không tạo một "God Interface" gộp chung cả thanh toán, tính giá và thông báo, tránh ép buộc các class phải implements các hàm không dùng tới.

---

### Câu 6: Nguyên lý Dependency Inversion Principle (DIP) được chứng minh thế nào?
- **Trả lời:**
  - `OrderCheckoutService` phụ thuộc vào Interface trừu tượng `PaymentProcessorFactory`, `IDiscountStrategy`, và `IOrderObserver`, chứ không bao giờ `new` trực tiếp `VNPayPaymentAdapter` hay `ExternalVNPaySdk`.
  - Các SDK bên thứ ba thuộc tầng Infrastructure phụ thuộc ngược lại vào Interface của tầng Domain thông qua Adapter.

---

## II. CÂU HỎI CHI TIẾT VỀ 6 DESIGN PATTERNS

### Câu 7: Tại sao em dùng Builder Pattern cho Order mà không dùng Constructor thông thường?
- **Trả lời:**
  - Đối tượng `Order` trong TMĐT có cấu trúc rất phức tạp với nhiều thuộc tính tùy chọn: người nhận, địa chỉ, danh sách items, gói quà, bảo hiểm, ghi chú...
  - Nếu dùng Constructor thông thường sẽ rơi vào anti-pattern **Telescoping Constructor** (constructor có quá nhiều tham số, dễ truyền nhầm thứ tự `giftWrap` với `insurance`, nhiều tham số `null`).
  - Dùng **Builder Pattern** giúp:
    1. Cú pháp fluent, dễ đọc, dễ hiểu (`.setCustomer().addItem().enableGiftWrap().build()`).
    2. Kiểm soát tính hợp lệ (Validation) tại phương thức `.build()`: Bắt buộc phải có khách hàng, phải có ít nhất 1 sản phẩm, và kiểm tra tồn kho trước khi tạo đối tượng `Order`.

---

### Câu 8: Phân biệt Factory Method với Abstract Factory và giải thích ứng dụng trong đề tài?
- **Trả lời:**
  - **Factory Method:** Định nghĩa một method trừu tượng trong class cha (`createPaymentProcessor()`) để các class con quyết định đối tượng cụ thể nào sẽ được khởi tạo.
  - Trong đề tài, hệ thống dùng `PaymentProcessorFactory` làm Creator trừu tượng, các lớp con `VNPayPaymentFactory`, `MoMoPaymentFactory`, `CODPaymentFactory` chịu trách nhiệm tạo ra đúng bộ xử lý thanh toán tương ứng. Client chỉ tương tác qua Creator trừu tượng, giúp che giấu toàn bộ logic khởi tạo phức tạp.

---

### Câu 9: Tại sao dùng Adapter Pattern cho VNPay và MoMo?
- **Trả lời:**
  - Các đơn vị thanh toán bên thứ ba có SDK hoặc chuẩn API độc lập:
    - VNPay đòi hỏi truyền tham số `vnp_TmnCode`, `vnp_Amount` (nhân 100), `vnp_TxnRef`.
    - MoMo đòi hỏi `partnerCode`, `orderId`, `amount`.
  - Hệ thống nội bộ của chúng ta yêu cầu chuẩn hàm thống nhất là `processPayment(amount: number, orderId: string)`.
  - **Adapter Pattern** đóng vai trò là "cầu nối phiên dịch", chuyển đổi dữ liệu và phương thức gọi từ chuẩn nội bộ sang chuẩn của SDK đối tác mà không cần can thiệp hoặc sửa đổi mã nguồn SDK của đối tác.

---

### Câu 10: Tại sao dùng Decorator Pattern để tính phí gói quà và bảo hiểm thay vì dùng Kế thừa (Inheritance)?
- **Trả lời:**
  - Nếu dùng kế thừa đơn thuần:
    - Khi có 2 tính năng tùy chọn (Gói quà, Bảo hiểm), ta sẽ phải tạo 4 lớp con: `OrderWithGift`, `OrderWithInsurance`, `OrderWithGiftAndInsurance`, `StandardOrder`.
    - Khi có 5 tính năng (thêm Giao hỏa tốc, Khung tranh gỗ, Thiệp VIP), số lớp con sẽ bùng nổ theo cấp số nhân $2^5 = 32$ lớp (Hiện tượng **Class Explosion**).
  - Dùng **Decorator Pattern** cho phép chúng ta bọc (wrap) động các dịch vụ vào nhau tại thời điểm runtime theo nhu cầu của từng khách hàng:
    `new ShippingInsuranceDecorator(new GiftWrapDecorator(new BaseOrderPricing(order)))`.

---

### Câu 11: Sự khác biệt giữa Strategy Pattern và State Pattern là gì? Tại sao ở đây chọn Strategy?
- **Trả lời:**
  - **Strategy Pattern:** Tập trung vào việc hoán đổi các thuật toán khác nhau cho cùng một hành động (ở đây là tính chiết khấu giảm giá). Client thường là người chủ động lựa chọn hoặc cài đặt Strategy.
  - **State Pattern:** Đối tượng tự động thay đổi hành vi dựa trên trạng thái nội tại bên trong của nó và các trạng thái tự chuyển đổi lẫn nhau.
  - Đề tài chọn **Strategy** vì khách hàng có các chính sách chiết khấu độc lập (`RegularCustomerDiscountStrategy`, `VipMemberDiscountStrategy`, `HolidayTieredDiscountStrategy`) được lựa chọn dựa trên phân hạng thành viên.

---

### Câu 12: Observer Pattern giúp giải quyết vấn đề gì khi hoàn tất đơn hàng?
- **Trả lời:**
  - Khi đơn hàng thanh toán thành công, có rất nhiều công việc phụ thuộc cần thực hiện: trừ số lượng tồn kho, gửi email hóa đơn, gửi SMS cho khách.
  - Nếu viết theo cách thông thường, `OrderCheckoutService` sẽ phải gọi trực tiếp `InventoryService`, `EmailService`, `SmsService` -> Dẫn đến khớp nối chặt (Tight Coupling).
  - Áp dụng **Observer Pattern**, `OrderCheckoutService` chỉ cần phát sự kiện `ORDER_PAID`. Các Subscriber (`InventoryUpdateObserver`, `EmailNotificationObserver`, `SmsNotificationObserver`) tự động lắng nghe và xử lý. Khi cần bổ sung thêm kênh thông báo Zalo hoặc Push Notification, ta chỉ việc tạo Observer mới và `attach()` vào Publisher mà không sửa `OrderCheckoutService`.
