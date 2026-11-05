import { createServerFn } from '@tanstack/react-start'
import { dbQueryOne, dbExec } from '../worker-lib/db'
import { validateEmail, normalizeEmail } from '../worker-lib/validation'
import { generateOTP, hashOTP } from '../worker-lib/crypto'
import { sendOTPEmail } from '../worker-lib/email'
import { checkCooldown, checkRateLimit } from '../worker-lib/rate-limit'

type SendCodeInput = { email: string }

export const $sendCode = createServerFn<SendCodeInput>()
  .handler(async ({ data }) => {
    const { email } = data
    
    // @ts-ignore - Cloudflare env access
    const env = globalThis.process?.env || {}
    // @ts-ignore
    const db = env.DB

    if (!db) {
      throw new Error('Database not configured')
    }

    if (!validateEmail(email)) {
      throw new Error('সঠিক ইমেইল ঠিকানা দিন')
    }

    const emailLower = normalizeEmail(email)

    // Check if email already registered
    const existing = await dbQueryOne(db, "SELECT email FROM users WHERE email = ?", [emailLower])
    if (existing) {
      throw new Error('এই ইমেইল ইতিমধ্যে নিবন্ধিত')
    }

    // Check cooldown
    const cooldown = await checkCooldown(db, emailLower)
    if (!cooldown.allowed) {
      throw new Error(cooldown.error!)
    }

    // Check rate limits
    const emailLimit = await checkRateLimit(db, `email:${emailLower}`, 5)
    if (!emailLimit.allowed) {
      throw new Error(emailLimit.error!)
    }

    // Generate OTP
    const code = generateOTP()
    // @ts-ignore
    const codeHash = await hashOTP(code, env.OTP_HASH_SECRET)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const otpId = crypto.randomUUID()

    // Store in database
    await dbExec(db, "INSERT INTO email_otps (id, email, code_hash, expires_at) VALUES (?, ?, ?, ?)", [otpId, emailLower, codeHash, expiresAt])

    // Send email
    await sendOTPEmail(env, emailLower, code)

    return { success: true }
  })

