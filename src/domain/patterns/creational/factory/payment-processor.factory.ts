import { IPaymentProcessor } from './payment-processor.interface';

/**
 * Creator trừu tượng trong Factory Method Pattern.
 * Định nghĩa phương thức nhà máy (factory method) createPaymentProcessor().
 */
export abstract class PaymentProcessorFactory {
  public abstract createPaymentProcessor(): IPaymentProcessor;

  // Template operation tận dụng đối tượng do Factory Method sinh ra
  public async executePayment(amount: number, orderId: string) {
    const processor = this.createPaymentProcessor();
    return await processor.processPayment(amount, orderId);
  }
}
