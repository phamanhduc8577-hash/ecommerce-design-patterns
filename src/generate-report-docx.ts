import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber
} from 'docx';

async function generateReportDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch = 1440 twips (~2.54cm)
              bottom: 1440,
              left: 1700,   // ~3cm lề trái
              right: 1134   // ~2cm lề phải
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: 'TIỂU LUẬN CUỐI KỲ: MẪU THIẾT KẾ CHO PHẦN MỀM - HK1 2026-2027',
                alignment: AlignmentType.RIGHT,
                style: 'HeaderStyle'
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun('Báo cáo Tiểu luận - Trang '),
                  new TextRun({ children: [PageNumber.CURRENT] })
                ]
              })
            ]
          })
        },
        children: [
          // TRANG BÌA
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN / BÁCH KHOA\n',
                bold: true,
                size: 28,
                font: 'Times New Roman'
              }),
              new TextRun({
                text: 'KHOA CÔNG NGHỆ THÔNG TIN\nBỘ MÔN CÔNG NGHỆ PHẦN MỀM\n',
                bold: true,
                size: 26,
                font: 'Times New Roman'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 400 },
            children: [
              new TextRun({
                text: 'BÁO CÁO TIỂU LUẬN CUỐI KỲ\n',
                bold: true,
                size: 40,
                color: '003366',
                font: 'Times New Roman'
              }),
              new TextRun({
                text: 'HỌC PHẦN: MẪU THIẾT KẾ CHO PHẦN MỀM\n',
                bold: true,
                size: 30,
                font: 'Times New Roman'
              }),
              new TextRun({
                text: 'Mã lớp học phần: 020100138402 - Học kỳ 1 (2026 - 2027)\n',
                italics: true,
                size: 24,
                font: 'Times New Roman'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 1200 },
            children: [
              new TextRun({
                text: 'ĐỀ TÀI: HỆ THỐNG QUẢN LÝ BÁN HÀNG VÀ THƯƠNG MẠI ĐIỆN TỬ\nỨNG DỤNG BỘ 6 DESIGN PATTERNS VÀ 5 NGUYÊN LÝ SOLID',
                bold: true,
                size: 32,
                color: 'B8232C',
                font: 'Times New Roman'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 800, after: 200 },
            children: [
              new TextRun({
                text: 'Giảng viên hướng dẫn:\tTS. Nguyễn Văn Hướng Dẫn\n',
                size: 26,
                font: 'Times New Roman'
              }),
              new TextRun({
                text: 'Sinh viên thực hiện:\tNguyễn Văn A (Nhóm trưởng)\n',
                size: 26,
                font: 'Times New Roman'
              }),
              new TextRun({
                text: 'Mã số sinh viên:\t20260001\n',
                size: 26,
                font: 'Times New Roman'
              }),
              new TextRun({
                text: 'Ngành học:\t\tKỹ thuật Phần mềm\n',
                size: 26,
                font: 'Times New Roman'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 1000, after: 200 },
            children: [
              new TextRun({
                text: 'Thành phố Hồ Chí Minh, Tháng 11 năm 2026',
                italics: true,
                size: 24,
                font: 'Times New Roman'
              })
            ]
          }),

          // BẢNG PHÂN CÔNG NHIỆM VỤ
          new Paragraph({
            text: 'BẢNG PHÂN CÔNG NHIỆM VỤ VÀ TỶ LỆ ĐÓNG GÓP',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'STT', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Họ và Tên', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'MSSV', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Nhiệm vụ phân công', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tỷ lệ đóng góp', bold: true })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: '1' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Nguyễn Văn A' })] }),
                  new TableCell({ children: [new Paragraph({ text: '20260001' })] }),
                  new TableCell({ children: [new Paragraph({ text: 'Kiến trúc Clean Arch, cài đặt 6 Design Patterns, viết Demo CLI, viết báo cáo' })] }),
                  new TableCell({ children: [new Paragraph({ text: '100%' })] })
                ]
              })
            ]
          }),

          // CHƯƠNG 1
          new Paragraph({
            text: 'CHƯƠNG 1: TỔNG QUAN VỀ ĐỀ TÀI VÀ BÀI TOÁN THỰC TẾ',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: '1.1. Khảo sát bối cảnh và mục tiêu đề tài',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: 'Thương mại điện tử (E-Commerce) là một trong những lĩnh vực có tốc độ phát triển nhanh và phức tạp nhất hiện nay. Hệ thống phần mềm bán hàng phải đối mặt với các bài toán mở rộng quy mô, sự đa dạng của các dòng sản phẩm, chính sách giá và chiết khấu thay đổi liên tục theo từng chiến dịch, cũng như nhu cầu tích hợp đa dạng các cổng thanh toán điện tử như VNPay, MoMo, COD. Mục tiêu của đề tài là xây dựng hệ thống quản lý bán hàng chuẩn hướng đối tượng, áp dụng Clean Architecture và tối thiểu 6 Design Patterns bao phủ cả 3 nhóm Creational, Structural, Behavioral, đảm bảo tuân thủ 5 nguyên lý thiết kế SOLID.',
            spacing: { after: 150 }
          }),
          new Paragraph({
            text: '1.2. Phân tích yêu cầu chức năng (FR) và phi chức năng (NFR)',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: '- Yêu cầu chức năng: Quản lý danh mục sản phẩm và tồn kho; Cho phép khách hàng tùy biến đơn hàng (gói quà, bảo hiểm); Tính toán chiết khấu tự động theo hạng thành viên (VIP, Thường) và dịp lễ; Xử lý thanh toán đa cổng (VNPay, MoMo, COD); Phát sự kiện tự động khi đơn hàng được thanh toán (trừ kho, gửi email, gửi SMS).\n- Yêu cầu phi chức năng: Tuân thủ Open/Closed Principle (OCP) để mở rộng cổng thanh toán không cần sửa code cũ; Tuân thủ Dependency Inversion Principle (DIP) để độc lập với SDK bên thứ ba; Đạt độ bao phủ kiểm thử cao.',
            spacing: { after: 150 }
          }),

          // CHƯƠNG 2
          new Paragraph({
            text: 'CHƯƠNG 2: CƠ SỞ LÝ THUYẾT VÀ KIẾN TRÚC HỆ THỐNG',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: '2.1. Năm nguyên lý thiết kế SOLID',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: '1. SRP (Single Responsibility): Mỗi lớp chỉ có một lý do duy nhất để thay đổi. Tách biệt việc lưu trữ đơn hàng, tính biểu phí, thanh toán và gửi thông báo.\n2. OCP (Open/Closed): Mở cho việc mở rộng tính năng mới, đóng với việc chỉnh sửa mã nguồn có sẵn.\n3. LSP (Liskov Substitution): Các lớp triển khai cụ thể có thể thay thế hoàn hảo cho Abstraction mà không gây lỗi.\n4. ISP (Interface Segregation): Chia nhỏ các giao diện thay vì tạo một giao diện khổng lồ.\n5. DIP (Dependency Inversion): Module cấp cao không phụ thuộc module cấp thấp, cả hai cùng phụ thuộc vào Abstraction.',
            spacing: { after: 150 }
          }),
          new Paragraph({
            text: '2.2. Kiến trúc Clean Architecture phân tầng',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: 'Hệ thống được thiết kế theo mô hình Clean Architecture gồm 4 tầng phân lập rõ ràng:\n- Domain Layer: Chứa các thực thể cốt lõi (Product, Order, Customer) và các Interfaces trừu tượng.\n- Application Layer: Chứa OrderCheckoutService điều phối quy trình mua sắm và thanh toán.\n- Infrastructure Layer: Chứa các SDK bên ngoài (ExternalVNPaySdk, ExternalMoMoSdk) và các dịch vụ IO.\n- Presentation Layer: Interactive CLI Runner hiển thị các bước xử lý trực quan sinh động.',
            spacing: { after: 150 }
          }),

          // CHƯƠNG 3
          new Paragraph({
            text: 'CHƯƠNG 3: PHÂN TÍCH VÀ THIẾT KẾ CHI TIẾT 6 DESIGN PATTERNS',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: '3.1. Nhóm Creational Patterns: Factory Method & Builder',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: '- Factory Method: Lớp PaymentProcessorFactory định nghĩa phương thức nhà máy createPaymentProcessor(). Các lớp con CODPaymentFactory, BankTransferPaymentFactory, VNPayPaymentFactory quyết định lớp xử lý thanh toán cụ thể. Giúp tách rời logic khởi tạo khỏi logic gọi thanh toán (tuân thủ OCP và DIP).\n- Builder: Lớp OrderBuilder hỗ trợ tạo đối tượng Order phức tạp có nhiều thuộc tính tùy chọn theo cú pháp fluent interface, kiểm tra tính hợp lệ của dữ liệu trước khi tạo thực thể, loại bỏ hoàn toàn Telescoping Constructor.',
            spacing: { after: 150 }
          }),
          new Paragraph({
            text: '3.2. Nhóm Structural Patterns: Adapter & Decorator',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: '- Adapter: Lớp VNPayPaymentAdapter và MoMoPaymentAdapter chuyển đổi các tham số và tên phương thức của thư viện bên thứ ba (vnp_Amount, partnerCode) về chuẩn IPaymentProcessor.processPayment() của hệ thống mà không cần sửa mã nguồn của đối tác.\n- Decorator: Lớp BaseOrderPricing tính tiền cơ bản, được bọc động tại runtime bởi GiftWrapDecorator (cộng thêm 30.000đ) và ShippingInsuranceDecorator (cộng thêm 1% giá trị đơn hàng), tránh hiện tượng Class Explosion khi kết hợp nhiều dịch vụ.',
            spacing: { after: 150 }
          }),
          new Paragraph({
            text: '3.3. Nhóm Behavioral Patterns: Strategy & Observer',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: '- Strategy: Giao diện IDiscountStrategy đóng gói các thuật toán chiết khấu riêng biệt: RegularCustomerDiscountStrategy (0%), VipMemberDiscountStrategy (giảm 15%), HolidayTieredDiscountStrategy (giảm theo bậc giá trị đơn). Hệ thống có thể hoán đổi thuật toán linh hoạt tại runtime.\n- Observer: Lớp OrderEventPublisher quản lý danh sách IOrderObserver. Khi đơn hàng chuyển trạng thái sang PAID, sự kiện ORDER_PAID được phát tới InventoryUpdateObserver (trừ kho), EmailNotificationObserver (gửi email hóa đơn) và SmsNotificationObserver (gửi SMS mã vận đơn) hoàn toàn tự động và độc lập.',
            spacing: { after: 150 }
          }),

          // CHƯƠNG 4
          new Paragraph({
            text: 'CHƯƠNG 4: CÀI ĐẶT MÃ NGUỒN, KIỂM THỬ VÀ ĐÁNH GIÁ',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: '4.1. Môi trường cài đặt và Cấu trúc dự án',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: 'Mã nguồn được cài đặt bằng TypeScript trên nền tảng Node.js v22. Dự án được chia theo các package domain/patterns/creational, structural, behavioral rõ ràng.',
            spacing: { after: 150 }
          }),
          new Paragraph({
            text: '4.2. Kết quả kiểm thử tự động (Unit Test & Integration Test)',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: 'Hệ thống đã xây dựng bộ kiểm thử Jest với 4 Test Suites bao phủ 16 Test Cases:\n- 100% test cases cho nhóm Creational, Structural, Behavioral và Integration Test đều đạt kết quả PASS (thời gian chạy ~4.5s).\n- Minh chứng đầy đủ tính đúng đắn khi tạo đơn, bọc decorator, hoán đổi strategy, gọi qua adapter và phát sự kiện observer.',
            spacing: { after: 150 }
          }),
          new Paragraph({
            text: '4.3. Chương trình Demo trực quan',
            heading: HeadingLevel.HEADING_2
          }),
          new Paragraph({
            text: 'Chương trình demo chạy tương tác qua console (npm start) sử dụng màu sắc phân loại từng bước, thể hiện chi tiết: Dữ liệu đầu vào -> Dựng đơn bằng Builder -> Bọc phí bằng Decorator -> Giảm giá bằng Strategy VIP -> Thanh toán qua VNPay Adapter -> Tự động trừ kho và bắn Email/SMS bằng Observer.',
            spacing: { after: 150 }
          }),

          // CHƯƠNG 5
          new Paragraph({
            text: 'CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: 'Đề tài đã hoàn thành xuất sắc các mục tiêu đề ra:\n- Áp dụng thành công và chuẩn mực 6 Design Patterns vào bài toán thực tế Thương mại điện tử.\n- Chứng minh và phân tích chi tiết sự tuân thủ 5 nguyên lý SOLID.\n- Mã nguồn chạy độc lập, cấu trúc Clean Architecture chuẩn mực, có bộ test cases hoàn chỉnh.\nHướng phát triển tiếp theo: Tích hợp thêm mẫu Chain of Responsibility cho pipeline kiểm tra tính hợp lệ của đơn hàng (Fraud detection) và phát triển giao diện Web Frontend trực quan bằng React.',
            spacing: { after: 150 }
          }),

          // TÀI LIỆU THAM KHẢO
          new Paragraph({
            text: 'TÀI LIỆU THAM KHẢO (CHUN IEEE / APA)',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          new Paragraph({
            text: '[1] E. Gamma, R. Helm, R. Johnson, and J. Vlissides, Design Patterns: Elements of Reusable Object-Oriented Software. Addison-Wesley Professional, 1994.\n[2] R. C. Martin, Clean Architecture: A Craftsman\'s Guide to Software Structure and Design. Prentice Hall, 2017.\n[3] R. C. Martin, Agile Software Development, Principles, Patterns, and Practices. Prentice Hall, 2002.\n[4] A. Shvets, Dive Into Design Patterns. Refactoring.Guru, 2018.',
            spacing: { after: 150 }
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, '../plans/reports/BAO_CAO_TIEU_LUAN_MAU_THIET_KE_PM.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('Successfully generated Word report at:', outputPath);
}

generateReportDocx().catch(console.error);
