CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id=1),
  telegram_channel_url TEXT NOT NULL DEFAULT '',
  telegram_support_url TEXT NOT NULL DEFAULT '',
  whatsapp_support_url TEXT NOT NULL DEFAULT '',
  apk_download_url TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL
);
INSERT OR IGNORE INTO site_settings (id,updated_at) VALUES (1,unixepoch()*1000);
