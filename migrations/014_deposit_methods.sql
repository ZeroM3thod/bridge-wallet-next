CREATE TABLE deposits_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  out_trade_no TEXT NOT NULL UNIQUE,
  gateway_transaction_id TEXT,
  method TEXT NOT NULL CHECK (method IN ('BKASH', 'NAGAD', 'ROCKET', 'BKASH-C', 'NAGAD-C')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at INTEGER NOT NULL,
  paid_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
INSERT INTO deposits_new (id,user_id,out_trade_no,gateway_transaction_id,method,amount,status,created_at,paid_at)
SELECT id,user_id,out_trade_no,gateway_transaction_id,method,amount,status,created_at,paid_at FROM deposits;
DROP TABLE deposits;
ALTER TABLE deposits_new RENAME TO deposits;
CREATE INDEX idx_deposits_user_created ON deposits(user_id, created_at DESC);
