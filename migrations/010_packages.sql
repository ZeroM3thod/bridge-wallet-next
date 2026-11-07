CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  daily_rate REAL NOT NULL CHECK (daily_rate > 0 AND daily_rate <= 100),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  max_per_user INTEGER NOT NULL DEFAULT 0,
  stock_limit INTEGER NOT NULL DEFAULT 0,
  min_active_referrals INTEGER NOT NULL DEFAULT 0,
  requires_package_id TEXT NOT NULL DEFAULT '',
  allow_while_active INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS user_packages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  package_id TEXT NOT NULL REFERENCES packages(id),
  price_paid INTEGER NOT NULL,
  daily_rate REAL NOT NULL,
  duration_days INTEGER NOT NULL,
  started_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_packages_user_status ON user_packages(user_id, status, expires_at);
CREATE TABLE IF NOT EXISTS daily_profits (
  id TEXT PRIMARY KEY,
  user_package_id TEXT NOT NULL REFERENCES user_packages(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  day_number INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user_package_id, day_number)
);
CREATE INDEX IF NOT EXISTS idx_daily_profits_user ON daily_profits(user_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_profits_package_day ON daily_profits(user_package_id, day_number);
