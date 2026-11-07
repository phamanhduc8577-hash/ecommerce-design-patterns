import { Customer, CustomerTier } from '../../../src/domain/entities/customer';
import { Product } from '../../../src/domain/entities/product';
import { OrderItem } from '../../../src/domain/entities/order-item';
import { OrderBuilder } from '../../../src/domain/patterns/creational/builder/order.builder';
import { OrderEventPublisher } from '../../../src/domain/patterns/behavioral/observer/order-event.publisher';
import { MoMoPaymentFactory } from '../../../src/domain/patterns/structural/adapter/adapter-factories';
import { ExternalMoMoSdk } from '../../../src/infrastructure/gateways/third-party-payment-sdks';
import { PaymentProcessorFactory } from '../../../src/domain/patterns/creational/factory/payment-processor.factory';
import { IPaymentProcessor, PaymentResult } from '../../../src/domain/patterns/creational/factory/payment-processor.interface';

describe('Unit Tests - Domain Edge Cases (Validation & Fallback)', () => {
  const customer = new Customer('C-EDGE', 'Khách biên', 'edge@test.com', '0900000000', CustomerTier.REGULAR);
  const addr = { recipientName: 'A', phoneNumber: '0900000000', street: 'X', city: 'HCM' };
  const makeProduct = () => new Product('P-EDGE', 'Hàng biên', 'SKU-EDGE', 1000000, 10, 'Công nghệ');

  describe('Validation của Builder và Entity', () => {
    test('addItem với số lượng <= 0 bị từ chối', () => {
      const builder = new OrderBuilder().setCustomer(customer);
      expect(() => builder.addItem(makeProduct(), 0)).toThrow('phải > 0');
      expect(() => builder.addItem(makeProduct(), -2)).toThrow('phải > 0');
    });

    test('setShippingAddress thiếu thông tin bắt buộc bị từ chối', () => {
      const builder = new OrderBuilder().setCustomer(customer);
      expect(() => builder.setShippingAddress({ ...addr, recipientName: '' })).toThrow('thiếu các thông tin bắt buộc');
      expect(() => builder.setShippingAddress({ ...addr, phoneNumber: '' })).toThrow('thiếu các thông tin bắt buộc');
      expect(() => builder.setShippingAddress({ ...addr, street: '' })).toThrow('thiếu các thông tin bắt buộc');
      expect(() => builder.setShippingAddress({ ...addr, city: '' })).toThrow('thiếu các thông tin bắt buộc');
    });

    test('build() thiếu địa chỉ giao hàng bị từ chối', () => {
      const builder = new OrderBuilder().setCustomer(customer).addItem(makeProduct(), 1);
      expect(() => builder.build()).toThrow('Thiếu địa chỉ nhận hàng');
    });

    test('OrderItem với số lượng <= 0 bị từ chối ngay ở constructor', () => {
      expect(() => new OrderItem(makeProduct(), 0, 1000000)).toThrow('phải lớn hơn 0');
    });

    test('enableGiftWrap/enableInsurance gọi không tham số mặc định bật dịch vụ', () => {
      const order = new OrderBuilder('ORD-DEFAULT-OPT')
        .setCustomer(customer)
        .addItem(makeProduct(), 1)
        .setShippingAddress(addr)
        .enableGiftWrap()    // không truyền tham số -> mặc định true
        .enableInsurance()
        .build();

      expect(order.withGiftWrap).toBe(true);
      expect(order.withInsurance).toBe(true);
    });

    test('markAsPaid gọi 2 lần ở tầng Entity bị chặn', () => {
      const order = new OrderBuilder('ORD-ENTITY-DUP')
        .setCustomer(customer).addItem(makeProduct(), 1).setShippingAddress(addr).build();

      order.markAsPaid('TXN-1');
      expect(() => order.markAsPaid('TXN-2')).toThrow('đã được thanh toán trước đó');
      expect(order.paymentTransactionId).toBe('TXN-1'); // mã giao dịch đầu được giữ nguyên
    });

    test('restoreStock với số lượng <= 0 bị từ chối', () => {
      expect(() => makeProduct().restoreStock(0)).toThrow('phải lớn hơn 0');
    });
  });

  describe('Observer Publisher - xử lý lỗi không chuẩn', () => {
    test('Observer ném lỗi không phải Error vẫn được ghi nhận với thông điệp mặc định', async () => {
      const publisher = new OrderEventPublisher();
      publisher.attach({
        observerName: 'Observer ném chuỗi',
        update: () => { throw 'lỗi dạng chuỗi'; } // không phải Error -> không có .message
      });

      const order = new OrderBuilder('ORD-EDGE-OBS')
        .setCustomer(customer).addItem(makeProduct(), 1).setShippingAddress(addr).build();

      const results = await publisher.notify({ order, event: 'ORDER_PAID', timestamp: new Date() });
      expect(results[0].success).toBe(false);
      expect(results[0].error).toBe('Lỗi không xác định khi cập nhật Observer');
    });

    test('Email huỷ đơn dùng thông điệp mặc định khi không có lý do huỷ', async () => {
      const { EmailNotificationObserver } = await import('../../../src/infrastructure/observers/notification.observers');
      const emailObs = new EmailNotificationObserver();
      const order = new OrderBuilder('ORD-NO-REASON')
        .setCustomer(customer).addItem(makeProduct(), 1).setShippingAddress(addr).build();

      // Phát sự kiện huỷ trực tiếp, đơn chưa có cancellationReason
      emailObs.update({ order, event: 'ORDER_CANCELLED', timestamp: new Date() });
      expect(emailObs.sentEmails[0].body).toContain('không nêu');
    });

    test('attach cùng observerName 2 lần chỉ đăng ký 1 lần (chống trùng)', () => {
      const publisher = new OrderEventPublisher();
      const obs = { observerName: 'Trùng tên', update: () => {} };
      publisher.attach(obs);
      publisher.attach({ ...obs });
      expect(publisher.getObserversCount()).toBe(1);
    });
  });

  describe('Factory Method - Template Method và Adapter Factory', () => {
    test('MoMoPaymentFactory tạo đúng MoMoPaymentAdapter và thanh toán thành công', async () => {
      const factory = new MoMoPaymentFactory(new ExternalMoMoSdk());
      expect(factory.createPaymentProcessor().paymentMethodName).toContain('MoMo');

      const result = await factory.executePayment(2000000, 'ORD-MOMO-FAC');
      expect(result.success).toBe(true);
      expect(result.transactionId).toContain('MOMO');
    });

    test('Template Method giữ nguyên timestamp nếu Processor đã tự gán', async () => {
      const fixedDate = new Date('2026-01-01T00:00:00.000Z');

      class TimestampedFactory extends PaymentProcessorFactory {
        public createPaymentProcessor(): IPaymentProcessor {
          return {
            paymentMethodName: 'Cổng có timestamp sẵn',
            async processPayment(amount: number, orderId: string): Promise<PaymentResult> {
              return {
                success: true,
                transactionId: `TXN-${orderId}`,
                amount,
                paymentMethod: 'Cổng có timestamp sẵn',
                message: 'OK',
                timestamp: fixedDate
              };
            }
          };
        }
      }

      const result = await new TimestampedFactory().executePayment(100000, 'ORD-TS');
      expect(result.timestamp).toBe(fixedDate); // không bị Template Method ghi đè
    });

    test('Template Method tự gán timestamp khi Processor bỏ trống', async () => {
      class NoTimestampFactory extends PaymentProcessorFactory {
        public createPaymentProcessor(): IPaymentProcessor {
          return {
            paymentMethodName: 'Cổng không gán timestamp',
            async processPayment(amount: number, orderId: string): Promise<PaymentResult> {
              // Cố tình bỏ trống timestamp để kiểm nhánh hậu xử lý của Template Method
              return {
                success: true,
                transactionId: `TXN-${orderId}`,
                amount,
                paymentMethod: 'Cổng không gán timestamp',
                message: 'OK'
              } as PaymentResult;
            }
          };
        }
      }

      const result = await new NoTimestampFactory().executePayment(100000, 'ORD-NO-TS');
      expect(result.timestamp).toBeInstanceOf(Date); // Template Method đã bù timestamp
    });
  });
});
