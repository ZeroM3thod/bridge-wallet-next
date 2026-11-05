import { createServerFn } from '@tanstack/react-start'

export const sendCodeFn = createServerFn({ method: 'POST' }).handler(async ({ data }: { data: { email: string } }) => {
  const { email } = data

  // Basic validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRe.test(email.trim())) {
    throw new Error("সঠিক ইমেইল ঠিকানা দিন")
  }

  // TODO: Add DB checks, OTP generation, email sending
  // For now, return success to test
  return { success: true }
})
