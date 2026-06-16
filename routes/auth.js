const express = require('express');
const router  = express.Router();
const { getDb } = require('../database');
const EXPOSE_OTP = process.env.EXPOSE_OTP === '1';
const { GAME_IDS } = require('../game-meta');
const SHOW_OTP_IN_UI = process.env.NODE_ENV !== 'production' || EXPOSE_OTP;

const OTP_TTL_SEC = 5 * 60;
const OTP_COOLDOWN_SEC = 60;
const OTP_MAX_ATTEMPTS = 5;

const rateBuckets = new Map();

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  return req.ip || req.connection?.remoteAddress || 'unknown';
}

function rateLimit(key, windowMs, max) {
  const now = Date.now();
  const b = rateBuckets.get(key);
  if (!b || now > b.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  b.count += 1;
  if (b.count > max) return { ok: false, retryAfterMs: Math.max(0, b.resetAt - now) };
  return { ok: true };
}

const KZ_MOBILE_PREFIXES = new Set([
  '700','701','702','703','704',
  '705','706',
  '707','708',
  '747',
  '771',
  '775','776','777','778',
]);

function normalizeKzPhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  let nsn = '';

  if (digits.length === 10) {
    nsn = digits;
  } else if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) {
    nsn = digits.slice(1);
  } else {
    return null;
  }

  if (nsn.length !== 10 || nsn[0] !== '7') return null;
  const prefix = nsn.slice(0, 3);
  if (!KZ_MOBILE_PREFIXES.has(prefix)) return null;

  return { phone: `+7${nsn}`, nsn, prefix };
}

// Check phone existence
router.post('/check-phone', (req, res) => {
  const ip = getClientIp(req);
  const rl = rateLimit(`check:${ip}`, 15 * 60 * 1000, 120);
  if (!rl.ok) return res.status(429).json({ ok: false, message: 'Тым жиі сұрау жіберілді. Біраздан соң қайталап көріңіз.' });

  const { phone } = req.body;
  const n = normalizeKzPhone(phone);
  if (!n) {
    return res.json({ ok: false, message: 'Жарамсыз қазақстандық нөмір.' });
  }

  const db = getDb();
  const variants = [n.phone, `7${n.nsn}`, `8${n.nsn}`, n.nsn];
  const user = db.prepare('SELECT * FROM users WHERE phone IN (?, ?, ?, ?)').get(...variants);
  
  res.json({ ok: true, isNew: !user });
});

// OTP жіберу (имитация)
router.post('/send-otp', (req, res) => {
  const ip = getClientIp(req);
  const rl = rateLimit(`send:${ip}`, 15 * 60 * 1000, 20);
  if (!rl.ok) return res.status(429).json({ ok: false, message: 'Тым жиі сұрау жіберілді. Біраздан соң қайталап көріңіз.' });

  const { phone } = req.body;
  const n = normalizeKzPhone(phone);
  if (!n) {
    return res.json({ ok: false, message: 'Жарамсыз қазақстандық нөмір.' });
  }

  const otp = String(Math.floor(1000 + Math.random() * 9000));
  const db = getDb();
  const last = db.prepare('SELECT last_sent_at FROM otp_sessions WHERE phone = ? ORDER BY id DESC LIMIT 1').get(n.phone);
  if (last && last.last_sent_at) {
    const lastTs = Date.parse(last.last_sent_at);
    if (Number.isFinite(lastTs)) {
      const diffSec = Math.floor((Date.now() - lastTs) / 1000);
      if (diffSec < OTP_COOLDOWN_SEC) {
        return res.json({ ok: false, message: `Код тым жиі сұралып жатыр. ${OTP_COOLDOWN_SEC - diffSec} секундтан кейін қайталап көріңіз.` });
      }
    }
  }

  const expiresAt = new Date(Date.now() + OTP_TTL_SEC * 1000).toISOString();
  db.prepare('DELETE FROM otp_sessions WHERE phone = ?').run(n.phone);
  db.prepare(`
    INSERT INTO otp_sessions (phone, code, expires_at, attempts, last_sent_at, ip)
    VALUES (?, ?, ?, 0, ?, ?)
  `).run(n.phone, otp, expiresAt, new Date().toISOString(), ip);

  if (EXPOSE_OTP) {
    console.log(`[SMS MOCK] Phone: ${n.phone}, Code: ${otp}`);
  }
  res.json({ ok: true, expiresIn: OTP_TTL_SEC, simulatedCode: SHOW_OTP_IN_UI ? otp : null, message: 'SMS жіберілді' });
});

// OTP тексеру + кіру
router.post('/verify-otp', (req, res) => {
  const ip = getClientIp(req);
  const rl = rateLimit(`verify:${ip}`, 15 * 60 * 1000, 60);
  if (!rl.ok) return res.status(429).json({ ok: false, message: 'Тым жиі сұрау жіберілді. Біраздан соң қайталап көріңіз.' });

  const { phone, code, name } = req.body;
  if (!phone || !code) return res.json({ ok: false, message: 'Деректер жеткіліксіз' });

  const n = normalizeKzPhone(phone);
  if (!n) return res.json({ ok: false, message: 'Жарамсыз қазақстандық нөмір.' });
  const db = getDb();

  const session = db.prepare(
    'SELECT * FROM otp_sessions WHERE phone = ? AND verified = 0 ORDER BY id DESC LIMIT 1'
  ).get(n.phone);

  if (!session) return res.json({ ok: false, message: 'Код табылмады. Қайта жіберіп көріңіз.' });
  if (Number(session.attempts || 0) >= OTP_MAX_ATTEMPTS) return res.json({ ok: false, message: 'Кодты енгізу шегі асып кетті. Кодты қайта сұратыңыз.' });
  if (new Date(session.expires_at) < new Date()) return res.json({ ok: false, message: 'Кодтың мерзімі аяқталды. Қайта жіберіңіз.' });

  if (session.code !== String(code).trim()) {
    const attempts = Number(session.attempts || 0) + 1;
    db.prepare('UPDATE otp_sessions SET attempts = ? WHERE id = ?').run(attempts, session.id);
    if (attempts >= OTP_MAX_ATTEMPTS) {
      db.prepare('DELETE FROM otp_sessions WHERE id = ?').run(session.id);
      return res.json({ ok: false, message: 'Кодты тым көп рет қате енгіздіңіз. Кодты қайта сұратыңыз.' });
    }
    return res.json({ ok: false, message: `Код қате. Қалған әрекет саны: ${OTP_MAX_ATTEMPTS - attempts}.` });
  }

  let isNew = false;
  let userId;

  function applyDailyLoginBonus(user) {
    const today = new Date().toISOString().split('T')[0];
    if (user.last_login === today) return { coins: 0, streak: user.streak || 0, today };
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newStreak = user.last_login === yesterday ? (user.streak || 0) + 1 : 1;
    const daily = 25;
    const weekly = newStreak % 7 === 0 ? 100 : 0;
    return { coins: daily + weekly, daily, weekly, streak: newStreak, today };
  }

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM otp_sessions WHERE phone = ?').run(n.phone);

    const variants = [n.phone, `7${n.nsn}`, `8${n.nsn}`, n.nsn];
    const existing = db.prepare('SELECT * FROM users WHERE phone IN (?, ?, ?, ?)').get(...variants);
    if (!existing) {
      const displayName = (name || '').trim();
      if (!displayName) {
        const err = new Error('NAME_REQUIRED');
        err.code = 'NAME_REQUIRED';
        throw err;
      }
      isNew = true;
      const result = db.prepare('INSERT INTO users (phone, name, coins) VALUES (?, ?, ?)').run(n.phone, displayName, 0);
      userId = result.lastInsertRowid;

      const insertProgress = db.prepare('INSERT OR IGNORE INTO game_progress (user_id, game_id) VALUES (?, ?)');
      GAME_IDS.forEach(g => insertProgress.run(userId, g));
    } else {
      userId = existing.id;
    }

    const user = db.prepare('SELECT id, last_login, streak FROM users WHERE id = ?').get(userId);
    const bonus = applyDailyLoginBonus(user);
    if (bonus.coins > 0) {
      db.prepare('UPDATE users SET coins = coins + ?, streak = ?, last_login = ? WHERE id = ?').run(bonus.coins, bonus.streak, bonus.today, userId);
      db.prepare('INSERT INTO transactions (user_id, amount, type, reason) VALUES (?, ?, ?, ?)').run(userId, bonus.daily, 'earn', 'Күнделікті бонус');
      if (bonus.weekly) {
        db.prepare('INSERT INTO transactions (user_id, amount, type, reason) VALUES (?, ?, ?, ?)').run(userId, bonus.weekly, 'earn', 'Серия бонусы (7 күн)');
      }
    }
  });

  try {
    tx();
  } catch (e) {
    if (e && e.code === 'NAME_REQUIRED') return res.json({ ok: false, message: 'Атыңызды енгізіңіз' });
    console.error('Verify OTP error:', e);
    return res.status(500).json({ ok: false, message: 'Ішкі сервер қатесі' });
  }

  req.session.userId = userId;
  // Race condition fix: save session explicitly before sending response
  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
      return res.status(500).json({ ok: false, message: 'Ішкі сервер қатесі' });
    }
    res.json({ ok: true, redirect: '/dashboard', isNew: isNew });
  });
});

// Шығу
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

module.exports = router;
