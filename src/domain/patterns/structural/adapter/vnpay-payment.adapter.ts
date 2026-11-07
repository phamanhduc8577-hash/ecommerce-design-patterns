import { IPaymentProcessor, PaymentResult } from '../../creational/factory/payment-processor.interface';
import { IVNPayGateway } from './payment-gateway.interfaces';

/**
 * Adapter Pattern: Chuyển đổi giao diện cổng VNPay (port `IVNPayGateway` của Domain)
 * sang chuẩn `IPaymentProcessor` của hệ thống.
 *
 * Adapter chỉ phụ thuộc abstraction `IVNPayGateway` (DIP) — gateway cụ thể được tiêm vào
 * qua constructor từ tầng ngoài (Factory/Infrastructure), nên Domain không phụ thuộc Infrastructure.
 */
export class VNPayPaymentAdapter implements IPaymentProcessor {
  public readonly paymentMethodName = 'Cổng VNPay (Thẻ ATM/QR Pay)';

  constructor(private readonly vnpaySdk: IVNPayGateway) {}

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
