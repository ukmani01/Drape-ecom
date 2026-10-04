import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import { errorHandler } from './src/middleware/errorHandler.js';
import { logger } from './src/utils/logger.js';

// ---- Import routes ----
import authRoutes from './src/routes/auth.js';
import storeRoutes from './src/routes/stores.js';
import productRoutes from './src/routes/products.js';
import orderRoutes from './src/routes/orders.js';
import cartRoutes from './src/routes/cart.js';
import adminRoutes from './src/routes/admin.js';
import ownerRoutes from './src/routes/owner.js';
import settingsRoutes from './src/routes/settings.js';
import themeRoutes from './src/routes/themes.js';
import uploadRoutes from './src/routes/upload.js';
import paymentRoutes from './src/routes/payment.js';
import customerRoutes from './src/routes/customers.js';
import wishlistRoutes from './src/routes/wishlist.js';
import analyticsRoutes from './src/routes/analytics.js';
import couponRoutes from './src/routes/coupons.js';
import subscriptionRoutes from './src/routes/subscriptions.js';
import reportRoutes from './src/routes/reports.js';
import inventoryRoutes from './src/routes/inventory.js';
import notificationRoutes from './src/routes/notifications.js';
import reviewRoutes from './src/routes/reviews.js';
import categoryRoutes from './src/routes/categories.js';
import recentlyViewedRoutes from './src/routes/recently-viewed.js';

// ✅ NEW: Import deploy routes
import deployRoutes from './src/routes/deploy.js';
// ✅ NEW: Import public routes
import publicRoutes from './src/routes/public.js';
import storefrontRoutes from './src/routes/storefront.js';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers - configured for multi-tenant and cross-origin static assets
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", '*'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://*'],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://*'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://*'],
      connectSrc: ["'self'", 'https://*', 'http://localhost:*', 'ws:', 'wss:'],
    },
  },
}));

// =============================================================
// ✅ 1. CORS CONFIGURATION (Registered BEFORE rate limiter & body parsers)
// =============================================================
const allowedOrigins = [
  'https://drape-ecom.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5002',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      /\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    // Allow request for multi-tenant customer storefronts
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// =============================================================
// ✅ 2. RATE LIMITER (Registered AFTER CORS; skips OPTIONS preflight)
// =============================================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (req.method === 'OPTIONS') return true;
    if (process.env.NODE_ENV === 'development') return true;
    return false;
  },
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use(limiter);

app.use(mongoSanitize());

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// =============================================================
// ✅ 3. SERVE STATIC HTML STOREFRONTS & ASSETS (with correct MIME headers)
// =============================================================
const staticPath = path.join(__dirname, 'public/stores');
const sharedAssetsPath = path.join(staticPath, 'assets');
console.log(`📂 Serving static files from: ${staticPath}`);

const staticHeaderOptions = {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
  },
};

// Direct assets route: /stores/assets/global.css, /stores/assets/app.js
app.use('/stores/assets', express.static(sharedAssetsPath, staticHeaderOptions));

// Store-specific assets route: /stores/:storeSlug/assets/...
app.use('/stores/:storeSlug/assets', express.static(sharedAssetsPath, staticHeaderOptions));

// Fallback: check if store-specific folder has assets
app.use('/stores/:storeSlug/assets', (req, res, next) => {
  const storeSpecificAssets = path.join(staticPath, req.params.storeSlug, 'assets');
  express.static(storeSpecificAssets, staticHeaderOptions)(req, res, next);
});

// Storefront SSR Dynamic Router
app.use('/stores', storefrontRoutes);

// Static store files fallback
app.use('/stores', express.static(staticPath, {
  ...staticHeaderOptions,
  extensions: ['html'],
  index: 'index.html',
}));

// Fallback public folder serving
app.use(express.static(path.join(__dirname, 'public'), staticHeaderOptions));

// =============================================================
// ✅ FALLBACK ROUTE – Serves HTML directly if static fails
// =============================================================
app.get('/stores/:storeId/:filename(*)', async (req, res) => {
  const storeId = req.params.storeId;
  const filename = req.params.filename || 'index.html';
  const filePath = path.join(staticPath, storeId, filename);
  
  console.log(`📂 Fallback serving: ${filePath}`);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.send(content);
  } catch (err) {
    res.status(404).send(`File not found: ${filename}`);
  }
});

// Handle root store URL: /stores/kandan/
app.get('/stores/:storeId', async (req, res) => {
  const storeId = req.params.storeId;
  const filePath = path.join(staticPath, storeId, 'index.html');
  
  console.log(`📂 Fallback serving index for: ${storeId}`);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.send(content);
  } catch {
    res.status(404).send(`Store not found: ${storeId}`);
  }
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);

// ✅ NEW: Mount deploy routes
app.use('/api/stores', deployRoutes);
// ✅ NEW: Mount public routes (guest cart, checkout, etc.)
app.use('/api/public', publicRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Error handler (must be last)
app.use(errorHandler);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 2,
  heartbeatFrequencyMS: 10000,
})
.then(() => {
  logger.info('✅ MongoDB connected');
  app.listen(PORT, '0.0.0.0', () => logger.info(`🚀 Server running on port ${PORT}`));
})
.catch(err => {
  logger.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

export default app;