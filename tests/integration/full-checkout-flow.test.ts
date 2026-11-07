import { Customer, CustomerTier } from '../../src/domain/entities/customer';
import { Product } from '../../src/domain/entities/product';
import { OrderBuilder } from '../../src/domain/patterns/creational/builder/order.builder';
import { OrderEventPublisher } from '../../src/domain/patterns/behavioral/observer/order-event.publisher';
import {
  InventoryUpdateObserver
} from '../../src/domain/patterns/behavioral/observer/concrete-order.observers';
import {
  EmailNotificationObserver,
  SmsNotificationObserver
} from '../../src/infrastructure/observers/notification.observers';
import { OrderCheckoutService } from '../../src/application/services/order-checkout.service';
import { VipMemberDiscountStrategy } from '../../src/domain/patterns/behavioral/strategy/concrete-discount.strategies';
import { VNPayPaymentFactory } from '../../src/domain/patterns/structural/adapter/adapter-factories';
import { ExternalVNPaySdk } from '../../src/infrastructure/gateways/third-party-payment-sdks';
import { OrderStatus } from '../../src/domain/entities/order-types';

describe('Integration Test - End-to-End E-Commerce Flow (All 6 Patterns)', () => {
  test('Hoàn tất trọn vẹn luồng Checkout tích hợp cả 6 Design Patterns', async () => {
    // 1. Dữ liệu đầu vào
    const customer = new Customer('C-VIP-99', 'Phạm Minh D', 'minhd@vip.com', '0933445566', CustomerTier.VIP);
    const macbook = new Product('MAC-M3', 'MacBook Pro M3 Max', 'APPLE-MBP-M3', 50000000, 3, 'Laptop');
    const airpods = new Product('AIR-PRO2', 'Tai nghe AirPods Pro 2', 'APPLE-APP2', 5000000, 10, 'Phụ kiện');

    // 2. Observer setup
    const publisher = new OrderEventPublisher();
    const inventoryObs = new InventoryUpdateObserver();
    const emailObs = new EmailNotificationObserver();
    const smsObs = new SmsNotificationObserver();
    publisher.attach(inventoryObs);
    publisher.attach(emailObs);
    publisher.attach(smsObs);

    // 3. Creational Pattern: Builder
    const order = new OrderBuilder('ORD-FULL-FLOW-01')
      .setCustomer(customer)
      .addItem(macbook, 1) // 50 tr
      .addItem(airpods, 1) // 5 tr -> Subtotal = 55 tr
      .setShippingAddress({
        recipientName: 'Phạm Minh D',
        phoneNumber: '0933445566',
        street: '88 Landmark, Vinhomes',
        city: 'TP. Hồ Chí Minh'
      })
      .enableGiftWrap(true) // Decorator: +30k
      .enableInsurance(true) // Decorator: +1% = 550.3k
      .build();

    // 4. Khởi tạo Service
    const checkoutService = new OrderCheckoutService(publisher);

    // 5. Behavioral: Strategy (VIP) & Creational: Factory + Structural: Adapter (VNPay)
    const vipStrategy = new VipMemberDiscountStrategy();
    const vnpayFactory = new VNPayPaymentFactory(new ExternalVNPaySdk());

    const checkoutResult = await checkoutService.checkout(order, vipStrategy, vnpayFactory);

    // 6. Kiểm tra kết quả tổng thể
    expect(checkoutResult.order.status).toBe(OrderStatus.PAID);
    expect(checkoutResult.paymentResult.success).toBe(true);
    expect(checkoutResult.paymentResult.paymentMethod).toContain('VNPay');
    expect(checkoutResult.discountDetails.discountAmount).toBeGreaterThan(0);

    // Kiểm tra kho bị trừ tự động (Observer)
    expect(macbook.stockQuantity).toBe(2);
    expect(airpods.stockQuantity).toBe(9);

    // Kiểm tra thông báo gửi tự động (Observer)
    expect(emailObs.sentEmails.length).toBe(1);
    expect(smsObs.sentSms.length).toBe(1);

    // Không có observer thất bại trong luồng chuẩn
    expect(checkoutResult.hasObserverFailure).toBe(false);
  });

  test('Chống thu tiền 2 lần: checkout lại đơn đã PAID phải bị chặn NGAY, không gọi thanh toán', async () => {
    const customer = new Customer('C-DUP', 'Khách trùng', 'dup@test.com', '0900000000', CustomerTier.VIP);
    const prod = new Product('P-DUP', 'Chuột', 'SKU-DUP', 500000, 50, 'Phụ kiện');
    const publisher = new OrderEventPublisher();
    publisher.attach(new InventoryUpdateObserver());
    const service = new OrderCheckoutService(publisher);

    const order = new OrderBuilder('ORD-DUP-01')
      .setCustomer(customer)
      .addItem(prod, 1)
      .setShippingAddress({ recipientName: 'A', phoneNumber: '0900000000', street: 'X', city: 'HCM' })
      .build();

    await service.checkout(order, new VipMemberDiscountStrategy(), new VNPayPaymentFactory(new ExternalVNPaySdk()));
    expect(order.status).toBe(OrderStatus.PAID);
    const stockAfterFirst = prod.stockQuantity;

    // Lần 2 phải ném lỗi ngay, kho KHÔNG bị trừ thêm (chứng tỏ thanh toán không chạy lại)
    await expect(
      service.checkout(order, new VipMemberDiscountStrategy(), new VNPayPaymentFactory(new ExternalVNPaySdk()))
    ).rejects.toThrow('chỉ checkout được đơn PENDING');
    expect(prod.stockQuantity).toBe(stockAfterFirst);
  });

  test('Observer thất bại (trừ kho lỗi) được báo qua cờ hasObserverFailure, không nuốt lỗi âm thầm', async () => {
    const customer = new Customer('C-INVFAIL', 'Khách', 'inv@test.com', '0900000000', CustomerTier.VIP);
    const prod = new Product('P-INVFAIL', 'Hàng hiếm', 'SKU-RARE', 2000000, 10, 'Công nghệ');
    const order = new OrderBuilder('ORD-INVFAIL-01')
      .setCustomer(customer)
      .addItem(prod, 8)
      .setShippingAddress({ recipientName: 'A', phoneNumber: '0900000000', street: 'X', city: 'HCM' })
      .build();

    // Mô phỏng kho bị rút sau khi dựng đơn (race condition): còn 2 < 8 đã đặt
    prod.stockQuantity = 2;

    const publisher = new OrderEventPublisher();
    publisher.attach(new InventoryUpdateObserver());
    const service = new OrderCheckoutService(publisher);

    const result = await service.checkout(order, new VipMemberDiscountStrategy(), new VNPayPaymentFactory(new ExternalVNPaySdk()));

    expect(result.order.status).toBe(OrderStatus.PAID); // tiền đã thu
    expect(result.hasObserverFailure).toBe(true);        // nhưng có cảnh báo
    expect(result.failedObservers.length).toBe(1);
  });
});
