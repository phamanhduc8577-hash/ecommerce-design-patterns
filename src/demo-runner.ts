import readline from 'readline';
import chalk from 'chalk';
import { Customer, CustomerTier } from './domain/entities/customer';
import { Product } from './domain/entities/product';
import { OrderBuilder } from './domain/patterns/creational/builder/order.builder';
import { OrderEventPublisher } from './domain/patterns/behavioral/observer/order-event.publisher';
import {
  InventoryUpdateObserver
} from './domain/patterns/behavioral/observer/concrete-order.observers';
import {
  EmailNotificationObserver,
  SmsNotificationObserver
} from './infrastructure/observers/notification.observers';
import { OrderCheckoutService } from './application/services/order-checkout.service';
import {
  VipMemberDiscountStrategy,
  HolidayTieredDiscountStrategy,
  RegularCustomerDiscountStrategy
} from './domain/patterns/behavioral/strategy/concrete-discount.strategies';
import { IDiscountStrategy } from './domain/patterns/behavioral/strategy/discount-strategy.interface';
import { VNPayPaymentFactory, MoMoPaymentFactory } from './domain/patterns/structural/adapter/adapter-factories';
import { ExternalVNPaySdk, ExternalMoMoSdk } from './infrastructure/gateways/third-party-payment-sdks';
import { CODPaymentFactory } from './domain/patterns/creational/factory/cod-payment.factory';
import { BankTransferPaymentFactory } from './domain/patterns/creational/factory/bank-transfer.factory';
import { PaymentProcessorFactory } from './domain/patterns/creational/factory/payment-processor.factory';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function printHeader(title: string) {
  console.log('\n' + chalk.bold.cyan('='.repeat(75)));
  console.log(chalk.bold.yellow(`★ ${title.toUpperCase()} ★`));
  console.log(chalk.bold.cyan('='.repeat(75)));
}

function printStep(stepNum: number, patternName: string, patternGroup: string, description: string) {
  console.log(
    chalk.bold.green(`\n[BƯỚC ${stepNum}] `) +
    chalk.black.bgMagenta(` ${patternGroup.toUpperCase()} `) + ' ' +
    chalk.bold.white(patternName)
  );
  console.log(chalk.gray(`  ↳ Nghiệp vụ: ${description}`));
}

// Chế độ demo tự động mặc định (Quick Demo)
export async function runAutomatedScenario() {
  printHeader('KỊCH BẢN CHUẨN: CHECKOUT ĐƠN HÀNG VIP QUA VNPAY');

  const publisher = new OrderEventPublisher();
  const inventoryObs = new InventoryUpdateObserver();
  const emailObs = new EmailNotificationObserver();
  const smsObs = new SmsNotificationObserver();
  publisher.attach(inventoryObs);
  publisher.attach(emailObs);
  publisher.attach(smsObs);

  const checkoutService = new OrderCheckoutService(publisher);

  const laptopDell = new Product('P01', 'Laptop Dell XPS 15 OLED', 'DELL-XPS', 42000000, 5, 'Laptop');
  const banPhim = new Product('P02', 'Bàn phím cơ Keychron K8 Pro', 'KEY-K8P', 2500000, 15, 'Bàn phím');
  const taiNghe = new Product('P03', 'Tai nghe chống ồn Sony WH-1000XM5', 'SONY-XM5', 7900000, 8, 'Âm thanh');

  const vipCustomer = new Customer('CUST-888', 'Trần Hoàng Nam', 'nam.tran@techcorp.vn', '0908889999', CustomerTier.VIP);

  printStep(1, 'Builder Pattern', 'Creational', 'Dựng đối tượng Order phức tạp từng bước, kiểm soát tồn kho & validate');
  const order = new OrderBuilder('ORD-2026-AUTO-99')
    .setCustomer(vipCustomer)
    .addItem(laptopDell, 1)
    .addItem(banPhim, 1)
    .addItem(taiNghe, 1)
    .setShippingAddress({
      recipientName: 'Trần Hoàng Nam',
      phoneNumber: '0908889999',
      street: 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, P. 22, Bình Thạnh',
      city: 'TP. Hồ Chí Minh'
    })
    .enableGiftWrap(true)
    .enableInsurance(true)
    .setSpecialNotes('Hàng giá trị cao - Giao tận tay người nhận trong giờ hành chính')
    .build();

  console.log(chalk.gray(`  ✔ Đã dựng thành công Order [#${order.orderId}] (${formatCurrency(order.subtotal)})`));

  printStep(2, 'Decorator Pattern', 'Structural', 'Tính toán biểu phí lũy tiến động (Gói quà + Bảo hiểm) tại runtime');
  printStep(3, 'Strategy Pattern', 'Behavioral', 'Hoán đổi chiến lược chiết khấu: Đặc quyền Thẻ VIP (-15%)');
  const vipStrategy = new VipMemberDiscountStrategy();

  printStep(4, 'Factory Method & Adapter Pattern', 'Creational + Structural', 'Khởi tạo cổng VNPay và chuyển đổi tương thích SDK');
  const vnpayFactory = new VNPayPaymentFactory(new ExternalVNPaySdk());

  console.log(chalk.yellowBright('\n⚡ TIẾN HÀNH CHECKOUT VÀ THANH TOÁN...'));
  const result = await checkoutService.checkout(order, vipStrategy, vnpayFactory);

  console.log('\n' + chalk.bold.bgBlue(' CHI TIẾT HÓA ĐƠN ĐIỆN TỬ '));
  result.pricingBreakdown.forEach(item => {
    console.log(`  - ${item.label.padEnd(50, '.')}: ${chalk.bold(formatCurrency(item.amount))}`);
  });
  console.log(`  - ${chalk.green(result.discountDetails.description)}: ${chalk.bold.green('-' + formatCurrency(result.discountDetails.discountAmount))}`);
  console.log(chalk.bold.yellow(`  => SỐ TIỀN THỰC THU (PAYABLE): ${formatCurrency(result.finalPayableAmount)}`));

  console.log('\n' + chalk.bold.bgGreen(' KẾT QUẢ GIAO DỊCH (ADAPTER -> SDK) '));
  console.log(`  - Trạng thái: ${chalk.bold.green('THÀNH CÔNG (MÃ 00)')}`);
  console.log(`  - Cổng xử lý: ${result.paymentResult.paymentMethod}`);
  console.log(`  - Mã giao dịch: ${chalk.bold.cyan(result.paymentResult.transactionId)}`);

  printStep(5, 'Observer Pattern', 'Behavioral', 'Phát sự kiện ORDER_PAID đến các Observers đăng ký');
  // In kết quả thật từ Publisher (không in cứng) để phản ánh đúng trạng thái từng Observer.
  result.observerResults.forEach(r => {
    const status = r.success ? chalk.green('THÀNH CÔNG') : chalk.red(`THẤT BẠI: ${r.error}`);
    console.log(`  - ${r.observerName}: ${status}`);
  });
  console.log(`  - Tồn kho sau giao dịch: Laptop còn ${laptopDell.stockQuantity}, Phím còn ${banPhim.stockQuantity}`);
  console.log(chalk.gray(`  - Địa chỉ nhận thông báo: email [${vipCustomer.email}], SMS [${vipCustomer.phone}] (trạng thái gửi xem từng Observer ở trên)`));

  if (result.hasObserverFailure) {
    console.log(chalk.bold.red(`\n⚠ CẢNH BÁO: ${result.failedObservers.length} observer thất bại dù đơn đã thu tiền:`));
    result.failedObservers.forEach(name => console.log(chalk.red(`    - ${name} (cần xử lý bù thủ công)`)));
  }
}

export async function runInteractiveMenu(rl: readline.Interface) {
  const question = (query: string): Promise<string> =>
    new Promise(resolve => rl.question(query, resolve));

  try {
    printHeader('MENU TÙY BIẾN TƯƠNG TÁC DEMO TRỰC TIẾP (DÀNH CHO HỘI ĐỒNG VẤN ĐÁP)');
    console.log('Bạn có thể tùy biến các tham số để kiểm tra phản ứng của 6 Design Patterns:');

    // 1. CHỌN KHÁCH HÀNG & CHIẾN LƯỢC STRATEGY
    console.log(chalk.bold.cyan('\n[1] LỰA CHỌN HẠNG KHÁCH HÀNG (Strategy Pattern):'));
    console.log('  1. Khách hàng Thường (RegularCustomerStrategy: Chiết khấu 0%)');
    console.log('  2. Khách hàng VIP (VipMemberStrategy: Giảm 15% tổng đơn)');
    console.log('  3. Sự kiện Ngày lễ / Flash Sale (HolidayTieredStrategy: Bậc 200k / 600k)');
    const stratChoice = (await question('=> Lựa chọn (1-3, mặc định 2): ')).trim() || '2';

    let customer: Customer;
    let strategy: IDiscountStrategy;

    if (stratChoice === '1') {
      customer = new Customer('C-REG-01', 'Nguyễn Văn Bình', 'binh@gmail.com', '0911222333', CustomerTier.REGULAR);
      strategy = new RegularCustomerDiscountStrategy();
    } else if (stratChoice === '3') {
      customer = new Customer('C-HOL-01', 'Lê Thị Mai', 'mai.le@holiday.vn', '0944555666', CustomerTier.GOLD);
      strategy = new HolidayTieredDiscountStrategy();
    } else {
      customer = new Customer('C-VIP-01', 'Trần Hoàng Nam', 'nam.tran@techcorp.vn', '0908889999', CustomerTier.VIP);
      strategy = new VipMemberDiscountStrategy();
    }
    console.log(chalk.green(`✔ Đã chọn: ${customer.name} - Chiến lược [${strategy.strategyName}]`));

    // 2. CHỌN SẢN PHẨM (Builder Pattern)
    console.log(chalk.bold.cyan('\n[2] CHỌN SẢN PHẨM & SỐ LƯỢNG (Builder Pattern):'));
    const laptop = new Product('P01', 'Laptop Dell XPS 15 OLED', 'DELL-XPS', 42000000, 5, 'Laptop');
    const mouse = new Product('P02', 'Chuột Logitech MX Master 3S', 'MX-3S', 2500000, 10, 'Phụ kiện');
    console.log(`  1. ${laptop.name} - ${formatCurrency(laptop.price)} (Tồn kho: ${laptop.stockQuantity})`);
    console.log(`  2. ${mouse.name} - ${formatCurrency(mouse.price)} (Tồn kho: ${mouse.stockQuantity})`);
    // Đọc số lượng an toàn: giới hạn trong khoảng tồn kho, phản hồi rõ khi nhập sai.
    const readQty = async (label: string, max: number): Promise<number> => {
      const raw = (await question(`=> Số lượng ${label} muốn mua (0-${max}, mặc định 1): `)).trim();
      if (raw === '') return 1;
      const n = parseInt(raw, 10);
      if (isNaN(n) || n < 0) {
        console.log(chalk.yellow(`  ⚠ Giá trị "${raw}" không hợp lệ, dùng mặc định 0.`));
        return 0;
      }
      if (n > max) {
        console.log(chalk.yellow(`  ⚠ Vượt tồn kho (${max}), tự điều chỉnh về ${max}.`));
        return max;
      }
      return n;
    };

    const qtyLaptop = await readQty('Laptop', laptop.stockQuantity);
    const qtyMouse = await readQty('Chuột', mouse.stockQuantity);

    const orderBuilder = new OrderBuilder()
      .setCustomer(customer)
      .setShippingAddress({
        recipientName: customer.name,
        phoneNumber: customer.phone,
        street: '720A Điện Biên Phủ, P. 22',
        city: 'TP. Hồ Chí Minh'
      });

    // Bọc addItem trong try/catch để demo không sập giữa chừng nếu validate tồn kho ném lỗi.
    try {
      if (qtyLaptop > 0) orderBuilder.addItem(laptop, qtyLaptop);
      if (qtyMouse > 0) orderBuilder.addItem(mouse, qtyMouse);

      if (qtyLaptop === 0 && qtyMouse === 0) {
        console.log(chalk.yellow('Chưa chọn món nào, hệ thống mặc định thêm 1 Laptop cho demo.'));
        orderBuilder.addItem(laptop, 1);
      }
    } catch (err: any) {
      console.log(chalk.red(`✖ Không thể thêm sản phẩm: ${err.message}`));
      console.log(chalk.yellow('  Hệ thống mặc định thêm 1 Laptop để tiếp tục demo.'));
      orderBuilder.addItem(laptop, 1);
    }

    // 3. CHỌN DỊCH VỤ GIA TĂNG (Decorator Pattern)
    console.log(chalk.bold.cyan('\n[3] CHỌN DỊCH VỤ GIÁ TRỊ GIA TĂNG (Decorator Pattern):'));
    const giftAns = (await question('=> Bật dịch vụ Gói quà cao cấp (+30.000đ)? (y/N, mặc định y): ')).trim().toLowerCase() || 'y';
    const insAns = (await question('=> Bật dịch vụ Bảo hiểm vận chuyển (+1% giá trị hàng)? (y/N, mặc định y): ')).trim().toLowerCase() || 'y';

    const enableGift = giftAns === 'y';
    const enableIns = insAns === 'y';
    orderBuilder.enableGiftWrap(enableGift);
    orderBuilder.enableInsurance(enableIns);

    const order = orderBuilder.build();
    console.log(chalk.green(`✔ Đã dựng thành công Order [#${order.orderId}] với tiền hàng gốc: ${formatCurrency(order.subtotal)}`));

    // 4. CHỌN PHƯƠNG THỨC THANH TOÁN (Factory Method & Adapter Pattern)
    console.log(chalk.bold.cyan('\n[4] CHỌN CỔNG THANH TOÁN (Factory Method & Adapter Pattern):'));
    console.log('  1. Cổng VNPay (Adapter tích hợp ExternalVNPaySdk)');
    console.log('  2. Cổng MoMo QR (Adapter tích hợp ExternalMoMoSdk)');
    console.log('  3. Thanh toán tiền mặt khi nhận hàng (CODPaymentFactory)');
    console.log('  4. Chuyển khoản ngân hàng trực tiếp (BankTransferPaymentFactory)');
    const payChoice = (await question('=> Lựa chọn cổng thanh toán (1-4, mặc định 1): ')).trim() || '1';

    let factory: PaymentProcessorFactory;
    if (payChoice === '2') {
      factory = new MoMoPaymentFactory(new ExternalMoMoSdk());
    } else if (payChoice === '3') {
      factory = new CODPaymentFactory();
    } else if (payChoice === '4') {
      factory = new BankTransferPaymentFactory();
    } else {
      factory = new VNPayPaymentFactory(new ExternalVNPaySdk());
    }

    // 5. CẤU HÌNH OBSERVER PATTERN
    console.log(chalk.bold.cyan('\n[5] THIẾT LẬP BỘ LẮNG NGHE SỰ KIỆN (Observer Pattern):'));
    const publisher = new OrderEventPublisher();
    const invObs = new InventoryUpdateObserver();
    const emailObs = new EmailNotificationObserver();
    const smsObs = new SmsNotificationObserver();

    publisher.attach(invObs);
    publisher.attach(emailObs);
    publisher.attach(smsObs);

    const detachSms = (await question('=> Bạn có muốn thử nghiệm hủy đăng ký SmsObserver (detach) không? (y/N, mặc định n): ')).trim().toLowerCase();
    if (detachSms === 'y') {
      publisher.detach(smsObs.observerName);
      console.log(chalk.yellow(`✔ Đã detach: [${smsObs.observerName}]. Hiện chỉ còn ${publisher.getObserversCount()} Observers.`));
    }

    // THỰC THI CHECKOUT TOÀN DIỆN
    console.log(chalk.yellowBright('\n================ TIẾN HÀNH CHECKOUT & TỔNG HỢP KẾT QUẢ ================'));
    const checkoutService = new OrderCheckoutService(publisher);
    const result = await checkoutService.checkout(order, strategy, factory);

    console.log(chalk.bold.bgBlue('\n [BẢNG TÍNH PHÍ ĐỘNG DECORATOR] '));
    result.pricingBreakdown.forEach(item => {
      console.log(`  - ${item.label.padEnd(45, '.')}: ${chalk.bold(formatCurrency(item.amount))}`);
    });

    console.log(chalk.bold.bgMagenta('\n [CHIẾT KHẤU STRATEGY] '));
    console.log(`  - Chiến lược: ${result.discountDetails.strategy}`);
    console.log(`  - Mô tả: ${result.discountDetails.description}`);
    console.log(`  - Số tiền giảm: ${chalk.bold.green('-' + formatCurrency(result.discountDetails.discountAmount))}`);
    console.log(chalk.bold.yellow(`  => THỰC THU: ${formatCurrency(result.finalPayableAmount)}`));

    console.log(chalk.bold.bgGreen('\n [KẾT QUẢ THANH TOÁN FACTORY + ADAPTER] '));
    console.log(`  - Cổng: ${result.paymentResult.paymentMethod}`);
    console.log(`  - Mã GD: ${result.paymentResult.transactionId}`);
    console.log(`  - Thông điệp: ${result.paymentResult.message}`);

    console.log(chalk.bold.bgCyan('\n [PHẢN ỨNG OBSERVER PATTERN] '));
    result.observerResults.forEach(r => {
      const statusText = r.success ? chalk.green('THÀNH CÔNG') : chalk.red('THẤT BẠI: ' + r.error);
      console.log(`  - ${r.observerName}: ${statusText}`);
    });
    console.log(`  - Tồn kho sau giao dịch: Laptop: ${laptop.stockQuantity}, Chuột: ${mouse.stockQuantity}`);

    if (result.hasObserverFailure) {
      console.log(chalk.bold.red(`\n⚠ CẢNH BÁO: ${result.failedObservers.length} observer thất bại dù đơn đã thu tiền:`));
      result.failedObservers.forEach(name => console.log(chalk.red(`    - ${name} (cần xử lý bù thủ công)`)));
    }

    // 6. DEMO SỰ KIỆN HUỶ ĐƠN: cùng Publisher, cùng Observer, phản ứng hoàn toàn khác
    console.log(chalk.bold.cyan('\n[6] DEMO SỰ KIỆN HUỶ ĐƠN (Observer Pattern - ORDER_CANCELLED):'));
    const wantCancelDemo = (await question('=> Chạy thêm demo huỷ đơn để xem Observer hoàn kho? (y/N, mặc định y): ')).trim().toLowerCase() || 'y';

    if (wantCancelDemo === 'y') {
      // Dùng sản phẩm riêng cho demo huỷ để không đụng tồn kho của đơn vừa checkout ở trên.
      const demoBook = new Product('P-DEMO-CANCEL', 'Sách Design Patterns (GoF)', 'BOOK-GOF', 350000, 20, 'Sách');
      const cancelOrder = new OrderBuilder()
        .setCustomer(customer)
        .addItem(demoBook, 2)
        .setShippingAddress({
          recipientName: customer.name,
          phoneNumber: customer.phone,
          street: '720A Điện Biên Phủ, P. 22',
          city: 'TP. Hồ Chí Minh'
        })
        .build();
      console.log(chalk.gray(`  ✔ Đã dựng đơn PENDING [#${cancelOrder.orderId}] - 2 cuốn sách (kho ${demoBook.stockQuantity}, CHƯA trừ vì chưa thanh toán)`));

      const emailsBefore = emailObs.sentEmails.length;

      const cancelResult = await checkoutService.cancelOrder(cancelOrder, 'Khách đổi ý, không mua nữa');

      console.log(`  - Trạng thái đơn: ${chalk.bold.yellow(cancelResult.order.status)} (lý do: ${cancelResult.reason})`);
      console.log(chalk.bold.bgCyan('\n [PHẢN ỨNG OBSERVER VỚI SỰ KIỆN HUỶ] '));
      cancelResult.observerResults.forEach(r => {
        const statusText = r.success ? chalk.green('THÀNH CÔNG') : chalk.red('THẤT BẠI: ' + r.error);
        console.log(`  - ${r.observerName}: ${statusText}`);
      });
      console.log(chalk.green(`  ✔ Tồn kho sách giữ nguyên ${demoBook.stockQuantity} (đơn PENDING chưa trừ kho nên không cộng ảo)`));
      if (emailObs.sentEmails.length > emailsBefore) {
        console.log(chalk.green(`  ✔ Email huỷ: "${emailObs.sentEmails[emailObs.sentEmails.length - 1].subject}"`));
      }
      console.log(chalk.gray('  ↳ Cùng Publisher, cùng Observer - chỉ khác loại sự kiện: Email/SMS gửi thông báo huỷ,'));
      console.log(chalk.gray('    Inventory chỉ hoàn kho cho đơn đã từng trừ (đã PAID), nên đơn PENDING này không đổi kho.'));

      // Ràng buộc nghiệp vụ: đơn đã thanh toán không huỷ trực tiếp được
      try {
        await checkoutService.cancelOrder(order, 'Thử huỷ đơn đã thanh toán');
      } catch (err: any) {
        console.log(chalk.yellow(`  ⚠ Ràng buộc nghiệp vụ: ${err.message}`));
      }
    }

    printHeader('DEMO TƯƠNG TÁC KẾT THÚC THÀNH CÔNG RỰC RỠ');
  } finally {
    rl.close();
  }
}

export async function main() {
  printHeader('HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ - DEMO 6 DESIGN PATTERNS & SOLID');
  console.log(chalk.italic.white('Học phần: Mẫu thiết kế cho phần mềm | Lớp HP: 020100138402 | HK1 2026-2027'));
  console.log('\nChọn chế độ chạy:');
  console.log('  1. Chạy kịch bản tự động toàn diện (Quick Scenario)');
  console.log('  2. Chạy Menu tương tác tùy biến trực tiếp (Interactive Q&A Session)');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('\n=> Lựa chọn (1 hoặc 2, mặc định 1): ', async (ans) => {
    if (ans.trim() === '2') {
      await runInteractiveMenu(rl);
    } else {
      rl.close();
      await runAutomatedScenario();
    }
  });
}

if (require.main === module) {
  main().catch(console.error);
}
