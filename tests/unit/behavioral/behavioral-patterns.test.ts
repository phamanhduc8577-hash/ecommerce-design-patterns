import { Customer, CustomerTier } from '../../../src/domain/entities/customer';
import { Product } from '../../../src/domain/entities/product';
import { OrderBuilder } from '../../../src/domain/patterns/creational/builder/order.builder';
import {
  RegularCustomerDiscountStrategy,
  VipMemberDiscountStrategy,
  HolidayTieredDiscountStrategy
} from '../../../src/domain/patterns/behavioral/strategy/concrete-discount.strategies';
import { OrderEventPublisher } from '../../../src/domain/patterns/behavioral/observer/order-event.publisher';
import {
  InventoryUpdateObserver,
  EmailNotificationObserver,
  SmsNotificationObserver
} from '../../../src/domain/patterns/behavioral/observer/concrete-order.observers';

describe('Unit Tests - Behavioral Patterns (Strategy & Observer)', () => {
  const vipCustomer = new Customer('VIP-01', 'Lê Hoàng C', 'c@vip.com', '0912345678', CustomerTier.VIP);
  const monitor = new Product('MON-01', 'Màn hình LG 27 inch 4K', 'LG-27-4K', 10000000, 5, 'Màn hình');

  const order = new OrderBuilder('ORD-BEH-01')
    .setCustomer(vipCustomer)
    .addItem(monitor, 1)
    .setShippingAddress({
      recipientName: 'Lê Hoàng C',
      phoneNumber: '0912345678',
      street: '10 Hai Bà Trưng',
      city: 'Đà Nẵng'
    })
    .build();

  describe('Strategy Pattern', () => {
    test('RegularCustomerDiscountStrategy không giảm giá', () => {
      const strategy = new RegularCustomerDiscountStrategy();
      const res = strategy.calculateDiscount(order, 10000000);
      expect(res.discountAmount).toBe(0);
      expect(res.finalAmount).toBe(10000000);
    });

    test('VipMemberDiscountStrategy giảm đúng 15% tổng hóa đơn', () => {
      const strategy = new VipMemberDiscountStrategy();
      const res = strategy.calculateDiscount(order, 10000000);
      expect(res.discountAmount).toBe(1500000);
      expect(res.finalAmount).toBe(8500000);
    });

    test('HolidayTieredDiscountStrategy giảm theo bậc giá trị đơn', () => {
      const strategy = new HolidayTieredDiscountStrategy();
      // Đơn 10 triệu >= 5 triệu nên giảm 600,000đ
      const res = strategy.calculateDiscount(order, 10000000);
      expect(res.discountAmount).toBe(600000);
      expect(res.finalAmount).toBe(9400000);
    });
  });

  describe('Observer Pattern', () => {
    test('Tất cả Observers đăng ký đều nhận được sự kiện và cập nhật tương ứng', async () => {
      const publisher = new OrderEventPublisher();
      const inventoryObs = new InventoryUpdateObserver();
      const emailObs = new EmailNotificationObserver();
      const smsObs = new SmsNotificationObserver();

      publisher.attach(inventoryObs);
      publisher.attach(emailObs);
      publisher.attach(smsObs);
      expect(publisher.getObserversCount()).toBe(3);

      const initialStock = monitor.stockQuantity; // 5

      order.markAsPaid('TXN-OBSERVER-TEST');

      await publisher.notify({
        order,
        event: 'ORDER_PAID',
        timestamp: new Date()
      });

      // Kiểm tra InventoryObserver đã trừ kho thành công từ 5 xuống 4
      expect(monitor.stockQuantity).toBe(initialStock - 1);
      expect(inventoryObs.lastProcessedOrderId).toBe(order.orderId);

      // Kiểm tra EmailNotificationObserver đã gửi email
      expect(emailObs.sentEmails.length).toBe(1);
      expect(emailObs.sentEmails[0].to).toBe(vipCustomer.email);
      expect(emailObs.sentEmails[0].subject).toContain(order.orderId);

      // Kiểm tra SmsNotificationObserver đã gửi SMS
      expect(smsObs.sentSms.length).toBe(1);
      expect(smsObs.sentSms[0].phone).toBe('0912345678');
    });

    test('Detach observer thành công và không nhận sự kiện nữa', async () => {
      const publisher = new OrderEventPublisher();
      const smsObs = new SmsNotificationObserver();

      publisher.attach(smsObs);
      expect(publisher.getObserversCount()).toBe(1);

      publisher.detach(smsObs.observerName);
      expect(publisher.getObserversCount()).toBe(0);
    });

    test('Chịu lỗi (Fault-Tolerance): Một Observer lỗi không làm gián đoạn các Observer khác', async () => {
      const publisher = new OrderEventPublisher();
      const faultyObserver = {
        observerName: 'Lỗi Third-Party Webhook',
        update: () => {
          throw new Error('Connection timeout to webhook endpoint');
        }
      };
      const emailObs = new EmailNotificationObserver();

      publisher.attach(faultyObserver);
      publisher.attach(emailObs);

      const results = await publisher.notify({
        order,
        event: 'ORDER_PAID',
        timestamp: new Date()
      });

      expect(results.length).toBe(2);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Connection timeout');
      expect(results[1].success).toBe(true);
      expect(emailObs.sentEmails.length).toBeGreaterThan(0);
    });
  });
});
