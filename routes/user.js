const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { GAMES_META } = require('../game-meta');

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ ok: false, message: 'Авторизация қажет' });
  next();
}

// Профиль мәліметтері
router.get('/me', requireAuth, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, phone, name, coins, avatar_id, equipped_avatar, equipped_frame, equipped_skin, streak, created_at FROM users WHERE id = ?').get(req.session.userId);
  if (!user) return res.status(404).json({ ok: false });

  const progress = db.prepare('SELECT * FROM game_progress WHERE user_id = ?').all(req.session.userId);
  const achievements = db.prepare('SELECT achieve_id, unlocked_at FROM achievements WHERE user_id = ?').all(req.session.userId);
  const totalStars = progress.reduce((s, p) => s + p.stars_earned, 0);
  const totalScore = progress.reduce((s, p) => s + p.total_score, 0);

  res.json({ ok: true, user, progress, achievements, totalStars, totalScore, gamesMeta: GAMES_META });
});

// Атын өзгерту
router.post('/update-name', requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.json({ ok: false, message: 'Атыңызды енгізіңіз' });
  const db = getDb();
  db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), req.session.userId);
  res.json({ ok: true });
});

// Аватар ауыстыру
router.post('/update-avatar', requireAuth, (req, res) => {
  const { avatarId } = req.body;
  if (!avatarId) return res.json({ ok: false });
  
  const idNum = parseInt(avatarId) || 1;
  const db = getDb();
  
  if (idNum === 2) {
    const owned = db.prepare('SELECT id FROM rewards WHERE user_id = ? AND item_id = ?').get(req.session.userId, 'avatar_nomad');
    if (!owned) return res.json({ ok: false, message: 'Бұл аватарды дүкеннен сатып алу қажет' });
    db.prepare('UPDATE users SET equipped_avatar = ? WHERE id = ?').run('avatar_nomad', req.session.userId);
  } else if (idNum === 3) {
    const owned = db.prepare('SELECT id FROM rewards WHERE user_id = ? AND item_id = ?').get(req.session.userId, 'avatar_golden');
    if (!owned) return res.json({ ok: false, message: 'Бұл аватарды дүкеннен сатып алу қажет' });
    db.prepare('UPDATE users SET equipped_avatar = ? WHERE id = ?').run('avatar_golden', req.session.userId);
  } else if (idNum > 4) {
    return res.json({ ok: false, message: 'Қате аватар' });
  } else {
    db.prepare('UPDATE users SET equipped_avatar = NULL WHERE id = ?').run(req.session.userId);
  }

  db.prepare('UPDATE users SET avatar_id = ? WHERE id = ?').run(idNum, req.session.userId);
  const user = db.prepare('SELECT id, phone, name, coins, avatar_id, equipped_avatar, equipped_frame, equipped_skin, streak, created_at FROM users WHERE id = ?').get(req.session.userId);
  res.json({ ok: true, user });
});

router.post('/equip', requireAuth, (req, res) => {
  const { type, itemId } = req.body || {};
  const slot = String(type || '').trim();
  if (!['avatar', 'frame', 'skin'].includes(slot)) return res.json({ ok: false, message: 'Қате түрі' });

  const rawItemId = itemId === null || itemId === undefined ? '' : String(itemId).trim();
  const db = getDb();
  const userId = req.session.userId;

  if (!rawItemId) {
    if (slot === 'avatar') {
      db.prepare('UPDATE users SET avatar_id = 1, equipped_avatar = NULL WHERE id = ?').run(userId);
    } else if (slot === 'frame') {
      db.prepare('UPDATE users SET equipped_frame = NULL WHERE id = ?').run(userId);
    } else if (slot === 'skin') {
      db.prepare('UPDATE users SET equipped_skin = NULL WHERE id = ?').run(userId);
    }
    const user = db.prepare('SELECT id, phone, name, coins, avatar_id, equipped_avatar, equipped_frame, equipped_skin, streak, created_at FROM users WHERE id = ?').get(userId);
    return res.json({ ok: true, user });
  }

  const owned = db.prepare('SELECT id FROM rewards WHERE user_id = ? AND item_id = ?').get(userId, rawItemId);
  if (!owned) return res.json({ ok: false, message: 'Алдымен бұл затты дүкеннен сатып алыңыз' });

  if (slot === 'avatar') {
    const avatarId = rawItemId === 'avatar_nomad' ? 2 : rawItemId === 'avatar_golden' ? 3 : 1;
    if (avatarId === 1) return res.json({ ok: false, message: 'Қате аватар' });
    db.prepare('UPDATE users SET avatar_id = ?, equipped_avatar = ? WHERE id = ?').run(avatarId, rawItemId, userId);
  } else if (slot === 'frame') {
    if (rawItemId !== 'frame_gold') return res.json({ ok: false, message: 'Қате жақтау' });
    db.prepare('UPDATE users SET equipped_frame = ? WHERE id = ?').run(rawItemId, userId);
  } else if (slot === 'skin') {
    if (rawItemId !== 'skin_caravan') return res.json({ ok: false, message: 'Қате скин' });
    db.prepare('UPDATE users SET equipped_skin = ? WHERE id = ?').run(rawItemId, userId);
  }

  const user = db.prepare('SELECT id, phone, name, coins, avatar_id, equipped_avatar, equipped_frame, equipped_skin, streak, created_at FROM users WHERE id = ?').get(userId);
  res.json({ ok: true, user });
});

// Транзакция тарихы
router.get('/transactions', requireAuth, (req, res) => {
  const db = getDb();
  const list = db.prepare(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 30'
  ).all(req.session.userId);
  res.json({ ok: true, transactions: list });
});

module.exports = router;
