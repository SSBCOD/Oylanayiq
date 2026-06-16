const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { getDb } = require('../database');
const ADMIN_KEY = process.env.ADMIN_KEY || '';

const SHOP_ITEMS = [
  { id: 'ticket_theatre',  name: 'Алматы театрына билет (50% жеңілдік)', price: 4500, category: 'real',    icon: '🎭' },
  { id: 'ticket_museum',   name: 'Ұлттық музей билеті',                    price: 3200, category: 'real',    icon: '🏛' },
  { id: 'avatar_nomad',    name: 'Номад аватары',                          price: 650, category: 'virtual', icon: '🏕' },
  { id: 'avatar_golden',   name: 'Алтын батыр аватары',                    price: 800, category: 'virtual', icon: '🥇' },
  { id: 'frame_gold',      name: 'Алтын жақтау (профиль)',                 price: 1200, category: 'virtual', icon: '✨' },
  { id: 'skin_caravan',    name: 'Керуен скині',                           price: 900, category: 'virtual', icon: '🐪' },
  { id: 'cert_friend',     name: 'Досыңа сыйлық сертификат',              price: 3800, category: 'real',    icon: '🎁' },
  { id: 'ticket_cinema',   name: 'Кино билеті (30% жеңілдік)',             price: 4000, category: 'real',    icon: '🎬' },
];

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ ok: false });
  next();
}

router.get('/items', requireAuth, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT coins FROM users WHERE id = ?').get(req.session.userId);
  const owned = db.prepare('SELECT item_id FROM rewards WHERE user_id = ?').all(req.session.userId).map(r => r.item_id);
  res.json({ ok: true, items: SHOP_ITEMS, userCoins: user.coins, ownedItemIds: owned });
});

router.get('/my-rewards', requireAuth, (req, res) => {
  const db = getDb();
  const rewards = db.prepare('SELECT * FROM rewards WHERE user_id = ? ORDER BY created_at DESC').all(req.session.userId);
  res.json({ ok: true, rewards });
});

router.post('/buy', requireAuth, (req, res) => {
  const { itemId } = req.body;
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return res.json({ ok: false, message: 'Тауар табылмады' });

  const db    = getDb();
  const userId = req.session.userId;

  try {
    const result = db.transaction(() => {
      if (item.category === 'virtual') {
        const owned = db.prepare('SELECT id FROM rewards WHERE user_id = ? AND item_id = ?').get(userId, item.id);
        if (owned) return { ok: false, message: 'Бұл тауарды сіз сатып алғансыз' };
      }

      const dec = db.prepare('UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?').run(item.price, userId, item.price);
      if (dec.changes !== 1) return { ok: false, message: 'Монета жеткіліксіз' };

      const qrCode = item.category === 'virtual' ? 'VIRTUAL_ITEM' : crypto.randomBytes(8).toString('hex').toUpperCase();
      const redeemed = item.category === 'virtual' ? 1 : 0;

      db.prepare('INSERT INTO transactions (user_id, amount, type, reason) VALUES (?, ?, ?, ?)').run(
        userId, item.price, 'spend', `Сатып алынды: ${item.name}`
      );
      db.prepare('INSERT INTO rewards (user_id, item_id, item_name, qr_code, redeemed) VALUES (?, ?, ?, ?, ?)').run(
        userId, item.id, item.name, qrCode, redeemed
      );

      const updatedUser = db.prepare('SELECT coins FROM users WHERE id = ?').get(userId);
      return { ok: true, itemId: item.id, qrCode: item.category === 'virtual' ? null : qrCode, newTotal: updatedUser.coins };
    })();

    res.json(result);
  } catch (e) {
    console.error('Shop buy error:', e);
    res.status(500).json({ ok: false, message: 'Ішкі сервер қатесі' });
  }
});

router.post('/redeem', (req, res) => {
  const key = req.headers['x-admin-key'] || req.body?.adminKey;
  if (!ADMIN_KEY || key !== ADMIN_KEY) return res.status(403).json({ ok: false, message: 'Рұқсат жоқ' });

  const { qrCode } = req.body || {};
  const code = String(qrCode || '').trim();
  if (!code) return res.json({ ok: false, message: 'Код енгізіңіз' });

  const db = getDb();
  try {
    const result = db.transaction(() => {
      const r = db.prepare('SELECT * FROM rewards WHERE qr_code = ?').get(code);
      if (!r) return { ok: false, message: 'Код табылмады' };
      if (r.redeemed) return { ok: false, message: 'Бұл код бұрын пайдаланылған' };
      db.prepare('UPDATE rewards SET redeemed = 1 WHERE id = ?').run(r.id);
      return { ok: true, itemName: r.item_name };
    })();
    res.json(result);
  } catch (e) {
    console.error('Redeem error:', e);
    res.status(500).json({ ok: false, message: 'Ішкі сервер қатесі' });
  }
});

module.exports = router;
