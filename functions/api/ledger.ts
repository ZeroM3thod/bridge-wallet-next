import type { PagesFunction } from '@cloudflare/workers-types'
type Env = { DB: D1Database }

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const sid = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!sid) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sid, Date.now()).first<{ user_id: string }>()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    const [rows, deposits, withdrawals] = await Promise.all([
      env.DB.prepare("SELECT id,type,amount,label,created_at AS createdAt FROM transactions WHERE user_id=? AND (label LIKE '%জমা%' OR label LIKE '%উত্তোলন%') ORDER BY created_at DESC LIMIT 500").bind(session.user_id).all(),
      env.DB.prepare('SELECT id,method,amount,status,gateway_transaction_id AS trx,out_trade_no AS reference,created_at AS createdAt FROM deposits WHERE user_id=? ORDER BY created_at DESC LIMIT 500').bind(session.user_id).all(),
      env.DB.prepare('SELECT x.id,x.amount,x.status,x.created_at AS createdAt,w.provider AS method,w.account FROM withdrawals x JOIN withdrawal_wallets w ON w.id=x.wallet_id WHERE x.user_id=? ORDER BY x.created_at DESC LIMIT 500').bind(session.user_id).all(),
    ])
    return Response.json({ transactions: rows.results, deposits: deposits.results, withdrawals: withdrawals.results }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Ledger load failed:', error)
    return Response.json({ error: 'Ledger unavailable' }, { status: 500 })
  }
}
