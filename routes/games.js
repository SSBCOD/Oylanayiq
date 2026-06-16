const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { GAMES_META } = require('../game-meta');

const STARS_COINS = [12, 24, 36];

function clampInt(v, min, max) {
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function speedBonusByLevel(level) {
  if (level <= 3) return 6;
  if (level <= 7) return 10;
  return 14;
}

function baseCoinsByLevel(level) {
  return 18 + level * 3;
}

function earnedCoinsFor(level, starsCount, isFast) {
  const base = baseCoinsByLevel(level);
  const stars = STARS_COINS[starsCount - 1] || STARS_COINS[0];
  const speed = isFast ? speedBonusByLevel(level) : 0;
  return base + stars + speed;
}

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ ok: false });
  next();
}

// Барлық ойын прогресі
router.get('/progress', requireAuth, (req, res) => {
  const db = getDb();
  const progress = db.prepare('SELECT * FROM game_progress WHERE user_id = ?').all(req.session.userId);
  res.json({ ok: true, progress, meta: GAMES_META });
});

// Ойын деңгей аяқтау
router.post('/complete', requireAuth, (req, res) => {
  const { gameId, lvl, stars, fast } = req.body;

  if (!GAMES_META[gameId]) return res.json({ ok: false, message: 'Ойын табылмады' });

  const db = getDb();
  const userId = req.session.userId;

  const maxLevels = GAMES_META[gameId].maxLevels;

  const parsedLevel = clampInt(lvl, 1, maxLevels);
  if (parsedLevel < 1 || parsedLevel > maxLevels) {
    return res.json({ ok: false, message: 'Қате деңгей' });
  }

  let starsCount = Number.parseInt(stars, 10);
  if (starsCount !== 1 && starsCount !== 2 && starsCount !== 3) starsCount = 1;

  const isFast = fast === true || fast === 'true' || fast === 1 || fast === '1';
  const earnedCoins = earnedCoinsFor(parsedLevel, starsCount, isFast);
  const addedScore = starsCount * 100 + (isFast ? 50 : 0);

  try {
    const result = db.transaction(() => {
      let prog = db.prepare('SELECT * FROM game_progress WHERE user_id = ? AND game_id = ?').get(userId, gameId);
      if (!prog) {
        db.prepare('INSERT INTO game_progress (user_id, game_id) VALUES (?, ?)').run(userId, gameId);
        prog = db.prepare('SELECT * FROM game_progress WHERE user_id = ? AND game_id = ?').get(userId, gameId);
      }

      if (prog.current_level !== parsedLevel) {
        return { ok: false, message: 'Деңгей реттілігі бұзылды' };
      }

      const nextLevel = Math.min(parsedLevel + 1, maxLevels);
      const maxReached = Math.max(prog.max_level_reached, nextLevel);

      db.prepare(`
        UPDATE game_progress
        SET current_level = ?, max_level_reached = ?, total_score = total_score + ?, stars_earned = stars_earned + ?
        WHERE user_id = ? AND game_id = ?
      `).run(nextLevel, maxReached, addedScore, starsCount, userId, gameId);

      db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(earnedCoins, userId);
      db.prepare('INSERT INTO transactions (user_id, amount, type, reason) VALUES (?, ?, ?, ?)').run(
        userId, earnedCoins, 'earn', `${GAMES_META[gameId].name} — ${parsedLevel}-деңгей`
      );

      checkAchievements(db, userId);

      const updatedUser = db.prepare('SELECT coins FROM users WHERE id = ?').get(userId);
      return { ok: true, earnedCoins, newTotal: updatedUser.coins };
    })();

    if (!result.ok) return res.json(result);
    res.json(result);
  } catch (e) {
    console.error('Game complete error:', e);
    res.status(500).json({ ok: false, message: 'Ішкі сервер қатесі' });
  }
});

function checkAchievements(db, userId) {
  const allProgress = db.prepare('SELECT * FROM game_progress WHERE user_id = ?').all(userId);

  const gamesCompleted = allProgress.filter(p => p.max_level_reached >= 5).length;
  if (gamesCompleted >= 6) grantAchievement(db, userId, 'half_way', 'Жарты жол', 100);

  const allDone = allProgress.filter(p => p.max_level_reached >= 10).length;
  if (allDone >= 12) grantAchievement(db, userId, 'legend', 'Ойын жеңімпазы', 500);

  const totalStars = allProgress.reduce((s, p) => s + p.stars_earned, 0);
  if (totalStars >= 50) grantAchievement(db, userId, 'star_50', '50 жұлдыз', 200);
}

function grantAchievement(db, userId, achieveId, name, coins) {
  const exists = db.prepare('SELECT id FROM achievements WHERE user_id = ? AND achieve_id = ?').get(userId, achieveId);
  if (exists) return;
  db.prepare('INSERT INTO achievements (user_id, achieve_id) VALUES (?, ?)').run(userId, achieveId);
  db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?').run(coins, userId);
  db.prepare('INSERT INTO transactions (user_id, amount, type, reason) VALUES (?, ?, ?, ?)').run(userId, coins, 'earn', `Жетістік: ${name}`);
}

module.exports = router;
