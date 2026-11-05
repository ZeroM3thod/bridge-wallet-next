export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function validatePhone(phone: string): boolean {
  return /^0?1\d{9}$/.test(phone.replace(/\s/g, ''))
}
