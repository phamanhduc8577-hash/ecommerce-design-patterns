import { IOrderPricing, PriceBreakdown } from './order-pricing.interface';

/**
 * Base Decorator: Duy trì tham chiếu đến đối tượng IOrderPricing được bọc.
 */
export abstract class OrderPricingDecorator implements IOrderPricing {
  constructor(protected readonly wrappee: IOrderPricing) {}

  public calculateTotal(): number {
    return this.wrappee.calculateTotal();
  }

  public getBreakdown(): PriceBreakdown[] {
    return this.wrappee.getBreakdown();
  }
}
