export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface ShippingAddress {
  recipientName: string;
  phoneNumber: string;
  street: string;
  city: string;
}
