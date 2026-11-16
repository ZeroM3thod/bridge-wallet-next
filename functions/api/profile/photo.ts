import type { PagesFunction } from '@cloudflare/workers-types'

type Env = { DB: D1Database; PROFILE_PHOTOS: R2Bucket }
const json = (data: unknown, status = 200) => Response.json(data, { status })

async function userId(request: Request, env: Env) {
  const sessionId = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!sessionId) return null
  return (await env.DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sessionId, Date.now()).first<{ user_id: string }>())?.user_id ?? null
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const id = await userId(request, env)
  if (!id) return json({ error: 'অনুমোদিত নয়' }, 401)
  const row = await env.DB.prepare('SELECT profile_photo_key FROM users WHERE id=?').bind(id).first<{ profile_photo_key: string | null }>()
  if (!row?.profile_photo_key) return new Response('Not found', { status: 404 })
  const object = await env.PROFILE_PHOTOS.get(row.profile_photo_key)
  if (!object) return new Response('Not found', { status: 404 })
  return new Response(object.body, { headers: { 'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const id = await userId(request, env)
  if (!id) return json({ error: 'অনুমোদিত নয়' }, 401)
  try {
    const file = (await request.formData()).get('photo')
    if (!(file instanceof File) || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) return json({ error: '৫ MB-এর মধ্যে JPG, PNG বা WebP ছবি দিন' }, 400)
    const previous = await env.DB.prepare('SELECT profile_photo_key FROM users WHERE id=?').bind(id).first<{ profile_photo_key: string | null }>()
    const key = `profiles/${id}/${crypto.randomUUID()}`
    await env.PROFILE_PHOTOS.put(key, file.stream(), { httpMetadata: { contentType: file.type } })
    try {
      await env.DB.prepare('UPDATE users SET profile_photo_key=? WHERE id=?').bind(key, id).run()
    } catch (error) {
      await env.PROFILE_PHOTOS.delete(key)
      throw error
    }
    if (previous?.profile_photo_key) await env.PROFILE_PHOTOS.delete(previous.profile_photo_key).catch(() => {})
    return json({ success: true, photoUrl: `/api/profile/photo?v=${Date.now()}` })
  } catch (error) {
    console.error('Profile photo upload error:', error)
    return json({ error: 'ছবি আপলোড ব্যর্থ হয়েছে' }, 500)
  }
}
