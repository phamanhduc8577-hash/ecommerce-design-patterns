# BÁO CÁO PHÂN TÍCH YÊU CẦU TIỂU LUẬN CUỐI KỲ
**Học phần:** Mẫu thiết kế cho phần mềm (HK1 2026-2027)  
**Mã lớp học phần:** 020100138402  
**Nguồn tài liệu:** `Mau-thiet-ke-PM_Thong bao Tieu luan.pdf`

---

## I. THÔNG TIN CHUNG & MỐC THỜI GIAN

| Hạng mục | Chi tiết |
| :--- | :--- |
| **Quy mô nhóm** | 1 - 5 sinh viên / nhóm. Mỗi nhóm thực hiện 1 dự án (ứng dụng). |
| **Thời gian làm bài** | 20/10/2026 đến hết **09/11/2026**. |
| **Hạn nộp sản phẩm** | **09/11/2026** qua link giảng viên cung cấp (Google Classroom / Forms). |
| **Lịch báo cáo** | **10/11/2026** (Nhóm 7, 2, 14, 11, 13, 9, 10, 5)<br>**12/11/2026** (Nhóm 6, 12, 4, 1, 3, 8, 15) |
| **Yêu cầu bắt buộc** | Có mặt đầy đủ, ký tên danh sách dự thi, demo ứng dụng và trả lời vấn đáp. |

---

## II. DANH SÁCH 5 DỰ ÁN ĐƯỢC CHỌN LỰA

1. **Dự án 1:** Hệ thống quản lý bán hàng và thương mại điện tử
2. **Dự án 2:** Hệ thống quản lý đặt phòng khách sạn
3. **Dự án 3:** Hệ thống quản lý đặt lịch khám bệnh
4. **Dự án 4:** Hệ thống quản lý khóa học trực tuyến
5. **Dự án 5:** Hệ thống quản lý thư viện số

---

## III. YÊU CẦU KỸ THUẬT CỐT LÕI (BẮT BUỘC)

### 1. Áp dụng Design Patterns (Tối thiểu 6 mẫu)
- **Creational Patterns:** Tối thiểu **02** mẫu (vd: Factory Method, Abstract Factory, Singleton, Builder, Prototype).
- **Structural Patterns:** Tối thiểu **02** mẫu (vd: Adapter, Facade, Decorator, Composite, Proxy).
- **Behavioral Patterns:** Tối thiểu **02** mẫu (vd: Strategy, Observer, Command, State, Template Method).

### 2. Tuân thủ 5 nguyên lý SOLID
Phải phân tích và chứng minh cụ thể trong mã nguồn & kiến trúc:
- **S (Single Responsibility Principle):** Đơn trách nhiệm.
- **O (Open/Closed Principle):** Mở rộng tính năng, đóng việc sửa mã có sẵn.
- **L (Liskov Substitution Principle):** Lớp con thay thế hoàn toàn lớp cha không gây lỗi logic.
- **I (Interface Segregation Principle):** Giao diện chia nhỏ theo nhu cầu client, không ép implement method dư thừa.
- **D (Dependency Inversion Principle):** Phụ thuộc abstraction (Interface/Abstract Class), không phụ thuộc trực tiếp concreate class (dùng DI/IoC).

### 3. Mô hình kiến trúc & Thiết kế UML
- **Kiến trúc tổng thể:** Áp dụng Clean Architecture, Mô hình 3 tầng (3-Tier/Layered) hoặc MVC.
- **Mô hình thực thể dữ liệu:** Sơ đồ ERD / Class thực thể quan hệ hợp lý.
- **UML chi tiết:** Với **mỗi Design Pattern** áp dụng:
  - Sơ đồ lớp UML (**Class Diagram**) làm rõ vai trò từng class, interface và mối quan hệ.
  - Sơ đồ tuần tự (**Sequence Diagram**) thể hiện luồng chạy qua pattern khi xử lý chức năng.
  - Bảng so sánh ưu/nhược điểm khi dùng pattern so với code thường (không dùng pattern).

### 4. Mã nguồn & Kiểm thử
- Source code hoàn chỉnh, cấu trúc code sạch (Clean Code), áp dụng đúng pattern vào bài toán thực tế (không viết code pattern giả lập/rời rạc).
- Ứng dụng chạy demo thực tế ổn định.
- Kịch bản kiểm thử (Test Cases / Unit Tests / Integration Tests / Demo scripts) chứng minh vai trò và hoạt động của các pattern.
- Đánh giá hiệu năng và khả năng bảo trì.

---

## IV. SẢN PHẨM BÀN GIAO (DEADLINE: 09/11/2026)

1. **File báo cáo:** Theo mẫu quy định, đặt tên file: `STT_Họ và tên_MSSV` (*Lưu ý: mỗi sinh viên 1 file riêng*).
2. **Đường link Repository:** GitHub / GitLab (public hoặc share quyền cho GV).
3. **Ứng dụng Demo:** Sẵn sàng chạy trực tiếp vào ngày vấn đáp (10 hoặc 12/11/2026).

---

## V. CƠ CẤU THANG ĐIỂM (TỔNG 10 ĐIỂM)

| STT | Tiêu chí | Điểm | Chi tiết yêu cầu |
| :---: | :--- | :---: | :--- |
| **1** | **Bố cục báo cáo** | **1.5** | - Đủ: Trang bìa, mục lục, DM hình ảnh, DM bảng biểu, DM viết tắt, TL tham khảo (0.5đ)<br>- Phân chia chương/mục logic, rõ ràng (0.5đ)<br>- Bảng phân công nhiệm vụ & tỷ lệ % đóng góp từng thành viên (0.5đ) |
| **2** | **Hình thức trình bày** | **1.5** | - Font, cỡ chữ, căn lề, giãn dòng chuẩn văn bản (0.5đ)<br>- Kỹ thuật gõ, chính tả, hình ảnh/sơ đồ/bảng có tiêu đề + chú thích rõ (0.5đ)<br>- Trích dẫn nguồn tài liệu tham khảo chuẩn APA / IEEE (0.5đ) |
| **3** | **Nội dung chính** | **7.0** | |
| 3.1 | *Tổng quan & Bài toán thực tế* | *0.5* | Bối cảnh, mục tiêu, phạm vi, đối tượng dùng. Phân tích yêu cầu chức năng (FR), phi chức năng (NFR), sơ đồ Use Case tổng quát + đặc tả Use Case cốt lõi. |
| 3.2 | *Cơ sở lý thuyết & Kiến trúc* | *1.5* | Trình bày lý thuyết Design Patterns & 5 nguyên lý SOLID. Thiết kế kiến trúc tổng thể (Clean Arch / 3-Tier / MVC) + mô hình dữ liệu thực thể. |
| 3.3 | *Phân tích & Thiết kế chi tiết DP* | *2.5* | Đủ 3 nhóm (tối thiểu 2x3=6 pattern). Class Diagram + Sequence Diagram cho từng pattern. Phân tích ưu/nhược & chứng minh tuân thủ SOLID. |
| 3.4 | *Cài đặt, Demo & Kiểm thử* | *1.5* | Code chạy thực tế, sạch, map đúng pattern. Kịch bản test/demo ổn định, đánh giá hiệu năng & khả năng bảo trì. |
| 3.5 | *Vấn đáp & Hiểu biết* | *1.0* | Trả lời độc lập, giải thích rành mạch vai trò pattern và thiết kế hệ thống. |
| **TỔNG** | | **10.0** | |

---

## VI. ĐỀ XUẤT CHIẾN LƯỢC BÀI TOÁN & BỘ 6 DESIGN PATTERNS MẪU

Khuyến nghị chọn **Dự án 1 (Hệ thống quản lý bán hàng & TMĐT)** hoặc **Dự án 2 (Hệ thống đặt phòng khách sạn)** vì các luồng nghiệp vụ rất điển hình, tự nhiên cho các Design Pattern:

### Bộ 6 Design Patterns gợi ý (Tối ưu điểm SOLID & Nghiệp vụ):
1. **Creational (Tối thiểu 2):**
   - **Factory Method / Abstract Factory:** Khởi tạo các phương thức thanh toán (VNPay, MoMo, COD, Stripe) hoặc các loại voucher/chiết khấu.
   - **Builder:** Xây dựng đối tượng Đơn hàng phức tạp (OrderBuilder gồm: thông tin khách, địa chỉ giao hàng, items, mã giảm giá, thuế, phí ship).
2. **Structural (Tối thiểu 2):**
   - **Adapter:** Tích hợp các cổng thanh toán bên thứ ba hoặc dịch vụ vận chuyển (GHTK, GHN) vào Interface chung của hệ thống.
   - **Decorator:** Áp dụng tính toán giá đơn hàng cộng dồn (Giá gốc -> thêm Gói bảo hành -> thêm Đóng gói quà -> giảm Voucher).
3. **Behavioral (Tối thiểu 2):**
   - **Strategy:** Thuật toán tính thuế/phí vận chuyển linh hoạt theo khu vực hoặc chiến lược chiết khấu theo hạng thành viên.
   - **Observer:** Gửi thông báo (Email, SMS, App Notification, Cập nhật tồn kho kho hàng) tự động khi trạng thái Đơn hàng thay đổi (`ORDER_PLACED`, `PAID`, `SHIPPED`).
