ALTER TABLE withdrawal_settings ADD COLUMN opening_hour INTEGER NOT NULL DEFAULT 10;
ALTER TABLE withdrawal_settings ADD COLUMN closing_hour INTEGER NOT NULL DEFAULT 17;
ALTER TABLE withdrawal_settings ADD COLUMN allowed_days TEXT NOT NULL DEFAULT '0,1,2,3,4';
ALTER TABLE withdrawal_settings ADD COLUMN daily_limit INTEGER NOT NULL DEFAULT 1;
