# HỆ THỐNG QUẢN LÝ BÁN HÀNG VÀ THƯƠNG MẠI ĐIỆN TỬ
## TIỂU LUẬN CUỐI KỲ: MẪU THIẾT KẾ CHO PHẦN MỀM (HK1 2026-2027)
**Lớp học phần:** 020100138402

---

## 1. GIỚI THIỆU
Dự án cài đặt hoàn chỉnh một hệ thống Thương mại điện tử áp dụng kiến trúc **Clean Architecture**, hiện thực hóa chuẩn mực **6 Design Patterns** (2 Creational, 2 Structural, 2 Behavioral) và chứng minh sự tuân thủ nghiêm ngặt **5 nguyên lý thiết kế SOLID**.

### 6 Design Patterns áp dụng:
1. **Creational Patterns:**
   - `Factory Method`: Đóng gói logic khởi tạo các đối tượng xử lý thanh toán đa cổng (`CODPaymentFactory`, `BankTransferPaymentFactory`, `VNPayPaymentFactory`, `MoMoPaymentFactory`).
   - `Builder`: Xây dựng thực thể đơn hàng `Order` phức tạp từng bước một qua `OrderBuilder`, kiểm soát tính hợp lệ dữ liệu và loại bỏ Constructor quá tải (Telescoping Constructor).
2. **Structural Patterns:**
   - `Adapter`: Chuyển đổi giao diện SDK không tương thích của đối tác bên thứ ba (`ExternalVNPaySdk`, `ExternalMoMoSdk`) về chuẩn chung `IPaymentProcessor` của hệ thống.
   - `Decorator`: Tính toán chi phí dịch vụ giá trị gia tăng lũy tiến động tại runtime (`GiftWrapDecorator`, `ShippingInsuranceDecorator`) mà không gây hiện tượng bùng nổ lớp con (Class Explosion).
3. **Behavioral Patterns:**
   - `Strategy`: Hoán đổi linh hoạt họ thuật toán chiết khấu đơn hàng (`RegularCustomerDiscountStrategy`, `VipMemberDiscountStrategy`, `HolidayTieredDiscountStrategy`).
   - `Observer`: Định nghĩa cơ chế xuất bản - đăng ký sự kiện (Publish-Subscribe). Khi đơn hàng chuyển trạng thái sang `PAID`, `OrderEventPublisher` tự động kích hoạt:
     - `InventoryUpdateObserver`: Tự động trừ số lượng tồn kho sản phẩm.
     - `EmailNotificationObserver`: Gửi hóa đơn điện tử cho khách qua email.
     - `SmsNotificationObserver`: Gửi SMS mã vận đơn cho khách hàng.

---

## 2. HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### Bước 1: Cài đặt thư viện phụ thuộc
```bash
npm install
```

### Bước 2: Chạy chương trình Demo tương tác có màu sắc
```bash
npm start
```
*(Chương trình hỗ trợ 2 chế độ: Quick Scenario tự động hoặc Interactive Q&A Session chọn linh hoạt khách hàng, sản phẩm, chiến lược chiết khấu, cổng thanh toán và quan sát phản ứng hệ thống trực tiếp).*

### Bước 3: Chạy bộ kiểm thử tự động (Unit Test & Integration Test)
```bash
npm test
# hoặc đo tỷ lệ bao phủ code:
npm run test:coverage
```

### Bước 4: Chạy Benchmark đo lường hiệu năng & đánh giá bảo trì
```bash
npm run benchmark
```

---

## 3. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
├── docs/                     # Toàn bộ tài liệu thiết kế chi tiết
│   ├── architecture/         # Kiến trúc Clean Architecture & sơ đồ Domain
│   ├── defense-qa/           # 12 câu hỏi vấn đáp điểm 10 kèm đáp án
│   ├── patterns/             # 01 -> 06: Chi tiết từng Design Pattern & SOLID
│   ├── testing/              # Báo cáo kết quả kiểm thử QA
│   └── use-cases/            # Đặc tả ca sử dụng & sơ đồ Use Case
├── plans/                    # Kế hoạch thực hiện 7 Phase & Báo cáo tiểu luận
│   ├── 261101-0908-*/        # Nhật ký chi tiết từng Phase
│   └── reports/              # Báo cáo chính thức (.docx và .md)
├── scripts/                  # Các script tiện ích độc lập
│   ├── benchmark.ts          # Đo lường hiệu năng (> 1 triệu ops/s)
│   └── generate-report-docx.ts # Script xuất tự động file Word báo cáo
├── src/                      # Mã nguồn chính (Clean Architecture)
│   ├── application/          # Lớp Application (OrderCheckoutService)
│   ├── domain/               # Lớp Domain (Entities & 6 Design Patterns)
│   ├── infrastructure/       # Lớp Infrastructure (Third-party SDKs)
│   └── demo-runner.ts        # Interactive CLI Runner phục vụ ngày vấn đáp
└── tests/                    # Toàn bộ Test Suites (Jest)
    ├── integration/          # Integration Test luồng Checkout toàn diện
    └── unit/                 # Unit Test theo từng nhóm (Creational, Structural, Behavioral)
```

---

## 4. TÀI LIỆU BÁO CÁO & VẤN ĐÁP
- **File Báo cáo Word chính thức (.docx):** `plans/reports/BAO_CAO_TIEU_LUAN_MAU_THIET_KE_PM.docx` (đã căn lề, mục lục, bảng phân công nhiệm vụ, chuẩn APA/IEEE).
- **Bộ 12 Câu hỏi - Trả lời Vấn đáp bảo vệ:** `docs/defense-qa/cau-hoi-van-dap.md`.
- **Đặc tả Use Case & Sơ đồ PlantUML:** `docs/use-cases/`.
- **Tài liệu Kiến trúc Clean Architecture:** `docs/architecture/clean-architecture.md`.
- **Báo cáo Kiểm thử QA chi tiết:** `docs/testing/test-cases-and-results.md`.
