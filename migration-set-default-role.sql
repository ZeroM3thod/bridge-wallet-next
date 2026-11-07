-- Set default role for existing users
UPDATE users SET role = 1 WHERE role IS NULL;
