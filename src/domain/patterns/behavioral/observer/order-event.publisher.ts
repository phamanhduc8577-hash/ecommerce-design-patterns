import { IOrderObserver, OrderEventPayload, ObserverNotificationResult } from './order-observer.interface';

/**
 * Subject trong Observer Pattern: Quản lý danh sách người quan sát và phát thông báo.
 * Tích hợp cơ chế chịu lỗi (Fault-Tolerance): Lỗi từ một Observer ngoại vi không làm sụp toàn bộ chu trình.
 */
export class OrderEventPublisher {
  private observers: IOrderObserver[] = [];

  public attach(observer: IOrderObserver): void {
    const exists = this.observers.some(obs => obs.observerName === observer.observerName);
    if (!exists) {
      this.observers.push(observer);
    }
  }

  public detach(observerName: string): void {
    this.observers = this.observers.filter(obs => obs.observerName !== observerName);
  }

  public getObserversCount(): number {
    return this.observers.length;
  }

  /**
   * Phát thông báo đến tất cả Observers.
   * Sử dụng try/catch độc lập cho từng Observer để đảm bảo các Observer khác vẫn nhận được thông báo.
   */
  public async notify(payload: OrderEventPayload): Promise<ObserverNotificationResult[]> {
    const results: ObserverNotificationResult[] = [];

    for (const observer of this.observers) {
      try {
        await observer.update(payload);
        results.push({
          observerName: observer.observerName,
          success: true
        });
      } catch (err: any) {
        results.push({
          observerName: observer.observerName,
          success: false,
          error: err?.message || 'Lỗi không xác định khi cập nhật Observer'
        });
      }
    }

    return results;
  }
}
