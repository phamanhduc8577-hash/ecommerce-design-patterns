import { Customer } from '../../../entities/customer';
import { OrderItem } from '../../../entities/order-item';
import { OrderStatus, ShippingAddress } from '../../../entities/order-types';

export class Order {
  // Private constructor ép buộc khởi tạo qua OrderBuilder
  constructor(
    public readonly orderId: string,
    public readonly customer: Customer,
    public readonly items: ReadonlyArray<OrderItem>,
    public readonly shippingAddress: ShippingAddress,
    public readonly withGiftWrap: boolean,
    public readonly withInsurance: boolean,
    public readonly specialNotes?: string,
    public status: OrderStatus = OrderStatus.PENDING,
    public paymentTransactionId?: string
  ) {}

  public get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  public markAsPaid(transactionId: string): void {
    if (this.status === OrderStatus.PAID) {
      throw new Error(`Đơn hàng [${this.orderId}] đã được thanh toán trước đó.`);
    }
    this.status = OrderStatus.PAID;
    this.paymentTransactionId = transactionId;
  }
}
