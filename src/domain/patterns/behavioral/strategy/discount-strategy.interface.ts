import { Order } from '../../creational/builder/order.entity';

export interface DiscountCalculationResult {
  strategyName: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  description: string;
}

/**
 * Strategy Interface: Định nghĩa họ thuật toán chiết khấu giá cho đơn hàng.
 */
export interface IDiscountStrategy {
  readonly strategyName: string;
  calculateDiscount(order: Order, currentTotal: number): DiscountCalculationResult;
}
