import { IOrderObserver, OrderEventPayload } from './order-observer.interface';

/**
 * Concrete Observer 1: Đồng bộ tồn kho theo vòng đời đơn hàng.
 * - ORDER_PAID: trừ kho các sản phẩm đã bán.
 * - ORDER_CANCELLED: hoàn lại CHÍNH xác số lượng đã trừ cho đơn đó.
 *
 * Lưu ý mô hình: tồn kho chỉ bị trừ tại thời điểm ORDER_PAID (không giữ chỗ lúc dựng đơn).
 * Do đó chỉ hoàn kho cho những đơn đã từng trừ kho (đã PAID). Huỷ một đơn PENDING
 * (chưa trừ kho) sẽ không cộng ảo tồn kho - tránh lỗi kho tăng vô căn cứ.
 */
export class InventoryUpdateObserver implements IOrderObserver {
  public readonly observerName = 'Hệ thống Quản lý Tồn kho (Inventory)';
  public lastProcessedOrderId?: string;
  public lastRestoredOrderId?: string;
  // Ghi nhớ các đơn đã thực sự bị trừ kho để chỉ hoàn đúng những đơn đó.
  private deductedOrderIds = new Set<string>();

  public update(payload: OrderEventPayload): void {
    if (payload.event === 'ORDER_PAID') {
      for (const item of payload.order.items) {
        item.product.deductStock(item.quantity);
      }
      this.deductedOrderIds.add(payload.order.orderId);
      this.lastProcessedOrderId = payload.order.orderId;
      return;
    }

    if (payload.event === 'ORDER_CANCELLED') {
      // Chỉ hoàn kho nếu đơn này đã từng bị trừ (đã PAID). Đơn PENDING chưa trừ kho -> bỏ qua.
      if (!this.deductedOrderIds.has(payload.order.orderId)) {
        return;
      }
      for (const item of payload.order.items) {
        item.product.restoreStock(item.quantity);
      }
      this.deductedOrderIds.delete(payload.order.orderId);
      this.lastRestoredOrderId = payload.order.orderId;
    }
  }
}
