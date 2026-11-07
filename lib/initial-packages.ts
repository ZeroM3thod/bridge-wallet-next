export const INITIAL_PACKAGES = [
  { id: 'vip0', name: 'ভিআইপি ০', price: 500, dailyRate: 2, durationDays: 30, maxPerUser: 1, stockLimit: 0, minActiveReferrals: 0, requiresPackageId: '', allowWhileActive: false, visible: true },
  { id: 'vip1', name: 'ভিআইপি ১', price: 1000, dailyRate: 2.2, durationDays: 30, maxPerUser: 2, stockLimit: 0, minActiveReferrals: 1, requiresPackageId: '', allowWhileActive: false, visible: true },
  { id: 'vip2', name: 'ভিআইপি ২', price: 3000, dailyRate: 2.5, durationDays: 45, maxPerUser: 3, stockLimit: 500, minActiveReferrals: 3, requiresPackageId: 'vip1', allowWhileActive: true, visible: true },
  { id: 'vip3', name: 'ভিআইপি ৩', price: 10000, dailyRate: 2.8, durationDays: 60, maxPerUser: 4, stockLimit: 100, minActiveReferrals: 5, requiresPackageId: 'vip2', allowWhileActive: true, visible: true },
  { id: 'vip4', name: 'ভিআইপি ৪', price: 25000, dailyRate: 3, durationDays: 75, maxPerUser: 5, stockLimit: 50, minActiveReferrals: 8, requiresPackageId: 'vip3', allowWhileActive: true, visible: true },
  { id: 'vip5', name: 'ভিআইপি ৫', price: 50000, dailyRate: 3.2, durationDays: 90, maxPerUser: 6, stockLimit: 20, minActiveReferrals: 10, requiresPackageId: 'vip4', allowWhileActive: true, visible: true },
] as const
