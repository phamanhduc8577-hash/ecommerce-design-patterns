import { PaymentProcessorFactory } from './payment-processor.factory';
import { IPaymentProcessor } from './payment-processor.interface';
import { CODPaymentProcessor } from './cod-payment.processor';

export class CODPaymentFactory extends PaymentProcessorFactory {
  public createPaymentProcessor(): IPaymentProcessor {
    return new CODPaymentProcessor();
  }
}
