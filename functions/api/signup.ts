import type { EventContext } from '@cloudflare/workers-types'

type Env = {
  DB: D1Database
  RESEND_API_KEY: string
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function validatePhone(phone: string): boolean {
  return /^1\d{9}$/.test(normalizePhone(phone))
}

function normalizePhone(phone: string): string {
  return phone.replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit))).replace(/[\s()-]/g, '').replace(/^0/, '')
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function hashOTP(code: string, secret: string): Promise<string> {
  return hashPassword(code + secret)
}

export async function onRequestPost(context: EventContext<Env, any, any>) {
  const { request, env } = context

  try {
    const body = await request.json() as {
      name: string
      phone: string
      email: string
      code: string
      otp?: string
      password: string
      referralCode?: string
      invite?: string
    }
    const { name, phone, email, password } = body
    const code = String(body.code ?? body.otp ?? '').replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)))
    const referralCode = body.referralCode ?? body.invite

    // Validate inputs
    if (!name || name.length < 2) {
      return new Response(JSON.stringify({ error: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!validatePhone(phone)) {
      return new Response(JSON.stringify({ error: 'সঠিক ফোন নম্বর দিন' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    const normalizedPhone = normalizePhone(phone)

    if (!validateEmail(email)) {
      return new Response(JSON.stringify({ error: 'সঠিক ইমেইল ঠিকানা দিন' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!/^\d{6}$/.test(code)) {
      return new Response(JSON.stringify({ error: 'সঠিক ৬ সংখ্যার কোড দিন' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!password || password.length < 6) {
      return new Response(JSON.stringify({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const emailLower = normalizeEmail(email)
    const bonusSettings = await env.DB.prepare('SELECT welcome_bonus_enabled,welcome_bonus_amount FROM site_settings WHERE id=1').first<{welcome_bonus_enabled:number;welcome_bonus_amount:number}>()
    const welcomeBonus = bonusSettings?.welcome_bonus_enabled ? bonusSettings.welcome_bonus_amount : 0

    // Verify OTP
    const secret = env.RESEND_API_KEY.slice(0, 16)
    const codeHash = await hashOTP(code, secret)
    
    const otpRecord = await env.DB.prepare(
      'SELECT expires_at FROM email_otps WHERE email = ? AND code_hash = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(emailLower, codeHash).first<{ expires_at: number }>()

    if (!otpRecord) {
      return new Response(JSON.stringify({ error: 'ভুল যাচাইকরণ কোড' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (Date.now() > otpRecord.expires_at) {
      return new Response(JSON.stringify({ error: 'কোডের মেয়াদ শেষ হয়ে গেছে' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if email already exists
    const existing = await env.DB.prepare(
      'SELECT email FROM users WHERE email = ?'
    ).bind(emailLower).first()

    if (existing) {
      return new Response(JSON.stringify({ error: 'এই ইমেইল ইতিমধ্যে নিবন্ধিত' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (await env.DB.prepare('SELECT 1 FROM users WHERE phone_normalized = ?').bind(normalizedPhone).first()) {
      return new Response(JSON.stringify({ error: 'এই ফোন নম্বর ইতিমধ্যে নিবন্ধিত' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    // Verify referral code if provided
    let referrerId = null
    if (referralCode && referralCode.trim()) {
      const referrer = await env.DB.prepare(
        'SELECT id FROM users WHERE referral_code = ? OR old_referral_code = ?'
      ).bind(referralCode.trim(), referralCode.trim()).first<{ id: string }>()
      
      if (!referrer) {
        return new Response(JSON.stringify({ error: 'রেফারেল কোড পাওয়া যায়নি' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      referrerId = referrer.id
    }

    // Referral code is the public 8-digit user ID.
    const userId = crypto.randomUUID()
    const passwordHash = await hashPassword(password)

    let userReferralCode = ''
    for (let attempt = 0; attempt < 32; attempt++) {
      userReferralCode = String(10_000_000 + crypto.getRandomValues(new Uint32Array(1))[0] % 90_000_000)
      const result = await env.DB.prepare(`
        INSERT INTO users (id, email, name, phone, phone_normalized, password_hash, referral_code, referred_by, balance, welcome_bonus_locked, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT DO NOTHING
      `).bind(userId, emailLower, name, normalizedPhone, normalizedPhone, passwordHash, userReferralCode, referrerId, welcomeBonus, welcomeBonus, Date.now()).run()
      if (result.meta.changes) {
        if (welcomeBonus > 0) await env.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) VALUES (?,?,'credit',?,'Welcome bonus',?)").bind(crypto.randomUUID(),userId,welcomeBonus,Date.now()).run()
        break
      }
      if (await env.DB.prepare('SELECT 1 FROM users WHERE phone_normalized = ?').bind(normalizedPhone).first()) {
        return new Response(JSON.stringify({ error: 'এই ফোন নম্বর ইতিমধ্যে নিবন্ধিত' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      }
      if (attempt === 31) throw new Error('Could not allocate unique user ID')
    }

    // Delete used OTP
    await env.DB.prepare(
      'DELETE FROM email_otps WHERE email = ?'
    ).bind(emailLower).run()

    return new Response(JSON.stringify({ 
      success: true,
      user: {
        id: userReferralCode,
        internalId: userId,
        email: emailLower,
        name,
        referralCode: userReferralCode
      }, welcomeBonus
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return new Response(JSON.stringify({ error: 'সার্ভার সমস্যা হয়েছে' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
