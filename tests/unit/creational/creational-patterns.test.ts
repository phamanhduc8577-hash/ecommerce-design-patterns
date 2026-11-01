import { Customer, CustomerTier } from '../../../src/domain/entities/customer';
import { Product } from '../../../src/domain/entities/product';
import { OrderBuilder } from '../../../src/domain/patterns/creational/builder/order.builder';
import { OrderStatus } from '../../../src/domain/entities/order-types';
import { CODPaymentFactory } from '../../../src/domain/patterns/creational/factory/cod-payment.factory';
import { BankTransferPaymentFactory } from '../../../src/domain/patterns/creational/factory/bank-transfer.factory';

describe('Unit Tests - Creational Patterns (Factory Method & Builder)', () => {
  const customer = new Customer('CUST-01', 'Nguyễn Văn A', 'a@test.com', '0901234567', CustomerTier.VIP);
  const laptop = new Product('PROD-01', 'Laptop Dell XPS 15', 'DELL-XPS-15', 30000000, 10, 'Công nghệ');
  const mouse = new Product('PROD-02', 'Chuột Logitech MX Master 3', 'LOGI-MX3', 2500000, 20, 'Phụ kiện');

  describe('Builder Pattern', () => {
    test('Xây dựng đơn hàng thành công với đầy đủ thuộc tính tùy chọn', () => {
      const order = new OrderBuilder('ORD-TEST-001')
        .setCustomer(customer)
        .addItem(laptop, 1)
        .addItem(mouse, 2)
        .setShippingAddress({
          recipientName: 'Nguyễn Văn A',
          phoneNumber: '0901234567',
          street: '123 Nguyễn Huệ, P. Bến Nghé',
          city: 'TP. Hồ Chí Minh'
        })
        .enableGiftWrap(true)
        .enableInsurance(true)
        .setSpecialNotes('Giao trong giờ hành chính')
        .build();

      expect(order.orderId).toBe('ORD-TEST-001');
      expect(order.items.length).toBe(2);
      expect(order.subtotal).toBe(30000000 * 1 + 2500000 * 2); // 35,000,000đ
      expect(order.withGiftWrap).toBe(true);
      expect(order.withInsurance).toBe(true);
      expect(order.status).toBe(OrderStatus.PENDING);
    });

    test('Ném lỗi khi build đơn hàng thiếu khách hàng hoặc không có sản phẩm', () => {
      const builderNoCust = new OrderBuilder().addItem(mouse, 1);
      expect(() => builderNoCust.build()).toThrow('Thiếu thông tin khách hàng');

      const builderNoItem = new OrderBuilder().setCustomer(customer);
      expect(() => builderNoItem.build()).toThrow('Đơn hàng phải có ít nhất 1 sản phẩm');
    });

    test('Ném lỗi khi số lượng đặt mua vượt quá tồn kho', () => {
      const lowStockProduct = new Product('P-LOW', 'Bàn phím cơ', 'KB-01', 1000000, 2, 'Phụ kiện');
      const builder = new OrderBuilder().setCustomer(customer);
      expect(() => builder.addItem(lowStockProduct, 5)).toThrow('không đủ tồn kho');
    });
  });

  describe('Factory Method Pattern', () => {
    test('CODPaymentFactory tạo ra đúng CODPaymentProcessor và xử lý thanh toán', async () => {
      const factory = new CODPaymentFactory();
      const processor = factory.createPaymentProcessor();
      expect(processor.paymentMethodName).toContain('COD');

      const result = await factory.executePayment(500000, 'ORD-001');
      expect(result.success).toBe(true);
      expect(result.transactionId).toContain('COD-TXN');
    });

    test('Factory Method Template operation ném lỗi khi số tiền <= 0', async () => {
      const factory = new CODPaymentFactory();
      await expect(factory.executePayment(0, 'ORD-INVALID')).rejects.toThrow('lớn hơn 0');
      await expect(factory.executePayment(-1000, 'ORD-INVALID')).rejects.toThrow('lớn hơn 0');
    });

    test('BankTransferPaymentFactory tạo ra đúng BankTransferPaymentProcessor', async () => {
      const factory = new BankTransferPaymentFactory();
      const processor = factory.createPaymentProcessor();
      expect(processor.paymentMethodName).toContain('Ngân hàng');

      const result = await factory.executePayment(1200000, 'ORD-002');
      expect(result.success).toBe(true);
      expect(result.transactionId).toContain('BANK-TXN');
    });
  });
});
