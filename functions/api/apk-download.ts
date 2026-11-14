import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database }

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const row = await env.DB.prepare('SELECT apk_download_url FROM site_settings WHERE id=1').first<{apk_download_url:string}>()
    if (!row?.apk_download_url) return new Response('APK is not configured', { status: 404 })
    const url = new URL(row.apk_download_url)
    if (url.protocol !== 'https:') return new Response('Invalid APK URL', { status: 502 })
    const file = await fetch(url)
    if (!file.ok || !file.body) return new Response('APK download unavailable', { status: 502 })
    return new Response(file.body, { headers: { 'Content-Type': 'application/vnd.android.package-archive', 'Content-Disposition': 'attachment; filename="app.apk"', 'Cache-Control': 'no-store' } })
  } catch (error) { console.error('APK download failed:', error); return new Response('APK download unavailable', { status: 502 }) }
}
