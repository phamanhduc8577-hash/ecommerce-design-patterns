import { Customer } from '../../../src/domain/entities/customer';
import { Product } from '../../../src/domain/entities/product';
import { OrderBuilder } from '../../../src/domain/patterns/creational/builder/order.builder';
import { VNPayPaymentAdapter } from '../../../src/domain/patterns/structural/adapter/vnpay-payment.adapter';
import { MoMoPaymentAdapter } from '../../../src/domain/patterns/structural/adapter/momo-payment.adapter';
import { BaseOrderPricing } from '../../../src/domain/patterns/structural/decorator/base-order.pricing';
import { GiftWrapDecorator, ShippingInsuranceDecorator } from '../../../src/domain/patterns/structural/decorator/concrete-decorators';

describe('Unit Tests - Structural Patterns (Adapter & Decorator)', () => {
  const customer = new Customer('C-01', 'Trần Thị B', 'b@gmail.com', '0988776655');
  const phone = new Product('P-PHONE', 'iPhone 15 Pro', 'IP15P', 28000000, 15, 'Điện thoại');

  const order = new OrderBuilder('ORD-STRUCT-01')
    .setCustomer(customer)
    .addItem(phone, 1)
    .setShippingAddress({
      recipientName: 'Trần Thị B',
      phoneNumber: '0988776655',
      street: '45 Lê Duẩn',
      city: 'Hà Nội'
    })
    .build();

  describe('Adapter Pattern', () => {
    test('VNPayPaymentAdapter chuyển đổi thành công giao diện sang chuẩn IPaymentProcessor', async () => {
      const adapter = new VNPayPaymentAdapter();
      expect(adapter.paymentMethodName).toContain('VNPay');

      const result = await adapter.processPayment(28000000, order.orderId);
      expect(result.success).toBe(true);
      expect(result.transactionId).toContain('VNPAY');
      expect(result.amount).toBe(28000000);
    });

    test('MoMoPaymentAdapter chuyển đổi thành công giao dịch sang chuẩn IPaymentProcessor', async () => {
      const adapter = new MoMoPaymentAdapter();
      expect(adapter.paymentMethodName).toContain('MoMo');

      const result = await adapter.processPayment(28000000, order.orderId);
      expect(result.success).toBe(true);
      expect(result.transactionId).toContain('MOMO');
    });
  });

  describe('Decorator Pattern', () => {
    test('BaseOrderPricing tính đúng giá tiền gốc', () => {
      const basePricing = new BaseOrderPricing(order);
      expect(basePricing.calculateTotal()).toBe(28000000);
      expect(basePricing.getBreakdown().length).toBe(1);
    });

    test('Bọc thêm GiftWrapDecorator cộng dồn thêm 30,000đ', () => {
      const basePricing = new BaseOrderPricing(order);
      const withGift = new GiftWrapDecorator(basePricing, 30000);

      expect(withGift.calculateTotal()).toBe(28000000 + 30000);
      expect(withGift.getBreakdown().length).toBe(2);
    });

    test('Bọc lồng nhiều tầng Decorator (GiftWrap + Insurance) cộng dồn chính xác', () => {
      const basePricing = new BaseOrderPricing(order);
      const withGift = new GiftWrapDecorator(basePricing, 30000);
      // Bảo hiểm: 1% của 28,030,000đ = 280,300đ
      const withBoth = new ShippingInsuranceDecorator(withGift);

      const expectedTotal = 28000000 + 30000 + Math.round((28000000 + 30000) * 0.01);
      expect(withBoth.calculateTotal()).toBe(expectedTotal);
      expect(withBoth.getBreakdown().length).toBe(3);
    });
  });
});
