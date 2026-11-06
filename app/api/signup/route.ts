import { NextRequest, NextResponse } from 'next/server'
import { validateEmail, normalizeEmail, validatePhone } from '@/lib/server/validation'
import { hashPassword, hashOTP } from '@/lib/server/crypto'

type Env = {
  DB: D1Database
  RESEND_API_KEY: string
}

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, code: rawCode, otp, password, referralCode, invite } = await req.json()
    const code = String(rawCode ?? otp ?? "").replace(/[০-৯]/g, digit => String("০১২৩৪৫৬৭৮৯".indexOf(digit)))

    // Validate inputs
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে' }, { status: 400 })
    }

    if (!validatePhone(phone)) {
      return NextResponse.json({ error: 'সঠিক ফোন নম্বর দিন' }, { status: 400 })
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'সঠিক ইমেইল ঠিকানা দিন' }, { status: 400 })
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'সঠিক ৬ সংখ্যার কোড দিন' }, { status: 400 })
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' }, { status: 400 })
    }

    const emailLower = normalizeEmail(email)
    const env = process.env as unknown as Env

    if (!env.DB) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Verify OTP
    const secret = env.RESEND_API_KEY.slice(0, 16)
    const codeHash = await hashOTP(code, secret)
    
    const otpRecord = await env.DB.prepare(
      'SELECT expires_at FROM email_otps WHERE email = ? AND code_hash = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(emailLower, codeHash).first()

    if (!otpRecord) {
      return NextResponse.json({ error: 'ভুল যাচাইকরণ কোড' }, { status: 400 })
    }

    if (Date.now() > otpRecord.expires_at) {
      return NextResponse.json({ error: 'কোডের মেয়াদ শেষ হয়ে গেছে' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await env.DB.prepare(
      'SELECT email FROM users WHERE email = ?'
    ).bind(emailLower).first()

    if (existing) {
      return NextResponse.json({ error: 'এই ইমেইল ইতিমধ্যে নিবন্ধিত' }, { status: 400 })
    }

    // Verify referral code if provided
    let referrerId = null
    const referral = referralCode ?? invite ?? ""
    if (referral.trim()) {
      const referrer = await env.DB.prepare(
        'SELECT id FROM users WHERE referral_code = ?'
      ).bind(referral.trim()).first()
      
      if (!referrer) {
        return NextResponse.json({ error: 'রেফারেল কোড পাওয়া যায়নি' }, { status: 400 })
      }
      referrerId = referrer.id
    }

    // Generate user ID and referral code
    const userId = crypto.randomUUID()
    const userReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase()
    const passwordHash = await hashPassword(password)

    // Create user
    await env.DB.prepare(`
      INSERT INTO users (id, email, name, phone, password_hash, referral_code, referred_by, balance, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      emailLower,
      name,
      phone,
      passwordHash,
      userReferralCode,
      referrerId,
      250000, // Initial 2500.00 BDT balance
      Date.now()
    ).run()

    // Create initial transaction
    await env.DB.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, label, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      userId,
      'credit',
      250000,
      'প্রারম্ভিক সঞ্চয়',
      Date.now()
    ).run()

    // Delete used OTP
    await env.DB.prepare(
      'DELETE FROM email_otps WHERE email = ?'
    ).bind(emailLower).run()

    return NextResponse.json({ 
      success: true,
      user: {
        id: userId,
        email: emailLower,
        name,
        referralCode: userReferralCode
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'সার্ভার সমস্যা হয়েছে' }, { status: 500 })
  }
}
