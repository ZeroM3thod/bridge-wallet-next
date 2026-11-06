import type { EventContext } from '@cloudflare/workers-types'

type Env = {
  DB: D1Database
  RESEND_API_KEY: string
}

// Validation helpers
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

// Crypto helpers
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function hashOTP(code: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(code + secret)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function checkCooldown(
  db: D1Database,
  email: string
): Promise<{ allowed: boolean; error?: string }> {
  const result = await db.prepare(
    'SELECT created_at FROM email_otps WHERE email = ? ORDER BY created_at DESC LIMIT 1'
  ).bind(email).first<{ created_at: number }>()

  if (!result) return { allowed: true }

  const timeSince = Date.now() - result.created_at
  const cooldownMs = 60000
  if (timeSince < cooldownMs) {
    return { allowed: false, error: `আরও ${Math.ceil((cooldownMs - timeSince) / 1000)} সেকেন্ড অপেক্ষা করুন` }
  }

  return { allowed: true }
}

// Email sender
async function sendOTPEmail(apiKey: string, email: string, code: string): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Bridge Wallet <no-reply@rakibulhasan.live>',
      to: email,
      subject: 'আপনার যাচাইকরণ কোড - বরজাজ',
      html: `
        <div style="font-family: 'Noto Serif Bengali', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0875ec; margin-bottom: 20px;">বরজাজ ওয়ালেট</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">আপনার যাচাইকরণ কোড:</p>
          <div style="background: #f0f9ff; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="font-size: 42px; letter-spacing: 12px; margin: 0; color: #0875ec;">${code}</h1>
          </div>
          <p style="font-size: 14px; margin-bottom: 10px;">এই কোডটি <strong>১০ মিনিটের</strong> জন্য বৈধ।</p>
          <p style="color: #666; font-size: 13px;">যদি আপনি এই কোডটি অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।</p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Resend error:', error)
    throw new Error('ইমেইল পাঠাতে ব্যর্থ')
  }
}

export async function onRequestPost(context: EventContext<Env, any, any>) {
  const { request, env } = context

  try {
    const body = await request.json() as { email: string }
    const { email } = body

    if (!validateEmail(email)) {
      return new Response(JSON.stringify({ error: 'সঠিক ইমেইল ঠিকানা দিন' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const emailLower = normalizeEmail(email)

    // Check if email already registered
    const existing = await env.DB.prepare(
      'SELECT email FROM users WHERE email = ?'
    ).bind(emailLower).first()

    if (existing) {
      return new Response(JSON.stringify({ error: 'এই ইমেইল ইতিমধ্যে নিবন্ধিত' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check cooldown
    const cooldown = await checkCooldown(env.DB, emailLower)
    if (!cooldown.allowed) {
      return new Response(JSON.stringify({ error: cooldown.error }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      })
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
    await sendOTPEmail(env.RESEND_API_KEY, emailLower, code)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Send code error:', error)
    return new Response(JSON.stringify({ error: 'সার্ভার সমস্যা হয়েছে' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
