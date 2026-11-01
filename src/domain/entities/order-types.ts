export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  SHIPPED = 'SHIPPED'
}

export interface ShippingAddress {
  recipientName: string;
  phoneNumber: string;
  street: string;
  city: string;
  postalCode?: string;
}
