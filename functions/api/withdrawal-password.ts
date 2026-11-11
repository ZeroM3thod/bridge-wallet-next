import type { PagesFunction } from '@cloudflare/workers-types'

type Env = { DB: D1Database }
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
const hash = async (password: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)))).map((byte) => byte.toString(16).padStart(2, '0')).join('')

async function getUserId(request: Request, env: Env) {
  const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!sessionId) return null
  return (await env.DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sessionId, Date.now()).first<{ user_id: string }>())?.user_id ?? null
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const userId = await getUserId(request, env)
    if (!userId) return json({ error: 'অনুমোদিত নয়' }, 401)
    const user = await env.DB.prepare('SELECT withdrawal_password_hash FROM users WHERE id=?').bind(userId).first<{ withdrawal_password_hash: string | null }>()
    if (!user) return json({ error: 'ব্যবহারকারী পাওয়া যায়নি' }, 404)
    return json({ success: true, hasPassword: Boolean(user.withdrawal_password_hash) })
  } catch (error) {
    console.error('Withdrawal password status failed', error)
    return json({ error: 'সার্ভার সমস্যা হয়েছে' }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const userId = await getUserId(request, env)
    if (!userId) return json({ error: 'অনুমোদিত নয়' }, 401)
    const body = await request.json() as { currentPassword?: unknown; password?: unknown; confirmPassword?: unknown }
    if (typeof body.password !== 'string' || typeof body.confirmPassword !== 'string' || body.password.length < 6) return json({ error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' }, 400)
    if (body.password !== body.confirmPassword) return json({ error: 'নতুন পাসওয়ার্ড মিলছে না' }, 400)
    const user = await env.DB.prepare('SELECT withdrawal_password_hash FROM users WHERE id=?').bind(userId).first<{ withdrawal_password_hash: string | null }>()
    if (!user) return json({ error: 'ব্যবহারকারী পাওয়া যায়নি' }, 404)
    if (user.withdrawal_password_hash) {
      if (typeof body.currentPassword !== 'string' || await hash(body.currentPassword) !== user.withdrawal_password_hash) return json({ error: 'বর্তমান উত্তোলন পাসওয়ার্ড সঠিক নয়' }, 400)
      const result = await env.DB.prepare('UPDATE users SET withdrawal_password_hash=? WHERE id=? AND withdrawal_password_hash=?').bind(await hash(body.password), userId, user.withdrawal_password_hash).run()
      if (!result.meta.changes) return json({ error: 'পাসওয়ার্ড পরিবর্তিত হয়েছে; আবার চেষ্টা করুন' }, 409)
    } else {
      const result = await env.DB.prepare('UPDATE users SET withdrawal_password_hash=? WHERE id=? AND withdrawal_password_hash IS NULL').bind(await hash(body.password), userId).run()
      if (!result.meta.changes) return json({ error: 'উত্তোলন পাসওয়ার্ড ইতিমধ্যে সেট হয়েছে; আবার লোড করুন' }, 409)
    }
    return json({ success: true })
  } catch (error) {
    console.error('Withdrawal password update failed', error)
    return json({ error: 'সার্ভার সমস্যা হয়েছে' }, 500)
  }
}
