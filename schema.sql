-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  withdrawal_password_hash TEXT,
  balance INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  role TEXT DEFAULT 'user',
  created_at INTEGER NOT NULL,
  FOREIGN KEY (referred_by) REFERENCES users(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral ON users(referral_code);

-- Email OTPs
CREATE TABLE email_otps (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_otp_email ON email_otps(email);
CREATE INDEX idx_otp_expires ON email_otps(expires_at);

-- Rate limiting
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  reset_at INTEGER NOT NULL
);

CREATE INDEX idx_rate_reset ON rate_limits(reset_at);

-- Transactions
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  label TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_tx_user ON transactions(user_id);
