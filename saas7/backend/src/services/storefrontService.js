import { Category, Product, Settings, Store, Theme } from '../models/index.js';
import { renderPage } from './deployment/templateService.js';
import { formatCurrency } from '../utils/helpers.js';

const storefrontPageAliases = {
  '': 'index.html',
  'index': 'index.html',
  'home': 'index.html',
  'products': 'products.html',
  'product': 'product.html',
  'cart': 'cart.html',
  'checkout': 'checkout.html',
  'login': 'login.html',
  'register': 'register.html',
  'order-confirmation': 'order-confirmation.html',
  'orders': 'orders.html',
};

const storefrontPages = new Set([
  'index.html',
  'products.html',
  'product.html',
  'cart.html',
  'checkout.html',
  'login.html',
  'register.html',
  'order-confirmation.html',
  'orders.html',
]);

// =============================================================
// ✅ IN-MEMORY SSR CACHE (Store Isolated with TTL)
// =============================================================
const ssrCache = new Map();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

export const invalidateStorefrontCache = (storeId) => {
  if (!storeId) {
    ssrCache.clear();
    return;
  }
  const prefix = `store:${storeId.toString()}:`;
  for (const key of ssrCache.keys()) {
    if (key.startsWith(prefix)) {
      ssrCache.delete(key);
    }
  }
};

export const normalizeStorefrontPageName = (pageName = 'index.html') => {
  const raw = String(pageName || 'index.html').trim();
  if (!raw) return 'index.html';

  const normalized = raw.replace(/^\/+|\/+$/g, '');
  if (!normalized) return 'index.html';
  if (normalized.endsWith('.html')) return normalized;

  return storefrontPageAliases[normalized] || `${normalized}.html`;
};

export const isStorefrontPage = (pageName) => {
  const normalized = normalizeStorefrontPageName(pageName);
  return storefrontPages.has(normalized);
};

export const renderStorefrontPage = async (storeSlug, pageName, query = {}) => {
  const normalizedPageName = normalizeStorefrontPageName(pageName);

  const store = await Store.findOne({ slug: storeSlug });
  if (!store || ['suspended', 'expired', 'deleted'].includes(store.status)) {
    return null;
  }

  const storeIdStr = store._id.toString();
  const queryKey = Object.keys(query).sort().map(k => `${k}=${query[k]}`).join('&');
  const cacheKey = `store:${storeIdStr}:page:${normalizedPageName}:${queryKey}`;

  // Check cache
  const cached = ssrCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.html;
  }

  const helpers = {
    formatCurrency: (amount) => formatCurrency(amount, store.currency || 'INR'),
    getImageUrl: (url) => url || 'https://via.placeholder.com/300',
    truncateText: (text, length = 100) => {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    getCategorySlug: (category) => category?.slug || '',
    getProductSlug: (product) => product?.slug || '',
    getProductImage: (product) => product?.images?.[0] || 'https://via.placeholder.com/300',
    getVariantPrice: (variants) => {
      if (!variants || variants.length === 0) return 0;
      return variants[0]?.price || 0;
    },
    getVariantStock: (variants) => {
      if (!variants || variants.length === 0) return 0;
      return variants[0]?.stock || 0;
    },
  };

  const baseUrl = process.env.BASE_URL || 'http://localhost:5002';
  const resolvedStoreSlug = store.slug || storeIdStr;
  const storeBasePath = `/stores/${resolvedStoreSlug}`;
  const ogUrl = `${baseUrl}${storeBasePath}`;

  // Common metadata needed for layout & navigation
  const [settings, theme, categories] = await Promise.all([
    Settings.findOne({ storeId: store._id }),
    store.selectedTheme ? Theme.findOne({ id: store.selectedTheme }) : null,
    Category.find({ storeId: store._id, status: 'active' }).sort({ order: 1 }),
  ]);

  const baseData = {
    store,
    settings: settings || {},
    theme: theme || null,
    categories: categories || [],
    helpers,
    isDeployed: true,
    year: new Date().getFullYear(),
    baseUrl,
    ogUrl,
    storeBasePath,
    storeSlug: resolvedStoreSlug,
  };

  let html = null;

  // Single-page execution path
  if (normalizedPageName === 'index.html') {
    const products = await Product.find({ storeId: store._id, status: 'published' }).sort({ createdAt: -1 });
    const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8);
    const bestSellers = products.filter(p => p.isBestSeller).slice(0, 8);
    const newArrivals = products.filter(p => p.isNew).slice(0, 8);
    const activeCategories = (categories || []).filter(c => c.status === 'active');

    html = await renderPage('home', {
      ...baseData,
      products,
      featuredProducts,
      bestSellers,
      newArrivals,
      activeCategories,
      hero: settings?.hero || {},
      brand: settings?.brand || {},
      homepage: settings?.homepage || {},
      footer: settings?.footer || {},
    });
  } else if (normalizedPageName === 'products.html') {
    const filter = { storeId: store._id, status: 'published' };
    if (query.category) {
      const cat = categories.find(c => c.slug === query.category);
      if (cat) filter.categoryId = cat._id;
    }

    let sortOption = { createdAt: -1 };
    if (query.sort === 'price-low') sortOption = { 'variants.0.price': 1 };
    else if (query.sort === 'price-high') sortOption = { 'variants.0.price': -1 };

    const products = await Product.find(filter).sort(sortOption);
    const activeCategories = (categories || []).filter(c => c.status === 'active');

    html = await renderPage('products', {
      ...baseData,
      products,
      activeCategories,
      totalProducts: products.length,
    });
  } else if (normalizedPageName === 'product.html') {
    const activeCategories = (categories || []).filter(c => c.status === 'active');
    let targetProduct = null;

    if (query.slug) {
      targetProduct = await Product.findOne({
        storeId: store._id,
        $or: [{ slug: query.slug }, { _id: query.slug.match(/^[0-9a-fA-F]{24}$/) ? query.slug : null }],
        status: 'published'
      });
    }

    if (!targetProduct) {
      targetProduct = await Product.findOne({ storeId: store._id, status: 'published' }).sort({ createdAt: -1 });
    }

    let relatedProducts = [];
    if (targetProduct) {
      relatedProducts = await Product.find({
        storeId: store._id,
        _id: { $ne: targetProduct._id },
        status: 'published'
      }).limit(4);
    }

    html = await renderPage('product-detail', {
      ...baseData,
      product: targetProduct,
      relatedProducts,
      activeCategories,
    });
  } else if (normalizedPageName === 'cart.html') {
    html = await renderPage('cart-checkout', {
      ...baseData,
      page: 'cart',
      title: 'Your Cart',
    });
  } else if (normalizedPageName === 'checkout.html') {
    html = await renderPage('cart-checkout', {
      ...baseData,
      page: 'checkout',
      title: 'Checkout',
    });
  } else if (normalizedPageName === 'login.html') {
    html = await renderPage('login', baseData);
  } else if (normalizedPageName === 'register.html') {
    html = await renderPage('register', baseData);
  } else if (normalizedPageName === 'order-confirmation.html') {
    html = await renderPage('order-confirmation', baseData);
  } else if (normalizedPageName === 'orders.html') {
    html = await renderPage('orders', baseData);
  }

  if (html) {
    ssrCache.set(cacheKey, { html, timestamp: Date.now() });
  }

  return html;
};