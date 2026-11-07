import type { PagesFunction } from '@cloudflare/workers-types'

type Env = { DB: D1Database }

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  const url = new URL(request.url)
  
  if (!url.pathname.startsWith('/superadmin')) {
    return next()
  }

  const sessionId = request.headers.get('cookie')?.match(/session=([^;]+)/)?.[1]
  
  if (!sessionId) {
    return new Response(null, { 
      status: 302, 
      headers: { Location: '/signin' } 
    })
  }

  const session = await env.DB.prepare(
    'SELECT u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > ?'
  ).bind(sessionId, Date.now()).first<{ role: number }>()

  if (!session || session.role !== 2) {
    return new Response('Not Found', { status: 404 })
  }

  return next()
}
