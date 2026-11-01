import { IPaymentProcessor, PaymentResult } from './payment-processor.interface';

/**
 * Creator trừu tượng trong Factory Method Pattern (GoF).
 * - Định nghĩa Factory Method: createPaymentProcessor().
 * - Cung cấp Template Method: executePayment() chứa quy trình nghiệp vụ chuẩn
 *   (chuẩn bị, xác thực, ủy quyền bộ xử lý con và ghi nhận giao dịch).
 */
export abstract class PaymentProcessorFactory {
  /**
   * Factory Method: Các lớp con (subclasses) bắt buộc phải override
   * để trả về đối tượng IPaymentProcessor cụ thể.
   */
  public abstract createPaymentProcessor(): IPaymentProcessor;

  /**
   * Template Method trong Factory Method Pattern:
   * Định hình khung xương thuật toán thanh toán của hệ thống.
   */
  public async executePayment(amount: number, orderId: string): Promise<PaymentResult> {
    if (amount <= 0) {
      throw new Error(`Số tiền thanh toán cho đơn hàng [${orderId}] phải lớn hơn 0`);
    }

    // 1. Gọi Factory Method để tạo ra Processor tương ứng
    const processor = this.createPaymentProcessor();

    // 2. Tiền xử lý / Log nghiệp vụ (Hook chuẩn bị)
    const startedAt = new Date();

    // 3. Thực thi thanh toán qua Processor
    const result = await processor.processPayment(amount, orderId);

    // 4. Hậu xử lý / Gắn timestamp & chuẩn hóa kết quả
    if (!result.timestamp) {
      result.timestamp = startedAt;
    }

    return result;
  }
}
