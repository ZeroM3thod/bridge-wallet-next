CREATE TABLE IF NOT EXISTS salary_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  tier_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  cycle_key TEXT NOT NULL,
  team_l1 INTEGER NOT NULL,
  team_l2 INTEGER NOT NULL,
  team_l3 INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  review_note TEXT,
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_salary_requests_user_cycle ON salary_requests(user_id, cycle_key, status);
CREATE INDEX IF NOT EXISTS idx_salary_requests_status ON salary_requests(status, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_salary_requests_one_per_cycle ON salary_requests(user_id, cycle_key) WHERE status IN ('pending','approved');
