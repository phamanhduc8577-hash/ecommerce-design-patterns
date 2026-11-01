import { IOrderPricing, PriceBreakdown } from './order-pricing.interface';
import { Order } from '../../creational/builder/order.entity';

/**
 * Concrete Component: Tính giá cơ sở của đơn hàng từ các OrderItem.
 */
export class BaseOrderPricing implements IOrderPricing {
  constructor(private readonly order: Order) {}

  public calculateTotal(): number {
    return this.order.subtotal;
  }

  public getBreakdown(): PriceBreakdown[] {
    return [
      {
        label: `Tiền hàng cơ bản (${this.order.items.length} món)`,
        amount: this.order.subtotal
      }
    ];
  }
}
