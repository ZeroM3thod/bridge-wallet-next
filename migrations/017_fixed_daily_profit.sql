ALTER TABLE packages ADD COLUMN daily_profit INTEGER NOT NULL DEFAULT 300;
ALTER TABLE user_packages ADD COLUMN daily_profit INTEGER NOT NULL DEFAULT 300;

UPDATE packages SET daily_profit=MAX(1,ROUND(price*daily_rate/100));
UPDATE user_packages SET daily_profit=MAX(1,ROUND(price_paid*daily_rate/100));
