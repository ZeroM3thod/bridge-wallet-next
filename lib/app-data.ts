export const vipPackages = [
  {
    name: "ভিআইপি ০",
    price: 500,
    dailyRate: 0.8,
    durationDays: 5,
  },
  {
    name: "ভিআইপি ১",
    price: 1500,
    dailyRate: 1,
    durationDays: 10,
  },
  {
    name: "ভিআইপি ২",
    price: 5000,
    dailyRate: 1.2,
    durationDays: 20,
  },
  {
    name: "ভিআইপি ৩",
    price: 10000,
    dailyRate: 1.4,
    durationDays: 30,
  },
  {
    name: "ভিআইপি ৪",
    price: 20000,
    dailyRate: 1.6,
    durationDays: 40,
  },
  {
    name: "ভিআইপি ৫",
    price: 35000,
    dailyRate: 1.8,
    durationDays: 50,
  },
]

export type VipPackage = (typeof vipPackages)[number]

export type TeamMember = {
  mobile: string
  id?: string
  vipLevel?: number
  date: string
  deposit: number
  profit: number
  active: boolean
}

