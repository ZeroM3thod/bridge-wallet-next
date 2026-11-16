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
  const safeCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'GHM GROUPS <noreply@ghmgroups.com>',
      to: email,
      subject: 'GHM GROUPS — আপনার যাচাইকরণ কোড',
      html: `
        <div style="margin:0;background:#eef4fb;padding:32px 14px;font-family:Arial,'Noto Sans Bengali',sans-serif;color:#102a43">
          <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #dbe7f3;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(8,27,51,.08)">
            <div style="padding:26px 24px;text-align:center;background:#008ad9">
              <img src="https://ghmgroups.com/ghm-logo.png" width="180" alt="GHM Groups logo" style="display:block;width:180px;height:auto;max-width:100%;margin:0 auto" />
            </div>
            <div style="padding:30px 28px">
              <p style="margin:0 0 8px;color:#008ad9;font-size:12px;font-weight:700;letter-spacing:1px">ইমেইল যাচাইকরণ</p>
              <h1 style="margin:0 0 14px;font-size:24px;line-height:1.45;color:#102a43">আপনার যাচাইকরণ কোড</h1>
              <p style="margin:0 0 22px;font-size:15px;line-height:1.8;color:#526579">নিবন্ধন সম্পন্ন করতে নিচের কোডটি ব্যবহার করুন।</p>
              <div style="padding:20px 12px;border:1px solid #b9e4f8;border-radius:12px;background:#eff9ff;text-align:center;font-size:34px;font-weight:700;letter-spacing:10px;color:#0077bd">${safeCode}</div>
              <p style="margin:18px 0 0;font-size:14px;line-height:1.8;color:#526579">কোডটি <strong style="color:#18304b">১০ মিনিট</strong> পর্যন্ত বৈধ। কাউকে এই কোড দেবেন না।</p>
              <p style="margin:18px 0 0;padding-top:18px;border-top:1px solid #e8eef4;font-size:13px;line-height:1.8;color:#718096">আপনি এই কোড অনুরোধ না করলে, এই ইমেইলটি উপেক্ষা করুন।</p>
            </div>
            <div style="padding:16px 24px;text-align:center;background:#081b33;color:#d7e8f5;font-size:12px">© ২০২৬ · স্বয়ংক্রিয় বার্তা, উত্তর দেওয়ার প্রয়োজন নেই</div>
          </div>
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
    console.error('Send code error:', error instanceof Error ? error.message : error)
    return new Response(JSON.stringify({ error: 'সার্ভার সমস্যা হয়েছে' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
