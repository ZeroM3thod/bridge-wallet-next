CREATE TABLE deposits_updated (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  out_trade_no TEXT NOT NULL UNIQUE,
  gateway_transaction_id TEXT,
  method TEXT NOT NULL CHECK (method IN ('BKASH','NAGAD','ROCKET','BKASH-C','NAGAD-C')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled','rejected')),
  created_at INTEGER NOT NULL,
  paid_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
INSERT INTO deposits_updated SELECT id,user_id,out_trade_no,gateway_transaction_id,method,amount,status,created_at,paid_at FROM deposits;
DROP TABLE deposits;
ALTER TABLE deposits_updated RENAME TO deposits;
CREATE INDEX IF NOT EXISTS idx_deposits_user_created ON deposits(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS deposit_events (
  id TEXT PRIMARY KEY,
  deposit_id TEXT NOT NULL REFERENCES deposits(id),
  actor_id TEXT REFERENCES users(id),
  event TEXT NOT NULL CHECK (event IN ('created','paid','failed','cancelled','approved','rejected')),
  previous_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_deposit_events_deposit ON deposit_events(deposit_id, created_at DESC);
INSERT INTO deposit_events (id,deposit_id,event,previous_status,new_status,note,created_at)
SELECT lower(hex(randomblob(16))),id,
  CASE status WHEN 'paid' THEN 'paid' WHEN 'failed' THEN 'failed' WHEN 'cancelled' THEN 'cancelled' WHEN 'rejected' THEN 'rejected' ELSE 'created' END,
  NULL,status,'Imported existing deposit state',COALESCE(paid_at,created_at)
FROM deposits;
