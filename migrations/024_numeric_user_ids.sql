ALTER TABLE users ADD COLUMN old_referral_code TEXT;

UPDATE users SET old_referral_code = referral_code WHERE referral_code IS NOT NULL;
UPDATE users SET referral_code = 'legacy-' || id;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS row_number
  FROM users
)
UPDATE users
SET referral_code = printf('%08d', 10000000 + (SELECT row_number - 1 FROM numbered WHERE numbered.id = users.id));
