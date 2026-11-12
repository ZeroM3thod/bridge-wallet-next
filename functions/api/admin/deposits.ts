import type { PagesFunction } from '@cloudflare/workers-types'

type Env = { DB: D1Database }
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })

async function adminId(request: Request, db: D1Database) {
  const id = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!id) return null
  const row = await db.prepare('SELECT u.id,COALESCE(u.role_text,u.role,"user") AS role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').bind(id, Date.now()).first<{ id: string; role: string }>()
  return row?.role === 'admin' ? row.id : null
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const actorId = await adminId(request, env.DB)
  if (!actorId) return json({ error: 'Not found' }, 404)
  if (request.method === 'GET') {
    const [rows, events] = await Promise.all([
      env.DB.prepare('SELECT d.id,d.out_trade_no,d.gateway_transaction_id,d.method,d.amount,d.status,d.created_at,d.paid_at,u.id AS user_id,u.name,u.phone,u.email,u.balance FROM deposits d JOIN users u ON u.id=d.user_id ORDER BY d.created_at DESC').all(),
      env.DB.prepare('SELECT e.id,e.deposit_id,e.actor_id,e.event,e.previous_status,e.new_status,e.note,e.created_at,u.name AS actor_name FROM deposit_events e LEFT JOIN users u ON u.id=e.actor_id ORDER BY e.created_at DESC').all(),
    ])
    return json({ deposits: rows.results, events: events.results })
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const body = await request.json() as { id?: unknown; action?: unknown }
    if (typeof body.id !== 'string' || !['approve', 'reject'].includes(String(body.action))) return json({ error: 'Invalid request' }, 400)
    const row = await env.DB.prepare('SELECT user_id,amount FROM deposits WHERE id=?').bind(body.id).first<{ user_id: string; amount: number }>()
    if (!row) return json({ error: 'Deposit not found' }, 404)
    if (!Number.isSafeInteger(row.amount) || row.amount <= 0 || row.amount % 100 !== 0) return json({ error: 'Invalid deposit amount' }, 409)
    const walletAmount = row.amount / 100 // deposits.amount is paisa; users.balance is taka
    const now = Date.now()
    const statements = body.action === 'approve'
      ? [
          env.DB.prepare("UPDATE deposits SET status='paid',paid_at=? WHERE id=? AND status='failed'").bind(now, body.id),
          env.DB.prepare('UPDATE users SET balance=balance+? WHERE id=? AND changes()>0').bind(walletAmount, row.user_id),
          env.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) SELECT ?,?,'credit',?,'ওয়ালেটে টাকা জমা',? WHERE changes()>0").bind(crypto.randomUUID(), row.user_id, walletAmount, now),
          env.DB.prepare("INSERT INTO deposit_events (id,deposit_id,actor_id,event,previous_status,new_status,note,created_at) SELECT ?,?,?,'approved','failed','paid','Admin approved deposit',? WHERE changes()>0").bind(crypto.randomUUID(), body.id, actorId, now),
        ]
      : [
          env.DB.prepare("UPDATE deposits SET status='rejected' WHERE id=? AND status='paid' AND EXISTS (SELECT 1 FROM users WHERE id=deposits.user_id AND balance>=deposits.amount/100)").bind(body.id),
          env.DB.prepare('UPDATE users SET balance=balance-? WHERE id=? AND changes()>0').bind(walletAmount, row.user_id),
          env.DB.prepare("INSERT INTO transactions (id,user_id,type,amount,label,created_at) SELECT ?,?,'debit',?,'ডিপোজিট রিভার্সাল',? WHERE changes()>0").bind(crypto.randomUUID(), row.user_id, walletAmount, now),
          env.DB.prepare("INSERT INTO deposit_events (id,deposit_id,actor_id,event,previous_status,new_status,note,created_at) SELECT ?,?,?,'rejected','paid','rejected','Admin rejected deposit and reversed wallet credit',? WHERE changes()>0").bind(crypto.randomUUID(), body.id, actorId, now),
        ]
    await env.DB.batch(statements)
    const updated = await env.DB.prepare('SELECT status FROM deposits WHERE id=?').bind(body.id).first<{ status: string }>()
    const expected = body.action === 'approve' ? 'paid' : 'rejected'
    if (updated?.status !== expected) return json({ error: body.action === 'reject' ? 'Deposit is not approved or user balance is insufficient' : 'Only failed deposits can be approved' }, 409)
    return json({ success: true, status: expected })
  } catch (error) {
    console.error('Admin deposit review failed:', error)
    return json({ error: 'Review failed' }, 500)
  }
}
