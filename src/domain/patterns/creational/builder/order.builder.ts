import { Customer } from '../../../entities/customer';
import { OrderItem } from '../../../entities/order-item';
import { Product } from '../../../entities/product';
import { ShippingAddress } from '../../../entities/order-types';
import { Order } from './order.entity';

export interface IOrderBuilder {
  setCustomer(customer: Customer): this;
  addItem(product: Product, quantity: number): this;
  setShippingAddress(address: ShippingAddress): this;
  enableGiftWrap(enable?: boolean): this;
  enableInsurance(enable?: boolean): this;
  setSpecialNotes(notes: string): this;
  build(): Order;
}

export class OrderBuilder implements IOrderBuilder {
  private orderId: string;
  private customer?: Customer;
  private items: OrderItem[] = [];
  private shippingAddress?: ShippingAddress;
  private giftWrap: boolean = false;
  private insurance: boolean = false;
  private specialNotes?: string;

  constructor(customOrderId?: string) {
    this.orderId = customOrderId || `ORD-${Date.now().toString().slice(-6)}`;
  }

  public setCustomer(customer: Customer): this {
    this.customer = customer;
    return this;
  }

  public addItem(product: Product, quantity: number): this {
    if (quantity <= 0) {
      throw new Error(`Số lượng thêm cho sản phẩm [${product.name}] phải > 0`);
    }
    // Tích lũy số lượng đã đặt của cùng sản phẩm để kiểm tra tồn kho đúng (tránh bán vượt kho).
    const alreadyOrdered = this.items
      .filter(i => i.product.id === product.id)
      .reduce((sum, i) => sum + i.quantity, 0);
    if (!product.hasStock(alreadyOrdered + quantity)) {
      throw new Error(
        `Sản phẩm [${product.name}] không đủ tồn kho (chỉ còn ${product.stockQuantity}, ` +
        `đã đặt ${alreadyOrdered}, yêu cầu thêm ${quantity})`
      );
    }
    const item = new OrderItem(product, quantity, product.price);
    this.items.push(item);
    return this;
  }

  public setShippingAddress(address: ShippingAddress): this {
    if (!address.recipientName || !address.phoneNumber || !address.street || !address.city) {
      throw new Error('Địa chỉ giao hàng thiếu các thông tin bắt buộc');
    }
    this.shippingAddress = address;
    return this;
  }

  public enableGiftWrap(enable: boolean = true): this {
    this.giftWrap = enable;
    return this;
  }

  public enableInsurance(enable: boolean = true): this {
    this.insurance = enable;
    return this;
  }

  public setSpecialNotes(notes: string): this {
    this.specialNotes = notes;
    return this;
  }

  public build(): Order {
    if (!this.customer) {
      throw new Error('Không thể tạo đơn hàng: Thiếu thông tin khách hàng.');
    }
    if (this.items.length === 0) {
      throw new Error('Không thể tạo đơn hàng: Đơn hàng phải có ít nhất 1 sản phẩm.');
    }
    if (!this.shippingAddress) {
      throw new Error('Không thể tạo đơn hàng: Thiếu địa chỉ nhận hàng.');
    }

    return new Order(
      this.orderId,
      this.customer,
      [...this.items],
      this.shippingAddress,
      this.giftWrap,
      this.insurance,
      this.specialNotes
    );
  }
}
