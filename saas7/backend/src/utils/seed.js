import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, Store, Plan, Theme, Subscription, Settings, Counter } from '../models/index.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('🔍 MONGODB_URI:', process.env.MONGODB_URI);

// =============================================================
// 🔥 SUPER ADMIN CREDENTIALS - MUST BE IN ENV (NO FALLBACK)
// =============================================================
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  console.error('❌ CRITICAL SECURITY ERROR:');
  console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env file!');
  console.error('❌ Seeding aborted to prevent insecure default credentials.');
  process.exit(1);
}
// =============================================================

const themes = [
  { id: 1, name: 'Level 1 – Minimal', description: 'Clean, simple, professional', isPremium: false },
  { id: 2, name: 'Level 2 – Modern Fashion', description: 'Stylish, elegant, premium spacing', isPremium: false },
  { id: 3, name: 'Level 3 – Luxury Boutique', description: 'Warm luxury, premium cards', isPremium: false },
  { id: 4, name: 'Level 4 – Editorial Magazine', description: 'Magazine layout, storytelling style', isPremium: false },
  { id: 5, name: 'Level 5 – Premium Brand', description: 'Inspired by premium global brands', isPremium: true },
  { id: 6, name: 'Level 6 – Ultra Luxury', description: 'Very high-end, dark luxury', isPremium: true },
  { id: 7, name: 'Level 7 – Scandinavian Minimal', description: 'Soft colors, airy spacing', isPremium: true },
  { id: 8, name: 'Level 8 – Glass Morphism', description: 'Modern glass UI, soft transparency', isPremium: true },
  { id: 9, name: 'Level 9 – Future Commerce', description: 'Next-generation ecommerce, animations', isPremium: true },
  { id: 10, name: 'Level 10 – Signature Elite', description: 'Highest quality, premium ecommerce', isPremium: true },
];

const plans = [
  { name: 'Free', code: 'free', price: 0, currency: 'INR', billingCycle: 'monthly', features: { maxProducts: 10, maxStorage: 100, maxStaff: 1, themeAccess: [1], analytics: false, bulkImport: false, aiTools: false, customDomain: false }, isActive: true, isDefault: true, order: 0 },
  { name: 'Starter', code: 'starter', price: 499, currency: 'INR', billingCycle: 'monthly', features: { maxProducts: 50, maxStorage: 500, maxStaff: 3, themeAccess: [1,2,3], analytics: true, bulkImport: false, aiTools: false, customDomain: false }, isActive: true, isDefault: false, order: 1 },
  { name: 'Premium', code: 'premium', price: 999, currency: 'INR', billingCycle: 'monthly', features: { maxProducts: 200, maxStorage: 2000, maxStaff: 5, themeAccess: [1,2,3,4,5,6], analytics: true, bulkImport: true, aiTools: false, customDomain: false }, isActive: true, isDefault: false, order: 2 },
  { name: 'Professional', code: 'professional', price: 2499, currency: 'INR', billingCycle: 'monthly', features: { maxProducts: 1000, maxStorage: 5000, maxStaff: 10, themeAccess: [1,2,3,4,5,6,7,8], analytics: true, bulkImport: true, aiTools: true, customDomain: true }, isActive: true, isDefault: false, order: 3 },
  { name: 'Enterprise', code: 'enterprise', price: 4999, currency: 'INR', billingCycle: 'monthly', features: { maxProducts: -1, maxStorage: -1, maxStaff: -1, themeAccess: [1,2,3,4,5,6,7,8,9,10], analytics: true, bulkImport: true, aiTools: true, customDomain: true }, isActive: true, isDefault: false, order: 4 },
];

const seedDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('❌ MONGODB_URI not found in environment variables!');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB');

    // --- Clear existing data ---
    await User.deleteMany({});
    await Store.deleteMany({});
    await Plan.deleteMany({});
    await Theme.deleteMany({});
    await Counter.deleteMany({});

    // --- Create Super Admin (Platform Owner) ---
    const owner = new User({
      name: 'Super Admin',
      email: adminEmail, // ✅ From Env
      password: adminPassword, // ✅ From Env
      role: 'super_admin',
      isEmailVerified: true,
    });
    await owner.save();
    logger.success(`✅ Super Admin created: ${adminEmail} (Password hidden)`);

    // --- Insert Plans & Themes ---
    await Plan.insertMany(plans);
    logger.success(`✅ ${plans.length} plans created`);

    await Theme.insertMany(themes);
    logger.success(`✅ ${themes.length} themes created`);

    // --- Create a demo store ---
    const store = new Store({
      name: 'Demo Store',
      slug: 'demo-store',
      ownerId: owner._id,
      status: 'active',
      selectedTheme: 1,
      currency: 'INR',
    });
    await store.save();
    
    owner.storeId = store._id;
    await owner.save();

    // --- Create Subscription for Demo Store ---
    const freePlan = await Plan.findOne({ code: 'free' });
    const subscription = new Subscription({
      storeId: store._id,
      planId: freePlan._id,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      autoRenew: true,
    });
    await subscription.save();
    
    store.subscriptionId = subscription._id;
    await store.save();

    // --- Create Settings ---
    const settings = new Settings({
      storeId: store._id,
      brand: { name: 'Demo Store' },
      hero: { title: 'Welcome to Drape', description: 'Multi-Tenant SaaS Ecommerce Platform', buttonText: 'Shop Now', buttonLink: '/products' },
    });
    await settings.save();

    // --- Create Counter ---
    await Counter.create({ storeId: store._id, type: 'order', seq: 0 });

    logger.success('✅ Demo store created with settings and subscription');
    logger.success('✅ Seeding completed successfully');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();