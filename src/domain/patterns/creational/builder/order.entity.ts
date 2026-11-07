import { Customer } from '../../../entities/customer';
import { OrderItem } from '../../../entities/order-item';
import { OrderStatus, ShippingAddress } from '../../../entities/order-types';

export class Order {
  // Khởi tạo chuẩn qua OrderBuilder (Builder Pattern) để đảm bảo tính toàn vẹn dữ liệu.
  // Builder chịu trách nhiệm validate trước khi gọi constructor này.
  constructor(
    public readonly orderId: string,
    public readonly customer: Customer,
    public readonly items: ReadonlyArray<OrderItem>,
    public readonly shippingAddress: ShippingAddress,
    public readonly withGiftWrap: boolean,
    public readonly withInsurance: boolean,
    public readonly specialNotes?: string,
    public status: OrderStatus = OrderStatus.PENDING,
    public paymentTransactionId?: string,
    public cancellationReason?: string
  ) {}

  public get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  public markAsPaid(transactionId: string): void {
    if (this.status === OrderStatus.PAID) {
      throw new Error(`Đơn hàng [${this.orderId}] đã được thanh toán trước đó.`);
    }
    if (this.status === OrderStatus.CANCELLED) {
      throw new Error(`Đơn hàng [${this.orderId}] đã bị huỷ, không thể thanh toán.`);
    }
    this.status = OrderStatus.PAID;
    this.paymentTransactionId = transactionId;
  }

  /** Chuyển đơn sang trạng thái huỷ. Chỉ huỷ được đơn PENDING (chưa huỷ, chưa thanh toán). */
  public markAsCancelled(reason: string): void {
    if (this.status === OrderStatus.CANCELLED) {
      throw new Error(`Đơn hàng [${this.orderId}] đã bị huỷ trước đó.`);
    }
    if (this.status === OrderStatus.PAID) {
      throw new Error(`Đơn hàng [${this.orderId}] đã thanh toán, phải hoàn tiền trước khi huỷ.`);
    }
    this.status = OrderStatus.CANCELLED;
    this.cancellationReason = reason;
  }
}
