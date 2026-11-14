import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
const fields = ['telegramChannelUrl', 'telegramSupportUrl', 'whatsappSupportUrl', 'apkDownloadUrl'] as const

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  try {
    if (request.method === 'GET') {
      const row = await env.DB.prepare('SELECT telegram_channel_url AS telegramChannelUrl,telegram_support_url AS telegramSupportUrl,whatsapp_support_url AS whatsappSupportUrl,apk_download_url AS apkDownloadUrl FROM site_settings WHERE id=1').first()
      return json(row ?? { telegramChannelUrl: '', telegramSupportUrl: '', whatsappSupportUrl: '', apkDownloadUrl: '' })
    }
    if (request.method !== 'PUT') return json({ error: 'Method not allowed' }, 405)
    const sid = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
    const session = sid && await env.DB.prepare('SELECT COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(sid,Date.now()).first<{role:string}>()
    if (session?.role !== 'admin') return json({ error: 'Not found' },404)
    const body = await request.json() as Record<string, unknown>
    if (!fields.every(key => typeof body[key] === 'string' && (body[key] as string).length <= 2048 && (!body[key] || (() => { try { return new URL(body[key] as string).protocol === 'https:' } catch { return false } })()))) return json({ error: 'Enter valid HTTPS links' },400)
    await env.DB.prepare('UPDATE site_settings SET telegram_channel_url=?,telegram_support_url=?,whatsapp_support_url=?,apk_download_url=?,updated_at=? WHERE id=1').bind(...fields.map(key => body[key]),Date.now()).run()
    return json({ success: true })
  } catch (error) { console.error('Site settings error:',error); return json({ error: 'Settings unavailable' },500) }
}
