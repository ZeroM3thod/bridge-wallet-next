export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function validatePhone(phone: string): boolean {
  return /^1\d{9}$/.test(normalizePhone(phone))
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit))).replace(/[\s()-]/g, '').replace(/^0/, '')
}
