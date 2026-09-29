import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['trial', 'active', 'suspended', 'expired', 'deleted'], default: 'trial' },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  selectedTheme: { type: Number, default: 1 },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  domain: { type: String, default: '' },
  subdomain: { type: String, default: '' },
  cloudinaryFolder: { type: String, default: '' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  currency: { type: String, default: 'INR' },
  language: { type: String, default: 'en' },
  businessType: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  address: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
  },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String,
    linkedin: String,
  },
  seo: {
    title: String,
    description: String,
    keywords: String,
  },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  razorpayKeyId: { type: String, default: null, trim: true },
  razorpayKeySecret: { type: String, default: null },
  usedStorage: { type: Number, default: 0 },

  // ✅ NEW: Deployment Fields
  isDeployed: { type: Boolean, default: false },
  deployedAt: { type: Date },
  deploymentVersion: { type: Number, default: 0 },
  lastDeployAt: { type: Date },
  deployStatus: { 
    type: String, 
    enum: ['pending', 'deploying', 'success', 'failed'], 
    default: 'pending' 
  },
  deployMessage: { type: String, default: '' },

}, { timestamps: true });

storeSchema.index({ slug: 1 }, { unique: true });
storeSchema.index({ ownerId: 1 });
storeSchema.index({ status: 1 });
storeSchema.index({ subdomain: 1 });
storeSchema.index({ isDeployed: 1 });

export default mongoose.model('Store', storeSchema);