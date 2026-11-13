import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database; PACKAGE_IMAGES: R2Bucket }

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = String(params.id || '')
  const row = await env.DB.prepare('SELECT image_key FROM packages WHERE id=?').bind(id).first<{ image_key: string }>()
  if (!row?.image_key) return new Response('Not found', { status: 404 })
  const object = await env.PACKAGE_IMAGES.get(row.image_key)
  if (!object) return new Response('Not found', { status: 404 })
  return new Response(object.body, { headers: { 'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream', 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' } })
}
