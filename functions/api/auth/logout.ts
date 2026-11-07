import type { EventContext } from '@cloudflare/workers-types'

export async function onRequestPost({ request }: EventContext<any, any, any>) {
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
    }
  })
}
