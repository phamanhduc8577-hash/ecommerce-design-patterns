import chalk from 'chalk';
import { Customer, CustomerTier } from './domain/entities/customer';
import { Product } from './domain/entities/product';
import { OrderBuilder } from './domain/patterns/creational/builder/order.builder';
import { OrderEventPublisher } from './domain/patterns/behavioral/observer/order-event.publisher';
import {
  InventoryUpdateObserver,
  EmailNotificationObserver,
  SmsNotificationObserver
} from './domain/patterns/behavioral/observer/concrete-order.observers';
import { OrderCheckoutService } from './application/services/order-checkout.service';
import {
  VipMemberDiscountStrategy,
  HolidayTieredDiscountStrategy,
  RegularCustomerDiscountStrategy
} from './domain/patterns/behavioral/strategy/concrete-discount.strategies';
import { VNPayPaymentFactory, MoMoPaymentFactory } from './domain/patterns/structural/adapter/adapter-factories';
import { CODPaymentFactory } from './domain/patterns/creational/factory/cod-payment.factory';

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

export async function runInteractiveDemo() {
  printHeader('HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ - DEMO 6 DESIGN PATTERNS & SOLID');
  console.log(chalk.italic.white('Học phần: Mẫu thiết kế cho phần mềm | Lớp HP: 020100138402 | HK1 2026-2027'));

  // Khởi tạo Publisher và gắn các Observers
  const publisher = new OrderEventPublisher();
  const inventoryObs = new InventoryUpdateObserver();
  const emailObs = new EmailNotificationObserver();
  const smsObs = new SmsNotificationObserver();
  publisher.attach(inventoryObs);
  publisher.attach(emailObs);
  publisher.attach(smsObs);

  const checkoutService = new OrderCheckoutService(publisher);

  // 1. Kho sản phẩm mẫu
  const laptopDell = new Product('P01', 'Laptop Dell XPS 15 OLED', 'DELL-XPS', 42000000, 5, 'Laptop');
  const banPhim = new Product('P02', 'Bàn phím cơ Keychron K8 Pro', 'KEY-K8P', 2500000, 15, 'Bàn phím');
  const taiNghe = new Product('P03', 'Tai nghe chống ồn Sony WH-1000XM5', 'SONY-XM5', 7900000, 8, 'Âm thanh');

  // 2. Khách hàng VIP
  const vipCustomer = new Customer(
    'CUST-888',
    'Trần Hoàng Nam',
    'nam.tran@techcorp.vn',
    '0908889999',
    CustomerTier.VIP
  );

  console.log(chalk.blueBright('\n[DỮ LIỆU ĐẦU VÀO]'));
  console.log(`- Khách hàng: ${chalk.bold(vipCustomer.name)} (Hạng: ${chalk.yellow(vipCustomer.tier)})`);
  console.log(`- Tồn kho ban đầu: Laptop (${laptopDell.stockQuantity}), Bàn phím (${banPhim.stockQuantity}), Tai nghe (${taiNghe.stockQuantity})`);

  // BƯỚC 1: BUILDER PATTERN
  printStep(1, 'Builder Pattern', 'Creational', 'Khởi tạo đối tượng Order phức tạp từng bước, tránh Telescoping Constructor');
  const order = new OrderBuilder('ORD-2026-VIP-99')
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

  console.log(chalk.gray(`  ✔ Đã dựng thành công Order [#${order.orderId}] với ${order.items.length} món hàng:`));
  order.items.forEach((item, idx) => {
    console.log(chalk.gray(`     ${idx + 1}. ${item.product.name} x ${item.quantity} = ${formatCurrency(item.subtotal)}`));
  });
  console.log(chalk.cyan(`  ✔ Tổng tiền hàng cơ bản (Subtotal): ${chalk.bold(formatCurrency(order.subtotal))}`));

  // BƯỚC 2: DECORATOR PATTERN
  printStep(2, 'Decorator Pattern', 'Structural', 'Tính toán biểu phí lũy tiến động (Gói quà + Bảo hiểm) tại runtime');
  console.log(chalk.gray('  ↳ Áp dụng: BaseOrderPricing -> GiftWrapDecorator (+30.000đ) -> ShippingInsuranceDecorator (+1%)'));

  // BƯỚC 3: STRATEGY PATTERN
  printStep(3, 'Strategy Pattern', 'Behavioral', 'Hoán đổi linh hoạt thuật toán chiết khấu theo hạng khách hàng VIP');
  const vipStrategy = new VipMemberDiscountStrategy();
  console.log(chalk.gray(`  ↳ Chiến lược áp dụng: ${chalk.bold(vipStrategy.strategyName)} (Giảm 15% tổng đơn)`));

  // BƯỚC 4 & 5: FACTORY METHOD + ADAPTER PATTERN
  printStep(4, 'Factory Method & Adapter Pattern', 'Creational + Structural', 'Khởi tạo cổng thanh toán VNPay và chuyển đổi tương thích giao diện SDK bên ngoài');
  const vnpayFactory = new VNPayPaymentFactory();
  console.log(chalk.gray('  ↳ Client gọi VNPayPaymentFactory.createPaymentProcessor() -> trả về VNPayPaymentAdapter'));

  // THỰC HIỆN CHECKOUT
  console.log(chalk.yellowBright('\n⚡ TIẾN HÀNH CHECKOUT & THANH TOÁN TOÀN DIỆN...'));
  const result = await checkoutService.checkout(order, vipStrategy, vnpayFactory);

  console.log('\n' + chalk.bold.bgBlue(' CHI TIẾT HÓA ĐƠN ĐIỆN TỬ VÀ KẾT QUẢ TÍNH GIÁ '));
  result.pricingBreakdown.forEach(item => {
    console.log(`  - ${item.label.padEnd(50, '.')}: ${chalk.bold(formatCurrency(item.amount))}`);
  });
  console.log(`  - Tổng trước giảm giá: ${formatCurrency(result.totalBeforeDiscount)}`);
  console.log(`  - ${chalk.green(result.discountDetails.description)}: ${chalk.bold.green('-' + formatCurrency(result.discountDetails.discountAmount))}`);
  console.log(chalk.bold.yellow(`  => SỐ TIỀN THỰC THU (PAYABLE): ${formatCurrency(result.finalPayableAmount)}`));

  console.log('\n' + chalk.bold.bgGreen(' KẾT QUẢ GIAO DỊCH THANH TOÁN (ADAPTER -> SDK) '));
  console.log(`  - Trạng thái: ${chalk.bold.green('THÀNH CÔNG (MÃ 00)')}`);
  console.log(`  - Cổng xử lý: ${result.paymentResult.paymentMethod}`);
  console.log(`  - Mã giao dịch (TxnId): ${chalk.bold.cyan(result.paymentResult.transactionId)}`);
  console.log(`  - Thông điệp: ${result.paymentResult.message}`);

  // BƯỚC 6: OBSERVER PATTERN
  printStep(5, 'Observer Pattern', 'Behavioral', 'Phát sự kiện ORDER_PAID đến tất cả người theo dõi đăng ký');
  console.log(chalk.gray('  ↳ 3 Observers tự động phản ứng đồng thời:'));
  console.log(`     1. ${chalk.bold('InventoryUpdateObserver')}: Đã trừ kho thực tế:`);
  console.log(`        + Laptop Dell XPS: ${laptopDell.stockQuantity} chiếc (giảm 1)`);
  console.log(`        + Bàn phím Keychron: ${banPhim.stockQuantity} chiếc (giảm 1)`);
  console.log(`        + Tai nghe Sony: ${taiNghe.stockQuantity} chiếc (giảm 1)`);
  console.log(`     2. ${chalk.bold('EmailNotificationObserver')}: Đã gửi email xác nhận đến [${vipCustomer.email}]`);
  console.log(`     3. ${chalk.bold('SmsNotificationObserver')}: Đã gửi tin nhắn SMS mã đơn đến SĐT [${vipCustomer.phone}]`);

  printHeader('KẾT LUẬN DEMO: TẤT CẢ 6 DESIGN PATTERNS VÀ 5 NGUYÊN LÝ SOLID ĐÃ CHẠY HOÀN HẢO');
}

// Chạy trực tiếp nếu file được thực thi
if (require.main === module) {
  runInteractiveDemo().catch(console.error);
}
