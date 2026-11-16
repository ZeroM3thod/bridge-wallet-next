ALTER TABLE users ADD COLUMN welcome_bonus_locked INTEGER NOT NULL DEFAULT 0;
ALTER TABLE site_settings ADD COLUMN welcome_bonus_enabled INTEGER NOT NULL DEFAULT 1;
ALTER TABLE site_settings ADD COLUMN welcome_bonus_amount INTEGER NOT NULL DEFAULT 100;
