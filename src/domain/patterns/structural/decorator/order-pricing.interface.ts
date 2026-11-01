export interface PriceBreakdown {
  label: string;
  amount: number;
}

export interface IOrderPricing {
  calculateTotal(): number;
  getBreakdown(): PriceBreakdown[];
}
