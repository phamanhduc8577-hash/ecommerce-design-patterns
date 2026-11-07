import { PaymentProcessorFactory } from '../../creational/factory/payment-processor.factory';
import { IPaymentProcessor } from '../../creational/factory/payment-processor.interface';
import { IVNPayGateway, IMoMoGateway } from './payment-gateway.interfaces';
import { VNPayPaymentAdapter } from './vnpay-payment.adapter';
import { MoMoPaymentAdapter } from './momo-payment.adapter';

/**
 * Factory nhận gateway (port Domain) qua constructor - tầng ngoài (Infrastructure/Presentation)
 * chịu trách nhiệm tiêm SDK cụ thể vào. Nhờ đó cả Factory lẫn Adapter đều không phụ thuộc Infrastructure.
 */
export class VNPayPaymentFactory extends PaymentProcessorFactory {
  constructor(private readonly gateway: IVNPayGateway) {
    super();
  }

  public createPaymentProcessor(): IPaymentProcessor {
    return new VNPayPaymentAdapter(this.gateway);
  }
}

export class MoMoPaymentFactory extends PaymentProcessorFactory {
  constructor(private readonly gateway: IMoMoGateway) {
    super();
  }

  public createPaymentProcessor(): IPaymentProcessor {
    return new MoMoPaymentAdapter(this.gateway);
  }
}
