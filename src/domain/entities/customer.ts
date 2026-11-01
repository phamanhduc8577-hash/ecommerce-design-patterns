export enum CustomerTier {
  REGULAR = 'REGULAR',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  VIP = 'VIP'
}

export class Customer {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly tier: CustomerTier = CustomerTier.REGULAR
  ) {}
}
