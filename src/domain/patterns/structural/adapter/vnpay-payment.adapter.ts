import { IPaymentProcessor, PaymentResult } from '../../creational/factory/payment-processor.interface';
import { ExternalVNPaySdk } from '../../../../infrastructure/gateways/third-party-payment-sdks';

/**
 * Adapter Pattern: Chuyển đổi giao diện ExternalVNPaySdk sang IPaymentProcessor chuẩn.
 */
export class VNPayPaymentAdapter implements IPaymentProcessor {
  public readonly paymentMethodName = 'Cổng VNPay (Thẻ ATM/QR Pay)';
  private readonly vnpaySdk: ExternalVNPaySdk;

  constructor(sdk?: ExternalVNPaySdk) {
    this.vnpaySdk = sdk || new ExternalVNPaySdk();
  }

  public async processPayment(amount: number, orderId: string): Promise<PaymentResult> {
    // Adapter chuyển đổi tham số từ hệ thống sang chuẩn của VNPay SDK
    const response = this.vnpaySdk.doPaymentGateway({
      vnp_TmnCode: 'MERCHANT_DEMO_CODE',
      vnp_Amount: amount * 100, // VNPay quy chuẩn số tiền nhân 100
      vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
      vnp_TxnRef: orderId
    });

    const isSuccess = response.code === '00';

    return {
      success: isSuccess,
      transactionId: response.vnp_TransactionNo,
      amount,
      paymentMethod: this.paymentMethodName,
      message: response.message,
      timestamp: new Date()
    };
  }
}
