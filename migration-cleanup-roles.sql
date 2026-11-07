-- Clean up role columns - make role_text the source of truth
UPDATE users SET role = role_text WHERE role_text IS NOT NULL;
UPDATE users SET role_text = 'user' WHERE role_text IS NULL;
UPDATE users SET role = role_text;
