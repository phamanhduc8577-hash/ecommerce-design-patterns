import { Order } from '../../creational/builder/order.entity';

export interface OrderEventPayload {
  order: Order;
  event: 'ORDER_CREATED' | 'ORDER_PAID' | 'ORDER_CANCELLED';
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Observer Interface: Nhận các thông báo cập nhật trạng thái đơn hàng.
 */
export interface IOrderObserver {
  readonly observerName: string;
  update(payload: OrderEventPayload): Promise<void> | void;
}
