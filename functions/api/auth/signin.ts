import type { EventContext } from '@cloudflare/workers-types'

type Env = { DB: D1Database }

const hashPassword = async (password: string) => {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function onRequestPost({ request, env }: EventContext<Env, any, any>) {
  try {
    const { identifier, password } = await request.json() as { identifier?: string; password?: string }
    if (!identifier?.trim() || !password) {
      return Response.json({ error: 'সব তথ্য পূরণ করুন' }, { status: 400 })
    }

    const value = identifier.trim()
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    const phone = value.replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit))).replace(/\s/g, '')
    if (!isEmail && !/^0?1\d{9}$/.test(phone)) {
      return Response.json({ error: 'সঠিক ইমেইল বা ফোন নম্বর দিন' }, { status: 400 })
    }

    const hash = await hashPassword(password)
    const user = await env.DB.prepare(isEmail
      ? 'SELECT id, email, name, role FROM users WHERE email = ? AND password_hash = ?'
      : 'SELECT id, email, name, role FROM users WHERE phone = ? AND password_hash = ?'
    ).bind(isEmail ? value.toLowerCase() : phone, hash).first<{ id: string; email: string; name: string; role: string }>()

    if (!user) return Response.json({ error: 'ইমেইল/ফোন বা পাসওয়ার্ড সঠিক নয়' }, { status: 401 })

    const sessionId = crypto.randomUUID()
    const now = Date.now()
    await env.DB.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
      .bind(sessionId, user.id, now, now + 5 * 60 * 60 * 1000).run()

    return Response.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }, {
      headers: { 'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=18000` },
    })
  } catch (error) {
    console.error('Signin error:', error)
    return Response.json({ error: 'সার্ভার সমস্যা হয়েছে' }, { status: 500 })
  }
}
