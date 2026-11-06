CREATE TABLE IF NOT EXISTS deposits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  out_trade_no TEXT NOT NULL UNIQUE,
  gateway_transaction_id TEXT,
  method TEXT NOT NULL CHECK (method IN ('BKASH', 'NAGAD')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at INTEGER NOT NULL,
  paid_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_deposits_user_created ON deposits(user_id, created_at DESC);
