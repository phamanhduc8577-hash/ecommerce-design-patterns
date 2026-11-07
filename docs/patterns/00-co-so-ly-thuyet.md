# CƠ SỞ LÝ THUYẾT: DESIGN PATTERNS & NGUYÊN LÝ SOLID

Tài liệu này trình bày nền tảng lý thuyết cho toàn bộ đồ án: khái niệm Design Pattern, phân loại ba nhóm mẫu thiết kế theo GoF, và năm nguyên lý thiết kế SOLID. Mỗi khái niệm đều kèm ánh xạ cụ thể sang mã nguồn của hệ thống TMĐT để làm rõ *vì sao* áp dụng, không chỉ *áp dụng cái gì*.

---

## 1. DESIGN PATTERN LÀ GÌ?

**Design Pattern (Mẫu thiết kế)** là giải pháp tổng quát, có thể tái sử dụng, cho một lớp vấn đề thường gặp trong thiết kế phần mềm hướng đối tượng. Pattern không phải là đoạn code hoàn chỉnh để copy, mà là **khuôn mẫu mô tả cách tổ chức các lớp và đối tượng** để giải quyết vấn đề một cách linh hoạt và dễ bảo trì.

Khái niệm được hệ thống hóa trong cuốn *"Design Patterns: Elements of Reusable Object-Oriented Software"* (1994) của bốn tác giả Gamma, Helm, Johnson, Vlissides — thường gọi là **Gang of Four (GoF)**. Cuốn sách phân loại 23 pattern kinh điển thành ba nhóm theo mục đích sử dụng.

### Lợi ích khi áp dụng Design Pattern
- **Tái sử dụng kinh nghiệm:** dùng lại giải pháp đã được kiểm chứng thay vì phát minh lại.
- **Ngôn ngữ chung:** lập trình viên trao đổi "dùng Factory ở đây" nhanh và chính xác hơn mô tả dài dòng.
- **Giảm khớp nối (loose coupling):** phần lớn pattern tách phần *thay đổi* khỏi phần *ổn định*, giúp hệ thống dễ mở rộng.
- **Dễ bảo trì và kiểm thử:** mỗi trách nhiệm nằm ở một lớp riêng, test độc lập được.

---

## 2. PHÂN LOẠI BA NHÓM DESIGN PATTERN (GoF)

| Nhóm | Mục đích cốt lõi | Câu hỏi nhóm trả lời | Pattern tiêu biểu |
| :--- | :--- | :--- | :--- |
| **Creational** (Khởi tạo) | Kiểm soát cách **tạo ra** đối tượng | "Tạo đối tượng này như thế nào, ở đâu?" | Factory Method, Builder, Abstract Factory, Singleton, Prototype |
| **Structural** (Cấu trúc) | Kiểm soát cách **ghép nối** lớp và đối tượng thành cấu trúc lớn hơn | "Lắp ráp các thành phần lại ra sao?" | Adapter, Decorator, Facade, Composite, Proxy |
| **Behavioral** (Hành vi) | Kiểm soát cách các đối tượng **giao tiếp và phân chia trách nhiệm** | "Các đối tượng phối hợp, truyền trách nhiệm thế nào?" | Strategy, Observer, Command, State, Template Method |

### 2.1. Nhóm Creational — Mẫu khởi tạo
Tập trung vào **cơ chế khởi tạo đối tượng**, tách logic tạo đối tượng ra khỏi nơi sử dụng. Mục tiêu là làm cho hệ thống độc lập với *cách* các đối tượng được tạo ra, nhờ đó thêm loại đối tượng mới không phải sửa code cũ.

> **Trong đồ án:** `Factory Method` đóng gói việc tạo các bộ xử lý thanh toán; `Builder` dựng đối tượng `Order` phức tạp từng bước có kiểm soát.

### 2.2. Nhóm Structural — Mẫu cấu trúc
Tập trung vào **cách tổ chức lớp và đối tượng thành cấu trúc lớn hơn** mà vẫn linh hoạt và hiệu quả. Thường dùng kế thừa/kết hợp (composition) để tạo ra giao diện mới hoặc bổ sung chức năng.

> **Trong đồ án:** `Adapter` chuyển đổi giao diện SDK thanh toán bên thứ ba về chuẩn hệ thống; `Decorator` cộng dồn phí dịch vụ gia tăng tại runtime mà không bùng nổ lớp con.

### 2.3. Nhóm Behavioral — Mẫu hành vi
Tập trung vào **thuật toán và sự phân chia trách nhiệm giữa các đối tượng**, cũng như cách chúng giao tiếp. Giúp luồng điều khiển rõ ràng và dễ thay đổi hành vi.

> **Trong đồ án:** `Strategy` hoán đổi thuật toán chiết khấu tại runtime; `Observer` phát sự kiện trạng thái đơn hàng cho nhiều bộ lắng nghe độc lập.

---

## 3. SÁU DESIGN PATTERN ÁP DỤNG TRONG HỆ THỐNG

| # | Pattern | Nhóm | Vấn đề giải quyết trong hệ thống | Tài liệu chi tiết |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **Factory Method** | Creational | Tạo bộ xử lý thanh toán (COD, Bank, VNPay, MoMo) mà không hardcode `if-else` | `01-factory-method.md` |
| 2 | **Builder** | Creational | Dựng `Order` nhiều thuộc tính bắt buộc + tùy chọn, tránh telescoping constructor | `02-builder.md` |
| 3 | **Adapter** | Structural | Bọc SDK `ExternalVNPaySdk` / `ExternalMoMoSdk` khác chuẩn về `IPaymentProcessor` | `03-adapter.md` |
| 4 | **Decorator** | Structural | Cộng dồn phí gói quà + bảo hiểm động, tránh bùng nổ 2^N lớp con | `04-decorator.md` |
| 5 | **Strategy** | Behavioral | Hoán đổi chính sách chiết khấu (Thường / VIP / Flash Sale) tại runtime | `05-strategy.md` |
| 6 | **Observer** | Behavioral | Đơn `PAID`/`CANCELLED` tự kích hoạt trừ-hoàn kho + gửi email/SMS | `06-observer.md` |

Mỗi pattern thuộc đúng một nhóm, phủ đủ cả ba nhóm GoF với tối thiểu hai pattern mỗi nhóm theo yêu cầu đề bài.

---

## 4. NĂM NGUYÊN LÝ THIẾT KẾ SOLID

SOLID là năm nguyên lý thiết kế hướng đối tượng do Robert C. Martin (Uncle Bob) tổng hợp, nhằm tạo ra mã nguồn dễ hiểu, dễ mở rộng và dễ bảo trì. Chúng là tiêu chí đánh giá chất lượng của chính các Design Pattern được áp dụng.

### 4.1. SRP — Single Responsibility Principle (Đơn trách nhiệm)
> *Mỗi lớp chỉ nên có một lý do duy nhất để thay đổi.*

Một lớp chỉ đảm nhận một trách nhiệm. Khi một lớp ôm nhiều việc, thay đổi một việc dễ làm hỏng việc khác.

- **Ví dụ trong code:** `Order` chỉ giữ trạng thái đơn; `OrderBuilder` lo việc dựng + validate; `VNPayPaymentAdapter` chỉ lo chuyển đổi giao diện SDK; `InventoryUpdateObserver` chỉ lo cập nhật kho. Không lớp nào ôm hai việc.

### 4.2. OCP — Open/Closed Principle (Mở/Đóng)
> *Thực thể phần mềm nên mở cho việc mở rộng, nhưng đóng với việc sửa đổi.*

Thêm chức năng mới bằng cách thêm code mới, không sửa code đã chạy ổn định.

- **Ví dụ trong code:** thêm cổng thanh toán ZaloPay chỉ cần tạo `ZaloPayPaymentFactory` + Adapter mới; thêm chính sách giảm giá chỉ cần tạo `IDiscountStrategy` mới; thêm kênh thông báo chỉ cần tạo `IOrderObserver` mới. `OrderCheckoutService` **không đổi một dòng**.

### 4.3. LSP — Liskov Substitution Principle (Thay thế Liskov)
> *Đối tượng lớp con phải thay thế được cho lớp cha mà không phá vỡ tính đúng đắn của chương trình.*

Mọi lớp con/hiện thực interface phải tuân thủ đúng hợp đồng của lớp cha.

- **Ví dụ trong code:** mọi hiện thực `IPaymentProcessor` (`CODPaymentProcessor`, `VNPayPaymentAdapter`, `MoMoPaymentAdapter`...) dùng thay cho nhau trong `OrderCheckoutService` mà luồng checkout vẫn đúng. Mọi `IDiscountStrategy` cũng vậy.

### 4.4. ISP — Interface Segregation Principle (Phân tách Giao diện)
> *Không nên ép một lớp phụ thuộc vào các phương thức mà nó không dùng.*

Chia interface nhỏ, chuyên biệt thay vì một "God Interface" khổng lồ.

- **Ví dụ trong code:** mỗi interface chỉ chứa đúng phần client cần — `IPaymentProcessor` (chỉ `processPayment`), `IOrderPricing` (chỉ `calculateTotal`, `getBreakdown`), `IDiscountStrategy` (chỉ `calculateDiscount`), `IOrderObserver` (chỉ `update`). Không gộp thanh toán + tính giá + thông báo vào một interface.

### 4.5. DIP — Dependency Inversion Principle (Đảo ngược Phụ thuộc)
> *Module cấp cao không phụ thuộc module cấp thấp; cả hai phụ thuộc vào abstraction.*

Lập trình theo interface, không theo lớp cụ thể. Đây là nền tảng của Clean Architecture.

- **Ví dụ trong code:** `OrderCheckoutService` (cấp cao) nhận vào các abstraction `PaymentProcessorFactory`, `IDiscountStrategy`, `IOrderEventPublisher` qua constructor injection — không bao giờ `new` trực tiếp SDK hay lớp cụ thể. Nhờ đó tầng Domain độc lập hoàn toàn với tầng Infrastructure.

---

## 5. MỐI LIÊN HỆ GIỮA PATTERN VÀ SOLID

Design Pattern và SOLID không tách rời: phần lớn pattern tồn tại chính là để hiện thực một hay nhiều nguyên lý SOLID.

| Pattern | SOLID được thể hiện rõ nhất |
| :--- | :--- |
| Factory Method | OCP (thêm sản phẩm không sửa client), DIP (phụ thuộc abstraction) |
| Builder | SRP (tách dựng khỏi biểu diễn), OCP (thêm thuộc tính không phá call site) |
| Adapter | DIP (cô lập SDK ngoài), OCP (thêm đối tác mới không sửa core) |
| Decorator | OCP (thêm dịch vụ không sửa lớp cũ), SRP (mỗi phí một lớp) |
| Strategy | OCP (thêm thuật toán), SRP (mỗi thuật toán một lớp), DIP |
| Observer | OCP (thêm observer), DIP (publisher chỉ biết interface) |

> Chi tiết chứng minh đủ cả 5 SOLID cho từng pattern được trình bày trong các tài liệu `01` đến `06`.

---

## TÀI LIỆU THAM KHẢO

[1] E. Gamma, R. Helm, R. Johnson, and J. Vlissides, *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley, 1994.

[2] R. C. Martin, *Agile Software Development, Principles, Patterns, and Practices*. Prentice Hall, 2002.

[3] R. C. Martin, *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall, 2017.
