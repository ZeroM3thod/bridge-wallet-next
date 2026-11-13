CREATE TABLE IF NOT EXISTS deposit_settings (
  id INTEGER PRIMARY KEY CHECK (id=1),
  minimum_amount INTEGER NOT NULL DEFAULT 300,
  updated_at INTEGER NOT NULL
);
INSERT OR IGNORE INTO deposit_settings (id,minimum_amount,updated_at) VALUES (1,300,unixepoch()*1000);
