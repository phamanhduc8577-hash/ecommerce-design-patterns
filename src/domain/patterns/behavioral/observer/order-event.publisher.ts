import { IOrderObserver, OrderEventPayload } from './order-observer.interface';

/**
 * Subject trong Observer Pattern: Quản lý danh sách người quan sát và phát thông báo.
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

  public async notify(payload: OrderEventPayload): Promise<void> {
    for (const observer of this.observers) {
      await observer.update(payload);
    }
  }
}
