import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database; PACKAGE_IMAGES: R2Bucket }
const json = (data: unknown, status = 200) => Response.json(data, { status })

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const id = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  const row = id && await env.DB.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(id, Date.now()).first<{ role: string }>()
  if (row?.role !== 'admin') return json({ error: 'Not found' }, 404)
  try {
    const form = await request.formData(), file = form.get('image'), packageId = form.get('packageId')
    if (!(file instanceof File) || typeof packageId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(packageId) || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) return json({ error: 'Choose JPG, PNG or WebP under 5 MB' }, 400)
    const key = `packages/${packageId}`
    await env.PACKAGE_IMAGES.put(key, file.stream(), { httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=3600' } })
    await env.DB.prepare("UPDATE packages SET image_key=?,updated_at=? WHERE id=?").bind(key, Date.now(), packageId).run()
    return json({ imageUrl: `/api/package-images/${packageId}?v=${Date.now()}` })
  } catch (error) { console.error(error); return json({ error: 'Image upload failed' }, 500) }
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const id = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  const row = id && await env.DB.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(id, Date.now()).first<{ role: string }>()
  if (row?.role !== 'admin') return json({ error: 'Not found' }, 404)
  try {
    const { packageId } = await request.json() as { packageId?: string }
    if (!packageId || !/^[a-zA-Z0-9_-]{1,100}$/.test(packageId)) return json({ error: 'Invalid package' }, 400)
    const result = await env.DB.prepare('SELECT image_key FROM packages WHERE id=?').bind(packageId).first<{ image_key: string }>()
    if (result?.image_key) await env.PACKAGE_IMAGES.delete(result.image_key)
    await env.DB.prepare("UPDATE packages SET image_key='',updated_at=? WHERE id=?").bind(Date.now(), packageId).run()
    return json({ success: true })
  } catch (error) { console.error(error); return json({ error: 'Image removal failed' }, 500) }
}
