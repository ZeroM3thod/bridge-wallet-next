-- Add role column to existing users table
ALTER TABLE users ADD COLUMN role INTEGER DEFAULT 1;
