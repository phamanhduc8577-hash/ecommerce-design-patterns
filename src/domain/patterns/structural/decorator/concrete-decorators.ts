import { OrderPricingDecorator } from './order-pricing.decorator';
import { IOrderPricing, PriceBreakdown } from './order-pricing.interface';

/**
 * Concrete Decorator: Thêm phí đóng gói quà tặng cao cấp
 */
export class GiftWrapDecorator extends OrderPricingDecorator {
  private readonly giftWrapFee: number;

  constructor(wrappee: IOrderPricing, fee: number = 30000) {
    super(wrappee);
    this.giftWrapFee = fee;
  }

  public override calculateTotal(): number {
    return super.calculateTotal() + this.giftWrapFee;
  }

  public override getBreakdown(): PriceBreakdown[] {
    return [
      ...super.getBreakdown(),
      {
        label: 'Dịch vụ Gói quà cao cấp & Thiệp chúc mừng',
        amount: this.giftWrapFee
      }
    ];
  }
}

/**
 * Concrete Decorator: Thêm bảo hiểm vận chuyển bảo vệ hàng giá trị cao
 */
export class ShippingInsuranceDecorator extends OrderPricingDecorator {
  private readonly insuranceFee: number;

  constructor(wrappee: IOrderPricing, customFee?: number) {
    super(wrappee);
    // Tính phí bảo hiểm cố định 50,000đ hoặc 1% giá trị đơn hàng
    const baseTotal = wrappee.calculateTotal();
    this.insuranceFee = customFee ?? Math.max(50000, Math.round(baseTotal * 0.01));
  }

  public override calculateTotal(): number {
    return super.calculateTotal() + this.insuranceFee;
  }

  public override getBreakdown(): PriceBreakdown[] {
    return [
      ...super.getBreakdown(),
      {
        label: 'Bảo hiểm vận chuyển hàng hóa (Đền bù 100%)',
        amount: this.insuranceFee
      }
    ];
  }
}
