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
  - `OrderCheckoutService` nhận vào các abstraction `PaymentProcessorFactory`, `IDiscountStrategy` và `IOrderEventPublisher` (constructor injection), chứ không bao giờ `new` trực tiếp `VNPayPaymentAdapter`, `ExternalVNPaySdk` hay `OrderEventPublisher` cụ thể.
  - `OrderEventPublisher` lần lượt chỉ phụ thuộc `IOrderObserver`, không biết observer cụ thể nào được `attach`.
  - Các SDK bên thứ ba thuộc tầng Infrastructure phụ thuộc ngược lại vào Interface của tầng Domain: Domain định nghĩa port `IVNPayGateway`/`IMoMoGateway`, còn `ExternalVNPaySdk`/`ExternalMoMoSdk` ở Infrastructure `implements` port đó. Adapter chỉ cầm port (tiêm qua constructor), nên **tầng Domain không import một dòng nào từ Infrastructure** — kiểm chứng bằng `grep -r infrastructure src/domain` (rỗng).

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

---

## III. CÂU HỎI VỀ TÍNH ĐÚNG ĐẮN NGHIỆP VỤ & XỬ LÝ NGOẠI LỆ

### Câu 13: Nếu khách thêm cùng một sản phẩm nhiều lần, hệ thống có bán vượt tồn kho không?
- **Trả lời:**
  - **Không.** Đây là lỗi kinh điển nếu validate theo từng lần gọi: với tồn kho 5, gọi `addItem(laptop, 3)` rồi `addItem(laptop, 3)` thì **mỗi lần đều hợp lệ** nhưng tổng 6 > 5.
  - `OrderBuilder.addItem()` xử lý bằng cách **tích lũy** số lượng cùng `product.id` đã có trong giỏ rồi mới kiểm tra:
    ```typescript
    const alreadyOrdered = this.items
      .filter(i => i.product.id === product.id)
      .reduce((sum, i) => sum + i.quantity, 0);
    if (!product.hasStock(alreadyOrdered + quantity)) { throw ... }
    ```
  - Thông điệp lỗi nêu rõ: còn bao nhiêu, đã đặt bao nhiêu, đang yêu cầu thêm bao nhiêu.
  - Có unit test hồi quy riêng cho tình huống này.

---

### Câu 14: Nếu người dùng bấm "Thanh toán" hai lần, hệ thống có thu tiền hai lần không?
- **Trả lời:**
  - **Không.** Điểm quan trọng là **thứ tự kiểm tra**. Nếu chỉ dựa vào `Order.markAsPaid()` để chặn thì đã muộn: `processPayment()` đã chạy xong, tiền đã bị trừ, lỗi mới được ném ra.
  - Vì vậy `OrderCheckoutService.checkout()` kiểm tra **ngay dòng đầu**, trước mọi thao tác tính giá và gọi cổng thanh toán:
    ```typescript
    if (order.status === OrderStatus.PAID) {
      throw new Error(`Đơn hàng [${order.orderId}] đã được thanh toán trước đó...`);
    }
    ```
  - Phòng thủ hai lớp: `Order.markAsPaid()` ở tầng Entity cũng tự chặn, bảo vệ cả khi có luồng khác gọi trực tiếp Entity.
  - Test kiểm chứng bằng cách so tồn kho trước/sau lần gọi thứ hai — kho **không** bị trừ thêm, chứng minh thanh toán thực sự không chạy lại.

---

### Câu 15: Nếu Observer trừ kho thất bại sau khi đã thu tiền thì sao? Tiền đã mất mà kho chưa trừ?
- **Trả lời:**
  - Đây là tình huống thật: giữa lúc dựng đơn và lúc thanh toán, kho có thể bị đơn khác rút hết (race condition).
  - `OrderEventPublisher.notify()` bọc mỗi Observer trong `try/catch` **độc lập** — Observer kho lỗi **không** chặn Email/SMS gửi đi (Fault-Tolerance).
  - Nhưng *chịu lỗi* không có nghĩa là *nuốt lỗi*. `CheckoutResult` trả thêm:
    ```typescript
    hasObserverFailure: boolean;
    failedObservers: string[];
    ```
  - Nhờ đó tầng trên biết chính xác Observer nào thất bại để xử lý bù thủ công. Demo CLI in cảnh báo đỏ ở **cả hai** chế độ (tự động và tương tác).
  - **Lưu ý trung thực:** hệ thống hiện *phát hiện và báo* sự cố, chưa tự động rollback. Giải pháp triệt để cho hệ thống thật là Saga Pattern hoặc Outbox Pattern với bù trừ (compensating transaction) — nằm ngoài phạm vi tiểu luận.

---

### Câu 16: Hệ thống có xử lý luồng huỷ đơn không? Observer Pattern thể hiện thế nào ở đó?
- **Trả lời:**
  - Có. `OrderCheckoutService.cancelOrder(order, reason)` phát sự kiện `ORDER_CANCELLED` qua **cùng một** `OrderEventPublisher`.
  - Đây là minh chứng mạnh nhất cho Observer Pattern: **cùng bộ Observer, cùng Publisher, nhưng phản ứng hoàn toàn khác** tùy `payload.event`:

    | Observer | `ORDER_PAID` | `ORDER_CANCELLED` |
    | :--- | :--- | :--- |
    | `InventoryUpdateObserver` | Trừ kho (`deductStock`) | **Hoàn** kho — chỉ cho đơn đã từng trừ |
    | `EmailNotificationObserver` | Gửi hóa đơn | Gửi thông báo huỷ + lý do |
    | `SmsNotificationObserver` | Gửi mã vận đơn | Gửi thông báo huỷ + hotline |

  - `cancelOrder()` **không biết** có bao nhiêu Observer đang lắng nghe. Muốn thêm hành vi khi huỷ (hoàn điểm thành viên, đẩy dữ liệu sang CRM) chỉ cần `attach` Observer mới.
  - **Chi tiết hoàn kho (tránh lỗi tồn kho ảo):** tồn kho chỉ bị trừ tại `ORDER_PAID`. `InventoryUpdateObserver` ghi nhớ các đơn đã trừ, nên khi `ORDER_CANCELLED` nó **chỉ hoàn kho cho đơn đã từng trừ**. Huỷ một đơn `PENDING` (chưa trừ kho) sẽ không cộng ảo tồn kho — nếu hoàn vô điều kiện thì kho sẽ tăng lên quá số thực có.
  - Ràng buộc nghiệp vụ: đơn đã `PAID` **không** huỷ trực tiếp được, phải qua quy trình hoàn tiền trước — chặn ở **cả** tầng service (`cancelOrder`) lẫn tầng entity (`markAsCancelled`). Đơn đã `CANCELLED` cũng không thể chuyển sang `PAID`.

---

### Câu 17: Thứ tự bọc Decorator có ảnh hưởng kết quả không?
- **Trả lời:**
  - **Có, và đó là chủ ý thiết kế.** `ShippingInsuranceDecorator` tính phí bảo hiểm bằng 1% giá trị của đối tượng nó bọc, tính ngay trong constructor.
  - Hệ thống bọc theo thứ tự `Insurance(GiftWrap(Base))`, nên bảo hiểm được tính trên **cả** tiền hàng và phí gói quà — đúng nghiệp vụ, vì bảo hiểm phải bù đắp toàn bộ giá trị gói hàng được giao, bao gồm bao bì cao cấp.
  - Nếu đảo thứ tự, chênh lệch nhỏ (đã đo: 300đ trên đơn 10 triệu). Đây là đặc tính cần nắm của Decorator khi các lớp bọc phụ thuộc giá trị bên trong, và đã được ghi vào mục nhược điểm trong tài liệu phân tích pattern.

---

### Câu 18: Độ tin cậy của mã nguồn được kiểm chứng ra sao?
- **Trả lời:**
  - **41/41 test pass**, chia 6 Test Suite: 3 suite theo nhóm pattern, 1 suite tầng Application, 1 suite ca biên Domain, 1 suite Integration.
  - **Bao phủ 100% cả 4 chỉ số**: statements, branches, functions, lines. Nghĩa là mọi nhánh `if/else` — kể cả nhánh lỗi — đều được chạy ít nhất một lần.
  - `tsc --noEmit` với `strict: true` cho 0 lỗi.
  - Test không chỉ kiểm đường thành công mà bao gồm cả: thanh toán thất bại, bán vượt kho, thu tiền trùng, huỷ đơn hai lần, Observer ném lỗi không phải `Error`, Observer trùng tên.
  - Ngoài ra có `npm run benchmark` đo overhead thực tế của từng pattern để đánh giá đánh đổi hiệu năng.
