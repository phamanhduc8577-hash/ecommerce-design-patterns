import { PaymentProcessorFactory } from './payment-processor.factory';
import { IPaymentProcessor } from './payment-processor.interface';
import { BankTransferPaymentProcessor } from './bank-transfer.processor';

export class BankTransferPaymentFactory extends PaymentProcessorFactory {
  public createPaymentProcessor(): IPaymentProcessor {
    return new BankTransferPaymentProcessor();
  }
}
