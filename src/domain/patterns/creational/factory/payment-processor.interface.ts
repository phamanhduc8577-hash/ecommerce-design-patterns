export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  message: string;
  timestamp: Date;
}

export interface IPaymentProcessor {
  readonly paymentMethodName: string;
  processPayment(amount: number, orderId: string): Promise<PaymentResult>;
}
