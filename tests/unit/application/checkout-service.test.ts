import { Customer, CustomerTier } from '../../../src/domain/entities/customer';
import { Product } from '../../../src/domain/entities/product';
import { OrderBuilder } from '../../../src/domain/patterns/creational/builder/order.builder';
import { OrderEventPublisher } from '../../../src/domain/patterns/behavioral/observer/order-event.publisher';
import { InventoryUpdateObserver } from '../../../src/domain/patterns/behavioral/observer/concrete-order.observers';
import {
  EmailNotificationObserver,
  SmsNotificationObserver
} from '../../../src/infrastructure/observers/notification.observers';
import { OrderCheckoutService } from '../../../src/application/services/order-checkout.service';
import { RegularCustomerDiscountStrategy, HolidayTieredDiscountStrategy } from '../../../src/domain/patterns/behavioral/strategy/concrete-discount.strategies';
import { PaymentProcessorFactory } from '../../../src/domain/patterns/creational/factory/payment-processor.factory';
import { CODPaymentFactory } from '../../../src/domain/patterns/creational/factory/cod-payment.factory';
import { IPaymentProcessor, PaymentResult } from '../../../src/domain/patterns/creational/factory/payment-processor.interface';
import { OrderStatus } from '../../../src/domain/entities/order-types';

// Stub factory trả về kết quả thanh toán THẤT BẠI để kiểm nhánh lỗi của checkout().
class FailingPaymentFactory extends PaymentProcessorFactory {
  public createPaymentProcessor(): IPaymentProcessor {
    return {
      paymentMethodName: 'Cổng lỗi (Test)',
      async processPayment(amount: number, orderId: string): Promise<PaymentResult> {
        return {
          success: false,
          transactionId: '',
          amount,
          paymentMethod: 'Cổng lỗi (Test)',
          message: `Thẻ bị từ chối cho đơn ${orderId}`,
          timestamp: new Date()
        };
      }
    };
  }
}

describe('Unit Tests - OrderCheckoutService (Application Layer)', () => {
  const customer = new Customer('C-SVC', 'Khách dịch vụ', 'svc@test.com', '0900000000', CustomerTier.REGULAR);
  const addr = { recipientName: 'A', phoneNumber: '0900000000', street: 'X', city: 'HCM' };

  function buildOrder(id: string, qty = 1): ReturnType<OrderBuilder['build']> {
    const prod = new Product(`P-${id}`, 'Hàng test', `SKU-${id}`, 3000000, 20, 'Công nghệ');
    return new OrderBuilder(id).setCustomer(customer).addItem(prod, qty).setShippingAddress(addr).build();
  }

  test('Thanh toán thất bại: ném lỗi, đơn KHÔNG chuyển PAID, observer không chạy', async () => {
    const order = buildOrder('ORD-FAIL');
    const publisher = new OrderEventPublisher();
    const invObs = new InventoryUpdateObserver();
    publisher.attach(invObs);
    const service = new OrderCheckoutService(publisher);

    await expect(
      service.checkout(order, new RegularCustomerDiscountStrategy(), new FailingPaymentFactory())
    ).rejects.toThrow('Thanh toán thất bại');

    expect(order.status).toBe(OrderStatus.PENDING);        // chưa thu tiền
    expect(invObs.lastProcessedOrderId).toBeUndefined();   // observer chưa trừ kho
  });

  test('HolidayTieredDiscountStrategy nhánh bậc thấp (< 2 triệu) giảm 50k', () => {
    const strategy = new HolidayTieredDiscountStrategy();
    const res = strategy.calculateDiscount(buildOrder('ORD-LOW'), 1000000);
    expect(res.discountAmount).toBe(50000);
    expect(res.finalAmount).toBe(950000);
  });

  test('HolidayTieredDiscountStrategy nhánh bậc giữa (2-5 triệu) giảm 200k', () => {
    const strategy = new HolidayTieredDiscountStrategy();
    const res = strategy.calculateDiscount(buildOrder('ORD-MID'), 3000000);
    expect(res.discountAmount).toBe(200000);
  });

  describe('Huỷ đơn hàng (ORDER_CANCELLED) - cùng Publisher, khác phản ứng', () => {
    test('Huỷ đơn PENDING: KHÔNG cộng ảo tồn kho, vẫn gửi email/SMS thông báo huỷ', async () => {
      const prod = new Product('P-CANCEL', 'Hàng huỷ', 'SKU-CANCEL', 1000000, 20, 'Công nghệ');
      const order = new OrderBuilder('ORD-CANCEL')
        .setCustomer(customer).addItem(prod, 3).setShippingAddress(addr).build();

      const publisher = new OrderEventPublisher();
      const invObs = new InventoryUpdateObserver();
      const emailObs = new EmailNotificationObserver();
      const smsObs = new SmsNotificationObserver();
      publisher.attach(invObs);
      publisher.attach(emailObs);
      publisher.attach(smsObs);
      const service = new OrderCheckoutService(publisher);

      // Đơn PENDING chưa từng trừ kho (tồn kho chỉ bị trừ khi ORDER_PAID).
      expect(prod.stockQuantity).toBe(20);

      const result = await service.cancelOrder(order, 'Khách đổi ý');

      expect(order.status).toBe(OrderStatus.CANCELLED);
      expect(order.cancellationReason).toBe('Khách đổi ý');
      // Không hoàn kho vì chưa trừ -> KHÔNG tăng ảo tồn kho (phòng lỗi phantom stock).
      expect(prod.stockQuantity).toBe(20);
      expect(invObs.lastRestoredOrderId).toBeUndefined();
      // Email/SMS vẫn phản ứng với sự kiện huỷ.
      expect(emailObs.sentEmails[0].subject).toContain('đã được huỷ');
      expect(smsObs.sentSms[0].message).toContain('da bi huy');
      expect(result.hasObserverFailure).toBe(false);
    });

    test('Đơn đã PAID rồi huỷ: Inventory hoàn ĐÚNG số lượng đã trừ (không cộng ảo)', async () => {
      // Quy trình thật: PAID (trừ kho) -> admin hoàn tiền & reset trạng thái -> huỷ (hoàn kho đúng).
      const prod = new Product('P-PAID-CANCEL', 'Hàng', 'SKU-PC', 1000000, 20, 'Công nghệ');
      const order = new OrderBuilder('ORD-PAID-CANCEL')
        .setCustomer(customer).addItem(prod, 3).setShippingAddress(addr).build();

      const publisher = new OrderEventPublisher();
      const invObs = new InventoryUpdateObserver();
      publisher.attach(invObs);

      // Phát ORDER_PAID để Inventory trừ kho và ghi nhận đơn đã trừ.
      await publisher.notify({ order, event: 'ORDER_PAID', timestamp: new Date() });
      expect(prod.stockQuantity).toBe(17);

      // Phát ORDER_CANCELLED cho chính đơn đó -> hoàn đúng 3, về lại 20 (không vượt).
      await publisher.notify({ order, event: 'ORDER_CANCELLED', timestamp: new Date() });
      expect(prod.stockQuantity).toBe(20);
      expect(invObs.lastRestoredOrderId).toBe('ORD-PAID-CANCEL');

      // Huỷ lần 2 cùng đơn không hoàn thêm (chống cộng ảo lặp).
      await publisher.notify({ order, event: 'ORDER_CANCELLED', timestamp: new Date() });
      expect(prod.stockQuantity).toBe(20);
    });

    test('Không huỷ trực tiếp đơn đã PAID: phải hoàn tiền trước', async () => {
      const order = buildOrder('ORD-PAID-CANCEL');
      order.markAsPaid('TXN-X');

      const service = new OrderCheckoutService(new OrderEventPublisher());
      await expect(service.cancelOrder(order, 'Lý do')).rejects.toThrow('phải thực hiện quy trình hoàn tiền');
    });

    test('Observer lỗi khi huỷ đơn được báo qua cờ hasObserverFailure', async () => {
      const order = buildOrder('ORD-CANCEL-FAIL');
      const publisher = new OrderEventPublisher();
      publisher.attach({
        observerName: 'Observer hoàn kho lỗi',
        update: () => { throw new Error('Mất kết nối hệ thống kho'); }
      });
      const service = new OrderCheckoutService(publisher);

      const result = await service.cancelOrder(order, 'Khách yêu cầu');

      expect(order.status).toBe(OrderStatus.CANCELLED);   // đơn vẫn huỷ
      expect(result.hasObserverFailure).toBe(true);        // nhưng có cảnh báo
      expect(result.failedObservers).toEqual(['Observer hoàn kho lỗi']);
    });

    test('Huỷ 2 lần bị chặn; đơn đã huỷ không thể thanh toán', async () => {
      const order = buildOrder('ORD-DOUBLE-CANCEL');
      const service = new OrderCheckoutService(new OrderEventPublisher());

      await service.cancelOrder(order, 'Hết hàng');
      await expect(service.cancelOrder(order, 'Lần hai')).rejects.toThrow('đã bị huỷ trước đó');
      expect(() => order.markAsPaid('TXN-Y')).toThrow('đã bị huỷ, không thể thanh toán');
    });

    test('markAsCancelled chặn đơn đã PAID (bảo vệ ngay tầng Entity)', () => {
      const order = buildOrder('ORD-PAID-GUARD');
      order.markAsPaid('TXN-Z');
      expect(() => order.markAsCancelled('thử huỷ')).toThrow('phải hoàn tiền trước khi huỷ');
      expect(order.status).toBe(OrderStatus.PAID);        // trạng thái không đổi
      expect(order.paymentTransactionId).toBe('TXN-Z');   // mã giao dịch còn nguyên
    });
  });

  describe('Ràng buộc checkout theo trạng thái đơn', () => {
    test('Chặn số tiền <= 0: đơn giảm giá về 0 không được ghi nhận thanh toán thành công', async () => {
      // Đơn 30.000đ gặp Flash Sale giảm 50.000đ -> clamp còn 0đ.
      const prod = new Product('P-ZERO', 'Hàng rẻ', 'SKU-ZERO', 30000, 10, 'Phụ kiện');
      const order = new OrderBuilder('ORD-ZERO')
        .setCustomer(customer).addItem(prod, 1).setShippingAddress(addr).build();
      const service = new OrderCheckoutService(new OrderEventPublisher());

      await expect(
        service.checkout(order, new HolidayTieredDiscountStrategy(), new CODPaymentFactory())
      ).rejects.toThrow('phải lớn hơn 0');
      expect(order.status).toBe(OrderStatus.PENDING);     // chưa chuyển PAID
    });

    test('Chặn checkout đơn đã CANCELLED NGAY, không gọi cổng thanh toán', async () => {
      const prod = new Product('P-CAN-CO', 'Hàng', 'SKU-CC', 500000, 10, 'Phụ kiện');
      const order = new OrderBuilder('ORD-CAN-CO')
        .setCustomer(customer).addItem(prod, 1).setShippingAddress(addr).build();
      const service = new OrderCheckoutService(new OrderEventPublisher());

      await service.cancelOrder(order, 'huỷ trước');
      await expect(
        service.checkout(order, new RegularCustomerDiscountStrategy(), new CODPaymentFactory())
      ).rejects.toThrow('chỉ checkout được đơn PENDING');
    });
  });
});
