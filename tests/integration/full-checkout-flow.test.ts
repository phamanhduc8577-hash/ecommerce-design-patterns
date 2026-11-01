import { Customer, CustomerTier } from '../../src/domain/entities/customer';
import { Product } from '../../src/domain/entities/product';
import { OrderBuilder } from '../../src/domain/patterns/creational/builder/order.builder';
import { OrderEventPublisher } from '../../src/domain/patterns/behavioral/observer/order-event.publisher';
import {
  InventoryUpdateObserver,
  EmailNotificationObserver,
  SmsNotificationObserver
} from '../../src/domain/patterns/behavioral/observer/concrete-order.observers';
import { OrderCheckoutService } from '../../src/application/services/order-checkout.service';
import { VipMemberDiscountStrategy } from '../../src/domain/patterns/behavioral/strategy/concrete-discount.strategies';
import { VNPayPaymentFactory } from '../../src/domain/patterns/structural/adapter/adapter-factories';
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
    const vnpayFactory = new VNPayPaymentFactory();

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
  });
});
