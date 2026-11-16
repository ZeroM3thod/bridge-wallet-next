ALTER TABLE users ADD COLUMN phone_normalized TEXT;

UPDATE users
SET phone_normalized = CASE
  WHEN substr(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(phone,'০','0'),'১','1'),'২','2'),'৩','3'),'৪','4'),'৫','5'),'৬','6'),'৭','7'),'৮','8'),'৯','9'), 1, 1) = '0'
  THEN substr(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(phone,'০','0'),'১','1'),'২','2'),'৩','3'),'৪','4'),'৫','5'),'৬','6'),'৭','7'),'৮','8'),'৯','9'), 2)
  ELSE replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(phone,'০','0'),'১','1'),'২','2'),'৩','3'),'৪','4'),'৫','5'),'৬','6'),'৭','7'),'৮','8'),'৯','9')
END;

UPDATE users
SET phone_normalized = 'duplicate-' || id
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY phone_normalized ORDER BY created_at, id) AS position
    FROM users
  ) WHERE position > 1
);

CREATE UNIQUE INDEX idx_users_phone_normalized ON users(phone_normalized);
