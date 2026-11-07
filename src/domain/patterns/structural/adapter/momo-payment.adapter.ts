import { IPaymentProcessor, PaymentResult } from '../../creational/factory/payment-processor.interface';
import { IMoMoGateway } from './payment-gateway.interfaces';

/**
 * Adapter Pattern: Chuyển đổi giao diện cổng MoMo (port `IMoMoGateway` của Domain)
 * sang chuẩn `IPaymentProcessor`. Gateway cụ thể tiêm qua constructor (DIP).
 */
export class MoMoPaymentAdapter implements IPaymentProcessor {
  public readonly paymentMethodName = 'Ví Điện Tử MoMo';

  constructor(private readonly momoSdk: IMoMoGateway) {}

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
