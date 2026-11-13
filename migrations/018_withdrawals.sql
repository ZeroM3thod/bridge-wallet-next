CREATE TABLE IF NOT EXISTS withdrawal_settings (
  id INTEGER PRIMARY KEY CHECK (id=1),
  minimum_amount INTEGER NOT NULL DEFAULT 1000,
  fee_percent REAL NOT NULL DEFAULT 2,
  updated_at INTEGER NOT NULL
);
INSERT OR IGNORE INTO withdrawal_settings (id,minimum_amount,fee_percent,updated_at) VALUES (1,1000,2,unixepoch()*1000);
CREATE TABLE IF NOT EXISTS withdrawal_wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL CHECK (provider IN ('bkash','nagad')),
  account TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id,provider,account)
);
CREATE INDEX IF NOT EXISTS idx_withdrawal_wallet_user ON withdrawal_wallets(user_id,created_at);
CREATE TRIGGER IF NOT EXISTS withdrawal_wallet_limit BEFORE INSERT ON withdrawal_wallets
WHEN (SELECT COUNT(*) FROM withdrawal_wallets WHERE user_id=NEW.user_id)>=2
BEGIN SELECT RAISE(ABORT,'Maximum two withdrawal wallets'); END;
CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  wallet_id TEXT NOT NULL REFERENCES withdrawal_wallets(id),
  amount INTEGER NOT NULL,
  fee INTEGER NOT NULL,
  net INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER,
  reviewed_by TEXT REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created ON withdrawals(created_at DESC);
