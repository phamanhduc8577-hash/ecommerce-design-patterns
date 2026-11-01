# KIẾN TRÚC HỆ THỐNG CLEAN ARCHITECTURE & MÔ HÌNH THỰC THỂ
## ĐỀ TÀI: HỆ THỐNG QUẢN LÝ BÁN HÀNG VÀ THƯƠNG MẠI ĐIỆN TỬ

---

## 1. TỔNG QUAN VỀ CLEAN ARCHITECTURE
Hệ thống áp dụng mô hình kiến trúc phân tầng độc lập (Clean Architecture / Onion Architecture) nhằm tách biệt triệt để mã nguồn logic nghiệp vụ (Business Rules) khỏi frameworks, cơ sở dữ liệu và các dịch vụ bên thứ ba.

### Sơ đồ 4 Tầng Phân Lập (The Clean Architecture Layers):

```
+---------------------------------------------------------------------------------+
| 4. PRESENTATION / CLI LAYER (Console Menu, Interactive Runner, Controllers)     |
|   +-------------------------------------------------------------------------+   |
|   | 3. INFRASTRUCTURE LAYER (Third-Party SDKs: VNPay, MoMo, Notification)   |   |
|   |   +-----------------------------------------------------------------+   |   |
|   |   | 2. APPLICATION LAYER (Use Cases, Order Processing Service, DTO) |   |   |
|   |   |   +---------------------------------------------------------+   |   |   |
|   |   |   | 1. DOMAIN LAYER (Entities, Design Patterns, Interfaces) |   |   |   |
|   |   |   |    - Entities: Product, Order, Customer, OrderItem      |   |   |   |
|   |   |   |    - Creational: Factory Method, Builder                |   |   |   |
|   |   |   |    - Structural: Adapter, Decorator                     |   |   |   |
|   |   |   |    - Behavioral: Strategy, Observer                     |   |   |   |
|   |   |   +---------------------------------------------------------+   |   |   |
|   |   +-----------------------------------------------------------------+   |   |
|   +-------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------+
```

### Nguyên tắc Phụ thuộc một chiều (The Dependency Rule):
- Mã nguồn tầng bên trong không bao giờ import hoặc phụ thuộc trực tiếp vào tầng bên ngoài.
- Tầng ngoài giao tiếp với tầng trong thông qua **Interfaces** (Abstractions) đặt tại tầng Domain/Application.
- Thỏa mãn hoàn toàn **Nguyên lý Đảo ngược Phụ thuộc (DIP)** trong SOLID.

---

## 2. VỊ TRÍ GẮN KẾT CỦA CÁC DESIGN PATTERNS TRONG HỆ THỐNG

| Nhóm Pattern | Tên Pattern | Vị trí Kiến trúc | Vấn đề Giải quyết |
| :--- | :--- | :--- | :--- |
| **Creational** | **Factory Method** | `domain/patterns/creational/factory` | Đóng gói logic khởi tạo các đối tượng cổng thanh toán mà không làm lộ chi tiết lớp cụ thể. |
| **Creational** | **Builder** | `domain/patterns/creational/builder` | Xây dựng đối tượng `Order` phức tạp từng bước một, tránh constructor quá tải. |
| **Structural** | **Adapter** | `domain/patterns/structural/adapter` | Chuyển đổi giao diện API không tương thích của SDK ngoài (VNPay, MoMo) về interface chuẩn của hệ thống. |
| **Structural** | **Decorator** | `domain/patterns/structural/decorator` | Mở rộng tính năng tính giá động (thêm gói quà, bảo hiểm hàng dễ vỡ) tại runtime mà không dùng kế thừa cứng. |
| **Behavioral** | **Strategy** | `domain/patterns/behavioral/strategy` | Hoán đổi linh hoạt thuật toán chiết khấu (Regular, VIP, Khuyến mãi) tại thời điểm thực thi. |
| **Behavioral** | **Observer** | `domain/patterns/behavioral/observer` | Tự động phát sự kiện đồng bộ khi đơn đổi trạng thái `PAID`: trừ kho, gửi mail hóa đơn, gửi SMS. |

---

## 3. MÔ HÌNH THỰC THỂ DỮ LIỆU (DOMAIN ENTITIES)
- `Customer`: Quản lý thông tin khách hàng và phân hạng thành viên (`CustomerTier`: Regular, Silver, Gold, VIP).
- `Product`: Quản lý thông tin sản phẩm, giá bán cơ sở và số lượng tồn kho.
- `OrderItem`: Sản phẩm và số lượng mua kèm đơn giá tại thời điểm đặt hàng.
- `Order`: Đối tượng trung tâm chứa thông tin khách hàng, các mục mua, địa chỉ giao hàng, chiết khấu và trạng thái đơn hàng.
- `PaymentTransaction`: Ghi nhận nhật ký giao dịch, mã giao dịch (TxnId) và trạng thái thành công.
