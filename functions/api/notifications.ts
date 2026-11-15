import type { PagesFunction } from '@cloudflare/workers-types'

type Env = { DB: D1Database }
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const sid = request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
  if (!sid) return Response.json({ error: 'অনুগ্রহ করে আবার সাইন ইন করুন' }, { status: 401 })
  try {
    const session = await env.DB.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?').bind(sid, Date.now()).first<{ user_id: string }>()
    if (!session) return Response.json({ error: 'অনুগ্রহ করে আবার সাইন ইন করুন' }, { status: 401 })
    const [transactions, withdrawals] = await Promise.all([
      env.DB.prepare('SELECT id,label,amount,type,created_at AS createdAt FROM transactions WHERE user_id=? ORDER BY created_at DESC LIMIT 100').bind(session.user_id).all(),
      env.DB.prepare('SELECT x.id,x.amount,x.status,x.created_at AS createdAt,x.reviewed_at AS reviewedAt,w.provider FROM withdrawals x JOIN withdrawal_wallets w ON w.id=x.wallet_id WHERE x.user_id=? ORDER BY x.created_at DESC LIMIT 50').bind(session.user_id).all(),
    ])
    const items = [
      ...transactions.results.map((row: any) => ({ id: row.id, title: row.label === 'Team salary' ? 'দলীয় বেতন' : row.label || 'লেনদেন', detail: `${row.type === 'credit' ? '+' : '−'}${Number(row.amount).toLocaleString('bn-BD')}`, createdAt: row.createdAt, kind: row.label?.includes('লাভ') ? 'profit' : row.label?.includes('প্যাকেজ') ? 'package' : row.label?.includes('জমা') ? 'deposit' : 'transaction' })),
      ...withdrawals.results.map((row: any) => ({ id: `withdrawal-${row.id}`, title: row.status === 'approved' ? 'উত্তোলন অনুমোদিত' : row.status === 'rejected' ? 'উত্তোলন প্রত্যাখ্যাত' : 'উত্তোলনের আবেদন জমা হয়েছে', detail: `${Number(row.amount).toLocaleString('bn-BD')} · ${row.provider === 'bkash' ? 'বিকাশ' : row.provider === 'nagad' ? 'নগদ' : row.provider}`, createdAt: row.reviewedAt || row.createdAt, kind: 'withdrawal' })),
    ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 100)
    return Response.json({ notifications: items }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Notifications load failed:', error)
    return Response.json({ error: 'নোটিফিকেশন পাওয়া যাচ্ছে না' }, { status: 500 })
  }
}
