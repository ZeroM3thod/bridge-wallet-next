-- Change role from INTEGER to TEXT
-- Step 1: Create new column
ALTER TABLE users ADD COLUMN role_text TEXT DEFAULT 'user';

-- Step 2: Migrate existing data
UPDATE users SET role_text = CASE 
  WHEN role = 2 THEN 'admin'
  ELSE 'user'
END;

-- Step 3: Drop old column and rename new one
-- SQLite doesn't support DROP COLUMN easily, so we keep role_text
