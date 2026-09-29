import { renderPage } from './templateService.js';
import { formatCurrency } from '../../utils/helpers.js';

export const generateStoreHTML = async (storeData) => {
  const {
    store,
    products,
    categories,
    settings,
    theme,
    customer,
  } = storeData;

  console.log(`🔍 Generating HTML for store: ${store.slug}`);

  const pages = {};

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
  const storeSlug = store.slug || store._id.toString();
  const storeBasePath = `/stores/${storeSlug}`;
  const ogUrl = `${baseUrl}${storeBasePath}`;

  console.log(`📌 Store Slug: ${storeSlug}`);
  console.log(`📌 Store Base Path: ${storeBasePath}`);

  const baseData = {
    store,
    settings,
    theme,
    categories,
    helpers,
    isDeployed: true,
    year: new Date().getFullYear(),
    baseUrl,
    ogUrl,
    storeBasePath,
    storeSlug,
  };

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 8);
  const newArrivals = products.filter(p => p.isNew).slice(0, 8);
  const activeCategories = categories.filter(c => c.status === 'active');

  console.log(`📄 Generating Homepage...`);
  const homeData = {
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
  };
  pages['index.html'] = await renderPage('home', homeData);

  console.log(`📄 Generating Products page...`);
  const productsData = {
    ...baseData,
    products,
    activeCategories,
    totalProducts: products.length,
  };
  pages['products.html'] = await renderPage('products', productsData);

  // =========================================================
  // ✅ DYNAMIC PRODUCT DETAIL PAGE (Single HTML)
  // =========================================================
  console.log(`📄 Generating Dynamic Product Detail page...`);
  const productDetailData = {
    ...baseData,
    products,            // Full product list for client-side lookup
    activeCategories,
  };
  pages['product.html'] = await renderPage('product-detail', productDetailData);

  // ❌ REMOVED: Old static per-product pages
  // for (const product of products) { ... }

  console.log(`📄 Generating Cart...`);
  pages['cart.html'] = await renderPage('cart-checkout', {
    ...baseData,
    page: 'cart',
    title: 'Your Cart',
  });

  console.log(`📄 Generating Checkout...`);
  pages['checkout.html'] = await renderPage('cart-checkout', {
    ...baseData,
    page: 'checkout',
    title: 'Checkout',
  });

  console.log(`📄 Generating Login...`);
  pages['login.html'] = await renderPage('login', baseData);

  console.log(`📄 Generating Register...`);
  pages['register.html'] = await renderPage('register', baseData);

  console.log(`📄 Generating Order Confirmation...`);
  pages['order-confirmation.html'] = await renderPage('order-confirmation', baseData);

  console.log(`📄 Generating Orders History...`);
  pages['orders.html'] = await renderPage('orders', baseData);

  console.log(`✅ HTML generation complete. Total pages: ${Object.keys(pages).length}`);
  return pages;
};

export default {
  generateStoreHTML,
};