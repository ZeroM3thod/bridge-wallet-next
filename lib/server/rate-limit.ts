type Env = {
  DB: D1Database
}

export async function checkRateLimit(
  env: Env,
  key: string,
  limit: number,
  windowMs: number = 60000
): Promise<{ allowed: boolean; error?: string }> {
  const now = Date.now()
  const result = await env.DB.prepare(
    'SELECT count, reset_at FROM rate_limits WHERE key = ?'
  ).bind(key).first()

  if (!result) {
    await env.DB.prepare(
      'INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)'
    ).bind(key, now + windowMs).run()
    return { allowed: true }
  }

  if (now > result.reset_at) {
    await env.DB.prepare(
      'UPDATE rate_limits SET count = 1, reset_at = ? WHERE key = ?'
    ).bind(now + windowMs, key).run()
    return { allowed: true }
  }

  if (result.count >= limit) {
    return { allowed: false, error: 'অনেক বেশি অনুরোধ। একটু পরে চেষ্টা করুন।' }
  }

  await env.DB.prepare(
    'UPDATE rate_limits SET count = count + 1 WHERE key = ?'
  ).bind(key).run()
  return { allowed: true }
}

export async function checkCooldown(
  env: Env,
  email: string,
  cooldownMs: number = 60000
): Promise<{ allowed: boolean; error?: string }> {
  const result = await env.DB.prepare(
    'SELECT created_at FROM email_otps WHERE email = ? ORDER BY created_at DESC LIMIT 1'
  ).bind(email).first()

  if (!result) return { allowed: true }

  const timeSince = Date.now() - result.created_at
  if (timeSince < cooldownMs) {
    return { allowed: false, error: `আরও ${Math.ceil((cooldownMs - timeSince) / 1000)} সেকেন্ড অপেক্ষা করুন` }
  }

  return { allowed: true }
}
