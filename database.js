const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'oylanayiq.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    setInterval(() => cleanupOtpSessions(), 60 * 60 * 1000);
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      phone      TEXT UNIQUE NOT NULL,
      name       TEXT NOT NULL,
      coins      INTEGER NOT NULL DEFAULT 0,
      avatar_id  INTEGER NOT NULL DEFAULT 1,
      streak     INTEGER NOT NULL DEFAULT 0,
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_progress (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id            INTEGER NOT NULL,
      game_id            TEXT NOT NULL,
      current_level      INTEGER NOT NULL DEFAULT 1,
      max_level_reached  INTEGER NOT NULL DEFAULT 1,
      total_score        INTEGER NOT NULL DEFAULT 0,
      stars_earned       INTEGER NOT NULL DEFAULT 0,
      UNIQUE(user_id, game_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      amount     INTEGER NOT NULL,
      type       TEXT NOT NULL CHECK(type IN ('earn','spend')),
      reason     TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      item_id    TEXT NOT NULL,
      item_name  TEXT NOT NULL,
      qr_code    TEXT NOT NULL,
      redeemed   INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS otp_sessions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      phone      TEXT NOT NULL,
      code       TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      verified   INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL,
      achieve_id  TEXT NOT NULL,
      unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, achieve_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  ensureOtpSchema();
  ensureUserCosmeticsSchema();
}

function ensureOtpSchema() {
  const cols = db.prepare("PRAGMA table_info('otp_sessions')").all().map(r => r.name);
  if (!cols.includes('attempts')) {
    db.exec("ALTER TABLE otp_sessions ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0");
  }
  if (!cols.includes('created_at')) {
    db.exec("ALTER TABLE otp_sessions ADD COLUMN created_at TEXT NOT NULL DEFAULT (datetime('now'))");
  }
  if (!cols.includes('last_sent_at')) {
    db.exec("ALTER TABLE otp_sessions ADD COLUMN last_sent_at TEXT NOT NULL DEFAULT (datetime('now'))");
  }
  if (!cols.includes('ip')) {
    db.exec("ALTER TABLE otp_sessions ADD COLUMN ip TEXT");
  }
}

function ensureUserCosmeticsSchema() {
  const cols = db.prepare("PRAGMA table_info('users')").all().map(r => r.name);
  if (!cols.includes('equipped_avatar')) {
    db.exec("ALTER TABLE users ADD COLUMN equipped_avatar TEXT");
  }
  if (!cols.includes('equipped_frame')) {
    db.exec("ALTER TABLE users ADD COLUMN equipped_frame TEXT");
  }
  if (!cols.includes('equipped_skin')) {
    db.exec("ALTER TABLE users ADD COLUMN equipped_skin TEXT");
  }
}

function cleanupOtpSessions() {
  getDb().prepare(
    "DELETE FROM otp_sessions WHERE expires_at < datetime('now') OR verified = 1"
  ).run();
}

module.exports = { getDb, cleanupOtpSessions };
