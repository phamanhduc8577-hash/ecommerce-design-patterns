import { IOrderObserver, OrderEventPayload } from './order-observer.interface';

/**
 * Concrete Observer 1: Tự động trừ số lượng tồn kho sản phẩm khi đơn hàng đã thanh toán.
 */
export class InventoryUpdateObserver implements IOrderObserver {
  public readonly observerName = 'Hệ thống Quản lý Tồn kho (Inventory)';
  public lastProcessedOrderId?: string;

  public update(payload: OrderEventPayload): void {
    if (payload.event === 'ORDER_PAID') {
      for (const item of payload.order.items) {
        item.product.deductStock(item.quantity);
      }
      this.lastProcessedOrderId = payload.order.orderId;
    }
  }
}

/**
 * Concrete Observer 2: Gửi Email xác nhận đơn hàng kèm hóa đơn điện tử cho khách hàng.
 */
export class EmailNotificationObserver implements IOrderObserver {
  public readonly observerName = 'Hệ thống Gửi Email Hóa đơn (Email Service)';
  public sentEmails: Array<{ to: string; subject: string; body: string }> = [];

  public update(payload: OrderEventPayload): void {
    if (payload.event === 'ORDER_PAID') {
      const email = {
        to: payload.order.customer.email,
        subject: `[E-Shop] Xác nhận Đơn hàng #${payload.order.orderId} đã thanh toán thành công!`,
        body: `Kính gửi ${payload.order.customer.name}, đơn hàng gồm ${payload.order.items.length} món với mã GD [${payload.order.paymentTransactionId}] đã sẵn sàng được đóng gói.`
      };
      this.sentEmails.push(email);
    }
  }
}

/**
 * Concrete Observer 3: Gửi tin nhắn SMS cảnh báo và mã vận đơn đến số điện thoại người nhận.
 */
export class SmsNotificationObserver implements IOrderObserver {
  public readonly observerName = 'Cổng Viễn thông Gửi SMS (SMS Gateway)';
  public sentSms: Array<{ phone: string; message: string }> = [];

  public update(payload: OrderEventPayload): void {
    if (payload.event === 'ORDER_PAID') {
      const sms = {
        phone: payload.order.shippingAddress.phoneNumber,
        message: `E-Shop: Don #${payload.order.orderId} da TT thanh cong. Hang se giao den ${payload.order.shippingAddress.city}.`
      };
      this.sentSms.push(sms);
    }
  }
}
