import { NextRequest, NextResponse } from 'next/server'
import { normalizeEmail, validateEmail } from '@/lib/server/validation'
import { generateOTP, hashOTP, hashPassword } from '@/lib/server/crypto'
import { sendOTPEmail } from '@/lib/server/email'
import { checkCooldown, checkRateLimit } from '@/lib/server/rate-limit'

type Env = { DB: D1Database; RESEND_API_KEY: string }
export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { action, email: inputEmail, code, password } = await req.json()
    if (!validateEmail(inputEmail)) return NextResponse.json({ error: 'সঠিক বৈদ্যুতিন ডাক ঠিকানা দিন' }, { status: 400 })
    const email = normalizeEmail(inputEmail)
    const env = process.env as unknown as Env
    if (!env.DB || !env.RESEND_API_KEY) return NextResponse.json({ error: 'সার্ভার সমস্যা হয়েছে' }, { status: 500 })

    if (action === 'send') {
      const cooldown = await checkCooldown(env, email)
      if (!cooldown.allowed) return NextResponse.json({ error: cooldown.error }, { status: 429 })
      const limit = await checkRateLimit(env, `password-reset:${email}`, 5, 3600000)
      if (!limit.allowed) return NextResponse.json({ error: limit.error }, { status: 429 })
      if (await env.DB.prepare('SELECT 1 FROM users WHERE email = ?').bind(email).first()) {
        const otp = generateOTP()
        await env.DB.prepare('INSERT INTO email_otps (id,email,code_hash,expires_at,created_at) VALUES (?,?,?,?,?)')
          .bind(crypto.randomUUID(), email, await hashOTP(otp, env.RESEND_API_KEY.slice(0, 16)), Date.now() + 10 * 60 * 1000, Date.now()).run()
        await sendOTPEmail(env, email, otp)
      }
      return NextResponse.json({ success: true })
    }

    if (action !== 'reset' || !/^\d{6}$/.test(String(code)) || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'সঠিক যাচাইকরণ কোড ও কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন' }, { status: 400 })
    }
    const otpHash = await hashOTP(code, env.RESEND_API_KEY.slice(0, 16))
    const otp = await env.DB.prepare('SELECT id FROM email_otps WHERE email=? AND code_hash=? AND expires_at>? ORDER BY created_at DESC LIMIT 1')
      .bind(email, otpHash, Date.now()).first<{ id: string }>()
    if (!otp) return NextResponse.json({ error: 'ভুল বা মেয়াদোত্তীর্ণ যাচাইকরণ কোড' }, { status: 400 })
    const result = await env.DB.prepare('UPDATE users SET password_hash=? WHERE email=?').bind(await hashPassword(password), email).run()
    if (!result.meta.changes) return NextResponse.json({ error: 'অ্যাকাউন্ট পাওয়া যায়নি' }, { status: 404 })
    await env.DB.batch([
      env.DB.prepare('DELETE FROM email_otps WHERE email=?').bind(email),
      env.DB.prepare('DELETE FROM sessions WHERE user_id=(SELECT id FROM users WHERE email=?)').bind(email),
    ])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'সার্ভার সমস্যা হয়েছে' }, { status: 500 })
  }
}
