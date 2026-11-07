import { IOrderObserver, OrderEventPayload } from '../../domain/patterns/behavioral/observer/order-observer.interface';

/**
 * Concrete Observer (Infrastructure): Gửi Email xác nhận đơn hàng kèm hóa đơn điện tử cho khách hàng.
 * Đặt ở tầng Infrastructure vì gửi email là giao tiếp với dịch vụ ngoại vi, không thuộc logic nghiệp vụ lõi.
 */
export class EmailNotificationObserver implements IOrderObserver {
  public readonly observerName = 'Hệ thống Gửi Email Hóa đơn (Email Service)';
  public sentEmails: Array<{ to: string; subject: string; body: string }> = [];

  public update(payload: OrderEventPayload): void {
    if (payload.event === 'ORDER_PAID') {
      this.sentEmails.push({
        to: payload.order.customer.email,
        subject: `[E-Shop] Xác nhận Đơn hàng #${payload.order.orderId} đã thanh toán thành công!`,
        body: `Kính gửi ${payload.order.customer.name}, đơn hàng gồm ${payload.order.items.length} món với mã GD [${payload.order.paymentTransactionId}] đã sẵn sàng được đóng gói.`
      });
      return;
    }

    if (payload.event === 'ORDER_CANCELLED') {
      this.sentEmails.push({
        to: payload.order.customer.email,
        subject: `[E-Shop] Đơn hàng #${payload.order.orderId} đã được huỷ`,
        body: `Kính gửi ${payload.order.customer.name}, đơn hàng đã huỷ với lý do: ${payload.order.cancellationReason ?? 'không nêu'}. Tiền sẽ được hoàn theo chính sách.`
      });
    }
  }
}

/**
 * Concrete Observer (Infrastructure): Gửi tin nhắn SMS mã vận đơn đến số điện thoại người nhận.
 */
export class SmsNotificationObserver implements IOrderObserver {
  public readonly observerName = 'Cổng Viễn thông Gửi SMS (SMS Gateway)';
  public sentSms: Array<{ phone: string; message: string }> = [];

  public update(payload: OrderEventPayload): void {
    if (payload.event === 'ORDER_PAID') {
      this.sentSms.push({
        phone: payload.order.shippingAddress.phoneNumber,
        message: `E-Shop: Don #${payload.order.orderId} da TT thanh cong. Hang se giao den ${payload.order.shippingAddress.city}.`
      });
      return;
    }

    if (payload.event === 'ORDER_CANCELLED') {
      this.sentSms.push({
        phone: payload.order.shippingAddress.phoneNumber,
        message: `E-Shop: Don #${payload.order.orderId} da bi huy. Lien he hotline de duoc ho tro.`
      });
    }
  }
}
