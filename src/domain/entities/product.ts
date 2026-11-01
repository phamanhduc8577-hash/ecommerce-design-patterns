export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly sku: string,
    public price: number,
    public stockQuantity: number,
    public readonly category: string
  ) {}

  public hasStock(quantity: number): boolean {
    return this.stockQuantity >= quantity;
  }

  public deductStock(quantity: number): void {
    if (!this.hasStock(quantity)) {
      throw new Error(`Sản phẩm [${this.name}] không đủ số lượng tồn kho (hiện có: ${this.stockQuantity}, yêu cầu: ${quantity})`);
    }
    this.stockQuantity -= quantity;
  }
}
