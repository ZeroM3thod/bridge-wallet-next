import type { PagesFunction } from '@cloudflare/workers-types'

type Env = { DB: D1Database }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT telegram_support_url AS raw,whatsapp_support_url AS whatsapp FROM site_settings WHERE id=1').first<{ raw: string; whatsapp: string }>()
      let contacts: { name: string; url: string }[] = []
      try { contacts = JSON.parse(row?.raw || '[]'); if (!Array.isArray(contacts)) throw new Error('legacy settings') }
      catch { contacts = [row?.raw && { name: 'Manager', url: row.raw }, row?.whatsapp && { name: 'Assistant Manager', url: row.whatsapp }].filter((c): c is { name: string; url: string } => !!c) }
      return json({ contacts })
    }
    if (request.method !== 'PUT') return json({ error: 'Method not allowed' }, 405)
    const sid = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
    const session = sid && await env.DB.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(sid, Date.now()).first<{ role: string }>()
    if (session?.role !== 'admin') return json({ error: 'Not found' }, 404)
    const body = await request.json() as Record<string, unknown>
    const contacts = body.contacts
    if (!Array.isArray(contacts) || contacts.length > 50 || !contacts.every((item: any) => item && typeof item.name === 'string' && item.name.trim().length > 0 && item.name.length <= 80 && typeof item.url === 'string' && item.url.length <= 2048 && (() => { try { return new URL(item.url).protocol === 'https:' } catch { return false } })())) return json({ error: 'Add a name and valid HTTPS link for each contact' }, 400)
    await env.DB.prepare('UPDATE site_settings SET telegram_support_url=?,whatsapp_support_url=?,updated_at=? WHERE id=1').bind(JSON.stringify(contacts.map((c: { name: string; url: string }) => ({ name: c.name.trim(), url: c.url.trim() }))), '', Date.now()).run()
    return json({ success: true })
  } catch (error) {
    console.error('Admin support update failed:', error)
    return json({ error: 'Support settings unavailable' }, 500)
  }
}
