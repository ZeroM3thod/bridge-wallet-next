ALTER TABLE user_packages ADD COLUMN next_profit_at INTEGER NOT NULL DEFAULT 0;

UPDATE user_packages SET next_profit_at=started_at+86400000 WHERE next_profit_at=0;
