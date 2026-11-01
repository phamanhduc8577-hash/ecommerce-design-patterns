import { IDiscountStrategy, DiscountCalculationResult } from './discount-strategy.interface';
import { Order } from '../../creational/builder/order.entity';
import { CustomerTier } from '../../../entities/customer';

/**
 * Concrete Strategy 1: Khách hàng thông thường (Không áp dụng chiết khấu đặc quyền)
 */
export class RegularCustomerDiscountStrategy implements IDiscountStrategy {
  public readonly strategyName = 'Chính sách Giá Khách hàng Tiêu chuẩn';

  public calculateDiscount(order: Order, currentTotal: number): DiscountCalculationResult {
    return {
      strategyName: this.strategyName,
      originalAmount: currentTotal,
      discountAmount: 0,
      finalAmount: currentTotal,
      description: 'Khách hàng tiêu chuẩn - không có chiết khấu thành viên'
    };
  }
}

/**
 * Concrete Strategy 2: Chiết khấu Thành viên VIP (Giảm 15% tổng hóa đơn)
 */
export class VipMemberDiscountStrategy implements IDiscountStrategy {
  public readonly strategyName = 'Đặc quyền Khách hàng VIP';
  private readonly discountPercent = 0.15; // 15%

  public calculateDiscount(order: Order, currentTotal: number): DiscountCalculationResult {
    const discount = Math.round(currentTotal * this.discountPercent);
    return {
      strategyName: this.strategyName,
      originalAmount: currentTotal,
      discountAmount: discount,
      finalAmount: Math.max(0, currentTotal - discount),
      description: `Giảm giá 15% đặc quyền thẻ VIP cho khách hàng ${order.customer.name}`
    };
  }
}

/**
 * Concrete Strategy 3: Khuyến mãi Dịp Lễ / Flash Sale (Giảm theo bậc giá trị đơn)
 * Ví dụ: Đơn trên 2 triệu giảm 200k, trên 5 triệu giảm 600k
 */
export class HolidayTieredDiscountStrategy implements IDiscountStrategy {
  public readonly strategyName = 'Khuyến mãi Đại tiệc Mua sắm (Flash Sale)';

  public calculateDiscount(order: Order, currentTotal: number): DiscountCalculationResult {
    let discount = 0;
    let desc = '';

    if (currentTotal >= 5000000) {
      discount = 600000;
      desc = 'Flash Sale: Đơn hàng >= 5,000,000đ được giảm ngay 600,000đ';
    } else if (currentTotal >= 2000000) {
      discount = 200000;
      desc = 'Flash Sale: Đơn hàng >= 2,000,000đ được giảm ngay 200,000đ';
    } else {
      discount = 50000;
      desc = 'Flash Sale: Giảm 50,000đ hỗ trợ đơn hàng ngày hội mua sắm';
    }

    return {
      strategyName: this.strategyName,
      originalAmount: currentTotal,
      discountAmount: discount,
      finalAmount: Math.max(0, currentTotal - discount),
      description: desc
    };
  }
}
