require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const { getDb } = require('./database');

const authRoutes  = require('./routes/auth');
const userRoutes  = require('./routes/user');
const gameRoutes  = require('./routes/games');
const shopRoutes  = require('./routes/shop');

const app  = express();
const PORT = process.env.PORT || 3000;
const INSECURE_SECRET_DEFAULT = 'oylanayiq-secret-2024';
const isProd = process.env.NODE_ENV === 'production';
const SESSION_SECRET = process.env.SESSION_SECRET || INSECURE_SECRET_DEFAULT;

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === INSECURE_SECRET_DEFAULT) {
  if (isProd) {
    throw new Error(
      '[FATAL] SESSION_SECRET is not set or uses the insecure default value. ' +
      'Set a strong, random SESSION_SECRET environment variable before starting in production.'
    );
  } else {
    console.warn(
      '[WARNING] SESSION_SECRET is not set. Using an insecure default value. ' +
      'Set SESSION_SECRET in your .env file before deploying to production.'
    );
  }
}
const SESSION_COOKIE_NAME = isProd ? 'oq.sid' : `oq.sid.dev.${PORT}.${Date.now().toString(36)}`;

if (isProd) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

// Базаны инициализациялау
getDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 1. Статикалық файлдарды кэштеу (performance)
app.get('/favicon.ico',(req,res)=>res.sendFile(require('path').join(__dirname,'public','favicon.svg'),{'Content-Type':'image/svg+xml'}));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: isProd ? '1d' : 0 }));

// 2. Қауіпсіздік және API кэшін өшіру (dynamic routes)
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

const SQLiteStore = require('connect-sqlite3')(session);

app.use(session({
  name: SESSION_COOKIE_NAME,
  store: new SQLiteStore({ db: 'sessions.db', dir: './' }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd
  }
}));

// Маршруттар
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/shop', shopRoutes);

// Беттер
const viewsDir = path.join(__dirname, 'views');

app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.sendFile(path.join(viewsDir, 'auth.html'));
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(viewsDir, 'dashboard.html'));
});

app.get('/game/:id', requireAuth, (req, res) => {
  res.sendFile(path.join(viewsDir, 'game.html'));
});

app.get('/profile', requireAuth, (req, res) => {
  res.sendFile(path.join(viewsDir, 'profile.html'));
});

app.get('/shop', requireAuth, (req, res) => {
  res.sendFile(path.join(viewsDir, 'shop.html'));
});

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/');
  next();
}

// Глобалды қате ұстағыш (Global Error Handler)
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ ok: false, message: 'Ішкі сервер қатесі' });
});

app.listen(PORT, () => {
  console.log(`Oylanayiq платформасы іске қосылды: http://localhost:${PORT}`);
});
