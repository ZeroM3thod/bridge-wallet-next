import { NextRequest, NextResponse } from 'next/server'
import { validateEmail, normalizeEmail } from '@/lib/server/validation'
import { generateOTP, hashOTP } from '@/lib/server/crypto'
import { sendOTPEmail } from '@/lib/server/email'
import { checkRateLimit, checkCooldown } from '@/lib/server/rate-limit'

type Env = {
  DB: D1Database
  RESEND_API_KEY: string
}

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'সঠিক ইমেইল ঠিকানা দিন' }, { status: 400 })
    }

    const emailLower = normalizeEmail(email)
    const env = process.env as unknown as Env

    if (!env.DB) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Check if email already registered
    const existing = await env.DB.prepare(
      'SELECT email FROM users WHERE email = ?'
    ).bind(emailLower).first()

    if (existing) {
      return NextResponse.json({ error: 'এই ইমেইল ইতিমধ্যে নিবন্ধিত' }, { status: 400 })
    }

    // Check cooldown
    const cooldown = await checkCooldown(env, emailLower)
    if (!cooldown.allowed) {
      return NextResponse.json({ error: cooldown.error }, { status: 429 })
    }

    // Check rate limit
    const rateCheck = await checkRateLimit(env, `email:${emailLower}`, 5, 3600000)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.error }, { status: 429 })
    }

    // Generate OTP
    const code = generateOTP()
    const secret = env.RESEND_API_KEY.slice(0, 16)
    const codeHash = await hashOTP(code, secret)
    const expiresAt = Date.now() + 10 * 60 * 1000
    const otpId = crypto.randomUUID()

    // Store OTP
    await env.DB.prepare(
      'INSERT INTO email_otps (id, email, code_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(otpId, emailLower, codeHash, expiresAt, Date.now()).run()

    // Clean expired OTPs
    await env.DB.prepare(
      'DELETE FROM email_otps WHERE expires_at < ?'
    ).bind(Date.now()).run()

    // Send email
    await sendOTPEmail(env, emailLower, code)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send code error:', error)
    return NextResponse.json({ error: 'সার্ভার সমস্যা হয়েছে' }, { status: 500 })
  }
}
