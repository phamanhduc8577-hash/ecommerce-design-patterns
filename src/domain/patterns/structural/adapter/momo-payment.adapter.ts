import { IPaymentProcessor, PaymentResult } from '../../creational/factory/payment-processor.interface';
import { ExternalMoMoSdk } from '../../../../infrastructure/gateways/third-party-payment-sdks';

/**
 * Adapter Pattern: Chuyển đổi giao diện ExternalMoMoSdk sang IPaymentProcessor chuẩn.
 */
export class MoMoPaymentAdapter implements IPaymentProcessor {
  public readonly paymentMethodName = 'Ví Điện Tử MoMo';
  private readonly momoSdk: ExternalMoMoSdk;

  constructor(sdk?: ExternalMoMoSdk) {
    this.momoSdk = sdk || new ExternalMoMoSdk();
  }

  public async processPayment(amount: number, orderId: string): Promise<PaymentResult> {
    const res = this.momoSdk.executeMoMoTransaction({
      partnerCode: 'MOMO_PARTNER_01',
      orderId,
      amount,
      orderInfo: `Thanh toan MoMo cho don ${orderId}`
    });

    const isSuccess = res.status === 0;

    return {
      success: isSuccess,
      transactionId: res.transId,
      amount,
      paymentMethod: this.paymentMethodName,
      message: res.message,
      timestamp: new Date()
    };
  }
}
