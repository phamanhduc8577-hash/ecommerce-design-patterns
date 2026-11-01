import { Product } from './product';

export class OrderItem {
  constructor(
    public readonly product: Product,
    public readonly quantity: number,
    public readonly unitPrice: number
  ) {
    if (quantity <= 0) {
      throw new Error('Số lượng sản phẩm trong đơn hàng phải lớn hơn 0');
    }
  }

  public get subtotal(): number {
    return this.unitPrice * this.quantity;
  }
}
