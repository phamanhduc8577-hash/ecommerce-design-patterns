import { Order } from '../../domain/patterns/creational/builder/order.entity';
import { IOrderPricing } from '../../domain/patterns/structural/decorator/order-pricing.interface';
import { BaseOrderPricing } from '../../domain/patterns/structural/decorator/base-order.pricing';
import { GiftWrapDecorator, ShippingInsuranceDecorator } from '../../domain/patterns/structural/decorator/concrete-decorators';
import { IDiscountStrategy } from '../../domain/patterns/behavioral/strategy/discount-strategy.interface';
import { RegularCustomerDiscountStrategy } from '../../domain/patterns/behavioral/strategy/concrete-discount.strategies';
import { PaymentProcessorFactory } from '../../domain/patterns/creational/factory/payment-processor.factory';
import { OrderEventPublisher } from '../../domain/patterns/behavioral/observer/order-event.publisher';
import { PaymentResult } from '../../domain/patterns/creational/factory/payment-processor.interface';

export interface CheckoutResult {
  order: Order;
  pricingBreakdown: Array<{ label: string; amount: number }>;
  discountDetails: {
    strategy: string;
    discountAmount: number;
    description: string;
  };
  totalBeforeDiscount: number;
  finalPayableAmount: number;
  paymentResult: PaymentResult;
}

/**
 * Application Service: Điều phối luồng xử lý đơn hàng kết hợp mượt mà cả 6 Design Patterns.
 */
export class OrderCheckoutService {
  constructor(private readonly eventPublisher: OrderEventPublisher) {}

  public async checkout(
    order: Order,
    discountStrategy: IDiscountStrategy = new RegularCustomerDiscountStrategy(),
    paymentFactory: PaymentProcessorFactory
  ): Promise<CheckoutResult> {
    // 1. Áp dụng Structural Pattern: Decorator để tính toán các chi phí dịch vụ giá trị gia tăng
    let pricing: IOrderPricing = new BaseOrderPricing(order);

    if (order.withGiftWrap) {
      pricing = new GiftWrapDecorator(pricing);
    }
    if (order.withInsurance) {
      pricing = new ShippingInsuranceDecorator(pricing);
    }

    const subtotalWithServices = pricing.calculateTotal();
    const pricingBreakdown = pricing.getBreakdown();

    // 2. Áp dụng Behavioral Pattern: Strategy để tính chiết khấu khuyến mãi/hạng khách hàng
    const discountResult = discountStrategy.calculateDiscount(order, subtotalWithServices);
    const finalAmount = discountResult.finalAmount;

    // 3. Áp dụng Creational: Factory Method & Structural: Adapter để thực hiện thanh toán
    const paymentProcessor = paymentFactory.createPaymentProcessor();
    const paymentResult = await paymentProcessor.processPayment(finalAmount, order.orderId);

    if (!paymentResult.success) {
      throw new Error(`Thanh toán thất bại: ${paymentResult.message}`);
    }

    // Cập nhật trạng thái đơn hàng sang PAID
    order.markAsPaid(paymentResult.transactionId);

    // 4. Áp dụng Behavioral Pattern: Observer để phát sự kiện sang kho hàng và dịch vụ thông báo
    await this.eventPublisher.notify({
      order,
      event: 'ORDER_PAID',
      timestamp: new Date(),
      metadata: { paymentMethod: paymentProcessor.paymentMethodName }
    });

    return {
      order,
      pricingBreakdown,
      discountDetails: {
        strategy: discountResult.strategyName,
        discountAmount: discountResult.discountAmount,
        description: discountResult.description
      },
      totalBeforeDiscount: subtotalWithServices,
      finalPayableAmount: finalAmount,
      paymentResult
    };
  }
}
