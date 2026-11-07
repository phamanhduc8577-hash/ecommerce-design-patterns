import { Order } from '../../domain/patterns/creational/builder/order.entity';
import { IOrderPricing } from '../../domain/patterns/structural/decorator/order-pricing.interface';
import { BaseOrderPricing } from '../../domain/patterns/structural/decorator/base-order.pricing';
import { GiftWrapDecorator, ShippingInsuranceDecorator } from '../../domain/patterns/structural/decorator/concrete-decorators';
import { IDiscountStrategy } from '../../domain/patterns/behavioral/strategy/discount-strategy.interface';
import { PaymentProcessorFactory } from '../../domain/patterns/creational/factory/payment-processor.factory';
import { IOrderEventPublisher } from '../../domain/patterns/behavioral/observer/order-event.publisher';
import { PaymentResult } from '../../domain/patterns/creational/factory/payment-processor.interface';
import { ObserverNotificationResult } from '../../domain/patterns/behavioral/observer/order-observer.interface';
import { OrderStatus } from '../../domain/entities/order-types';

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
  observerResults: ObserverNotificationResult[];
  // Cờ cảnh báo: có observer thất bại (vd trừ kho lỗi) dù đơn đã thu tiền thành công.
  hasObserverFailure: boolean;
  failedObservers: string[];
}

export interface CancellationResult {
  order: Order;
  reason: string;
  observerResults: ObserverNotificationResult[];
  hasObserverFailure: boolean;
  failedObservers: string[];
}

/**
 * Application Service: Điều phối luồng xử lý đơn hàng kết hợp mượt mà cả 6 Design Patterns.
 */
export class OrderCheckoutService {
  // Phụ thuộc abstraction IOrderEventPublisher (DIP), không phụ thuộc lớp cụ thể.
  constructor(private readonly eventPublisher: IOrderEventPublisher) {}

  public async checkout(
    order: Order,
    discountStrategy: IDiscountStrategy,
    paymentFactory: PaymentProcessorFactory
  ): Promise<CheckoutResult> {
    // 0. Chỉ checkout được đơn đang PENDING. Chặn cả đơn đã PAID (thu tiền trùng)
    //    lẫn đơn đã CANCELLED (tránh gọi cổng thanh toán rồi mới ném lỗi).
    if (order.status !== OrderStatus.PENDING) {
      throw new Error(
        `Đơn hàng [${order.orderId}] đang ở trạng thái ${order.status}, chỉ checkout được đơn PENDING.`
      );
    }

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

    // 3. Áp dụng Creational: Factory Method & Structural: Adapter để thực hiện thanh toán.
    //    Chặn số tiền không hợp lệ (<= 0) trước khi gọi cổng - tránh ghi nhận giao dịch 0đ "thành công".
    if (finalAmount <= 0) {
      throw new Error(`Số tiền thanh toán cho đơn [${order.orderId}] phải lớn hơn 0 (hiện tại: ${finalAmount}).`);
    }
    const paymentProcessor = paymentFactory.createPaymentProcessor();
    const paymentResult = await paymentProcessor.processPayment(finalAmount, order.orderId);

    if (!paymentResult.success) {
      throw new Error(`Thanh toán thất bại: ${paymentResult.message}`);
    }

    // Cập nhật trạng thái đơn hàng sang PAID
    order.markAsPaid(paymentResult.transactionId);

    // 4. Áp dụng Behavioral Pattern: Observer để phát sự kiện sang kho hàng và dịch vụ thông báo
    const observerResults = await this.eventPublisher.notify({
      order,
      event: 'ORDER_PAID',
      timestamp: new Date(),
      metadata: { paymentMethod: paymentProcessor.paymentMethodName }
    });

    // Tổng hợp các observer thất bại để tầng trên biết và xử lý bù (không nuốt lỗi âm thầm).
    const failedObservers = observerResults.filter(r => !r.success).map(r => r.observerName);

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
      paymentResult,
      observerResults,
      hasObserverFailure: failedObservers.length > 0,
      failedObservers
    };
  }

  /**
   * Huỷ đơn hàng và phát sự kiện ORDER_CANCELLED.
   * Cùng một Publisher nhưng khác loại sự kiện, các Observer tự quyết định cách phản ứng
   * (Inventory hoàn kho, Email/SMS gửi thông báo huỷ) - minh chứng sức mạnh của Observer Pattern.
   */
  public async cancelOrder(order: Order, reason: string): Promise<CancellationResult> {
    // Đơn đã thanh toán cần quy trình hoàn tiền riêng, không huỷ trực tiếp ở luồng này.
    if (order.status === OrderStatus.PAID) {
      throw new Error(
        `Đơn hàng [${order.orderId}] đã thanh toán, phải thực hiện quy trình hoàn tiền trước khi huỷ.`
      );
    }

    order.markAsCancelled(reason);

    const observerResults = await this.eventPublisher.notify({
      order,
      event: 'ORDER_CANCELLED',
      timestamp: new Date(),
      metadata: { reason }
    });

    const failedObservers = observerResults.filter(r => !r.success).map(r => r.observerName);

    return {
      order,
      reason,
      observerResults,
      hasObserverFailure: failedObservers.length > 0,
      failedObservers
    };
  }
}
