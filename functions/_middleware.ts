import type { EventContext } from '@cloudflare/workers-types'

type Env = { DB: D1Database }

export async function onRequest(context: EventContext<Env, any, any>) {
  const { request, env } = context
  const { pathname } = new URL(request.url)
  if (pathname === '/signin' || pathname === '/signup' || pathname.startsWith('/api/') || pathname.startsWith('/assets/') || pathname.startsWith('/_next/')) return context.next()

  const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  const session = sessionId && await env.DB.prepare('SELECT id FROM sessions WHERE id = ? AND expires_at > ?')
    .bind(sessionId, Date.now()).first()
  if (session) return context.next()

  return Response.redirect(new URL('/signin', request.url), 302)
}
