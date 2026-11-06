import type { EventContext } from '@cloudflare/workers-types'

type Env = { DB: D1Database }

export async function onRequestGet({ request, env }: EventContext<Env, any, any>) {
  const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!sessionId) return Response.json({ error: 'লগইন করুন' }, { status: 401 })

  const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?')
    .bind(sessionId, Date.now()).first<{ user_id: string }>()
  if (!session) return Response.json({ error: 'সেশনের মেয়াদ শেষ' }, {
    status: 401,
    headers: { 'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' },
  })

  return Response.json({ success: true })
}
