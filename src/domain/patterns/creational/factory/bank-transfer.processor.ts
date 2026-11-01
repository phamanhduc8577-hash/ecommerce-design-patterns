import { IPaymentProcessor, PaymentResult } from './payment-processor.interface';

export class BankTransferPaymentProcessor implements IPaymentProcessor {
  public readonly paymentMethodName = 'Chuyển khoản Ngân hàng Trực tiếp (Direct Banking)';

  public async processPayment(amount: number, orderId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `BANK-TXN-${Date.now()}-${orderId}`,
      amount,
      paymentMethod: this.paymentMethodName,
      message: `Đã xác nhận tiền chuyển khoản thành công cho đơn [${orderId}].`,
      timestamp: new Date()
    };
  }
}
