import { PaymentProcessorFactory } from '../../creational/factory/payment-processor.factory';
import { IPaymentProcessor } from '../../creational/factory/payment-processor.interface';
import { VNPayPaymentAdapter } from './vnpay-payment.adapter';
import { MoMoPaymentAdapter } from './momo-payment.adapter';

export class VNPayPaymentFactory extends PaymentProcessorFactory {
  public createPaymentProcessor(): IPaymentProcessor {
    return new VNPayPaymentAdapter();
  }
}

export class MoMoPaymentFactory extends PaymentProcessorFactory {
  public createPaymentProcessor(): IPaymentProcessor {
    return new MoMoPaymentAdapter();
  }
}
