import { IPaymentProcessor, PaymentResult } from './payment-processor.interface';

export class CODPaymentProcessor implements IPaymentProcessor {
  public readonly paymentMethodName = 'COD (Thanh toán khi nhận hàng)';

  public async processPayment(amount: number, orderId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `COD-TXN-${Date.now()}-${orderId}`,
      amount,
      paymentMethod: this.paymentMethodName,
      message: `Đơn hàng [${orderId}] đã được ghi nhận thanh toán khi giao hàng (COD) thành công.`,
      timestamp: new Date()
    };
  }
}
