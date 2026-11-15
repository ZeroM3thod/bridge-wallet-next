import type { PagesFunction } from '@cloudflare/workers-types'

type Env = { DB: D1Database }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
    if (!sessionId) return json({ error: 'Not found' }, 404)
    const admin = await env.DB.prepare('SELECT u.id FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>? AND COALESCE(u.role_text,u.role,"user")="admin"').bind(sessionId, Date.now()).first()
    if (!admin) return json({ error: 'Not found' }, 404)

    const users = await env.DB.prepare('SELECT id,name,email,phone,balance,COALESCE(role_text,role,"user") AS role,referral_code,referred_by,created_at FROM users ORDER BY created_at DESC').all()
    return json({ users: users.results })
  } catch (error) {
    console.error('Admin users load failed:', error)
    return json({ error: 'Could not load users' }, 500)
  }
}
