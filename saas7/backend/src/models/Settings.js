import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, unique: true },
  brand: {
    name: { type: String, default: 'My Store' },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    tagline: { type: String, default: '' },
  },
  hero: {
    title: { type: String, default: 'Welcome to Our Store' },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    buttonText: { type: String, default: 'Shop Now' },
    buttonLink: { type: String, default: '/products' },
    image: { type: String, default: '' },
    background: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  banners: [{
    image: { type: String, required: true },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    link: { type: String, default: '' },
    buttonText: { type: String, default: 'Shop Now' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
  }],
  homepage: {
    layout: { type: String, default: 'default' },
    aboutText: { type: String, default: '' },
    // ✅ NEW FIELDS – Add these 3 lines
    featuredTitle: { type: String, default: 'Featured Products' },
    featuredSubtitle: { type: String, default: '' },
    featuredCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    // Existing fields
    featuredProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    showCategories: { type: Boolean, default: true },
    showBanners: { type: Boolean, default: true },
    showReviews: { type: Boolean, default: true },
  },
  footer: {
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      pinterest: { type: String, default: '' },
      // ✅ NEW FIELD – Add this line
      whatsapp: { type: String, default: '' },
    },
    copyright: { type: String, default: '' },
    showPaymentIcons: { type: Boolean, default: true },
  },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    metaKeywords: { type: String, default: '' },
    googleAnalytics: { type: String, default: '' },
    facebookPixel: { type: String, default: '' },
    ogImage: { type: String, default: '' },
  },
  styling: {
    primaryColor: { type: String, default: '#f97316' },
    secondaryColor: { type: String, default: '#1a1509' },
    font: { type: String, default: 'Inter' },
    buttonStyle: { type: String, default: 'rounded' },
    cardStyle: { type: String, default: 'shadow' },
  },
  navigation: [{
    label: { type: String, required: true },
    link: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  }],
  shop: {
    currency: { type: String, default: 'INR' },
    taxRate: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 999 },
    deliveryCharge: { type: Number, default: 99 },
    estimatedDeliveryDays: { type: Number, default: 3 },
    codAvailable: { type: Boolean, default: true },
  },
  integrations: {
    razorpay: {
      key: { type: String, default: '' },
      secret: { type: String, default: '' },
    },
    cloudinary: {
      folder: { type: String, default: '' },
    },
    google: {
      analyticsId: { type: String, default: '' },
    },
  },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

settingsSchema.index({ storeId: 1 }, { unique: true });

export default mongoose.model('Settings', settingsSchema);