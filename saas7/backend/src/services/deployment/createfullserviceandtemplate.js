// ================================================================
// FILE: backend/src/services/deployment/createfullserviceandtemplate.js
// PURPOSE: Auto-generate all HTML Storefront Generator files
// VERSION: FINAL – NO VERSIONING, DIRECT OVERWRITE
// ================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.resolve(__dirname, '../../../'); // backend/
const SERVICES_DIR = path.join(BASE_DIR, 'src', 'services', 'deployment');
const TEMPLATES_DIR = path.join(SERVICES_DIR, 'templates');
const PUBLIC_DIR = path.join(BASE_DIR, 'public');
const STORES_ASSETS_DIR = path.join(PUBLIC_DIR, 'stores', 'assets');
const CONTROLLERS_DIR = path.join(BASE_DIR, 'src', 'controllers');
const ROUTES_DIR = path.join(BASE_DIR, 'src', 'routes');
const MIDDLEWARE_DIR = path.join(BASE_DIR, 'src', 'middleware');

// Helper: Write file with directory creation
function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Created file: ${filePath}`);
}

// ================================================================
// 1. SERVICE FILES (WITHOUT VERSIONING)
// ================================================================

const serviceFiles = {
  'fileSystemService.js': `
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../../../public');
const STORES_DIR = path.join(PUBLIC_DIR, 'stores');
const ASSETS_DIR = path.join(STORES_DIR, 'assets');

export const ensureDirectories = async () => {
  try {
    console.log('📁 Ensuring directories exist...');
    await fs.mkdir(PUBLIC_DIR, { recursive: true });
    await fs.mkdir(STORES_DIR, { recursive: true });
    await fs.mkdir(ASSETS_DIR, { recursive: true });
    console.log('✅ Directories ready');
    return true;
  } catch (err) {
    console.error('❌ ensureDirectories error:', err.message);
    console.error('❌ Stack:', err.stack);
    throw err;
  }
};

export const getStoreDir = (slug) => {
  return path.join(STORES_DIR, slug);
};

export const writeFile = async (filePath, content) => {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch (err) {
    console.error(\`❌ writeFile error for \${filePath}:\`, err.message);
    console.error('❌ Stack:', err.stack);
    throw err;
  }
};

export const readFile = async (filePath) => {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    console.error(\`❌ readFile error for \${filePath}:\`, err.message);
    return null;
  }
};

export const deleteFolder = async (folderPath) => {
  try {
    console.log(\`🗑️ Deleting folder: \${folderPath}\`);
    await fs.rm(folderPath, { recursive: true, force: true });
    return true;
  } catch (err) {
    console.error(\`❌ deleteFolder error for \${folderPath}:\`, err.message);
    return false;
  }
};

export const copyAssets = async (slug) => {
  try {
    const storeDir = getStoreDir(slug);
    const assetsTarget = path.join(storeDir, 'assets');
    await fs.mkdir(assetsTarget, { recursive: true });
    
    const cssSource = path.join(ASSETS_DIR, 'global.css');
    const cssTarget = path.join(assetsTarget, 'global.css');
    const cssExists = await fs.access(cssSource).then(() => true).catch(() => false);
    if (cssExists) {
      await fs.copyFile(cssSource, cssTarget);
      console.log(\`✅ Copied global.css to \${cssTarget}\`);
    }
    
    const jsSource = path.join(ASSETS_DIR, 'app.js');
    const jsTarget = path.join(assetsTarget, 'app.js');
    const jsExists = await fs.access(jsSource).then(() => true).catch(() => false);
    if (jsExists) {
      await fs.copyFile(jsSource, jsTarget);
      console.log(\`✅ Copied app.js to \${jsTarget}\`);
    }
    
    return true;
  } catch (err) {
    console.error('❌ copyAssets error:', err.message);
    console.error('❌ Stack:', err.stack);
    return false;
  }
};

export default {
  ensureDirectories,
  getStoreDir,
  writeFile,
  readFile,
  deleteFolder,
  copyAssets,
};
`,

  'templateService.js': `
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, 'templates');

export const compileTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(TEMPLATES_DIR, \`\${templateName}.ejs\`);
    const html = await ejs.renderFile(templatePath, data, { async: true });
    return html;
  } catch (err) {
    console.error(\`❌ compileTemplate error for \${templateName}:\`, err.message);
    console.error('❌ Stack:', err.stack);
    throw err;
  }
};

export const renderPage = async (pageTemplate, data) => {
  try {
    const content = await compileTemplate(pageTemplate, data);
    const layoutData = {
      ...data,
      content,
      page: pageTemplate,
    };
    return await compileTemplate('layout', layoutData);
  } catch (err) {
    console.error(\`❌ renderPage error for \${pageTemplate}:\`, err.message);
    console.error('❌ Stack:', err.stack);
    throw err;
  }
};

export const getTemplateNames = () => {
  return [
    'layout', 'home', 'products', 'product-detail',
    'cart-checkout', 'login', 'register',
    'order-confirmation', 'orders'
  ];
};

export default {
  compileTemplate,
  renderPage,
  getTemplateNames,
};
`,

  'htmlGenerator.js': `
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

  console.log(\`🔍 Generating HTML for store: \${store.slug}\`);

  const pages = {};

  const helpers = {
    formatCurrency: (amount) => formatCurrency(amount, store.currency || 'INR'),
    getImageUrl: (url) => url || '/placeholder.jpg',
    truncateText: (text, length = 100) => {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },
    getCategorySlug: (category) => category?.slug || '',
    getProductSlug: (product) => product?.slug || '',
    getProductImage: (product) => product?.images?.[0] || '/placeholder.jpg',
    getVariantPrice: (variants) => {
      if (!variants || variants.length === 0) return 0;
      return variants[0]?.price || 0;
    },
    getVariantStock: (variants) => {
      if (!variants || variants.length === 0) return 0;
      return variants[0]?.stock || 0;
    },
  };

  const baseData = {
    store,
    settings,
    theme,
    categories,
    helpers,
    isDeployed: true,
    year: new Date().getFullYear(),
    baseUrl: process.env.BASE_URL || 'http://localhost:5002',
  };

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 8);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 8);
  const newArrivals = products.filter(p => p.isNew).slice(0, 8);
  const activeCategories = categories.filter(c => c.status === 'active');

  console.log(\`📄 Generating Homepage...\`);
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

  console.log(\`📄 Generating Products page...\`);
  const productsData = {
    ...baseData,
    products,
    activeCategories,
    totalProducts: products.length,
  };
  pages['products.html'] = await renderPage('products', productsData);

  console.log(\`📄 Generating Product Detail pages...\`);
  for (const product of products) {
    const relatedProducts = products
      .filter(p => p._id !== product._id)
      .slice(0, 4);

    const productDetailData = {
      ...baseData,
      product,
      relatedProducts,
      activeCategories,
    };
    const slug = product.slug || product._id;
    pages[\`product-\${slug}.html\`] = await renderPage('product-detail', productDetailData);
  }

  console.log(\`📄 Generating Cart...\`);
  pages['cart.html'] = await renderPage('cart-checkout', {
    ...baseData,
    page: 'cart',
    title: 'Your Cart',
  });

  console.log(\`📄 Generating Checkout...\`);
  pages['checkout.html'] = await renderPage('cart-checkout', {
    ...baseData,
    page: 'checkout',
    title: 'Checkout',
  });

  console.log(\`📄 Generating Login...\`);
  pages['login.html'] = await renderPage('login', baseData);

  console.log(\`📄 Generating Register...\`);
  pages['register.html'] = await renderPage('register', baseData);

  console.log(\`📄 Generating Order Confirmation...\`);
  pages['order-confirmation.html'] = await renderPage('order-confirmation', baseData);

  console.log(\`📄 Generating Orders History...\`);
  pages['orders.html'] = await renderPage('orders', baseData);

  console.log(\`✅ HTML generation complete. Total pages: \${Object.keys(pages).length}\`);
  return pages;
};

export default {
  generateStoreHTML,
};
`,

  'deploymentService.js': `
import mongoose from 'mongoose';
import Store from '../../models/Store.js';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import Settings from '../../models/Settings.js';
import Theme from '../../models/Theme.js';
import { generateStoreHTML } from './htmlGenerator.js';
import fileSystemService from './fileSystemService.js';
import { logger } from '../../utils/logger.js';

export const deployStore = async (storeId) => {
  console.log(\`🚀 Starting deployment for store ID: \${storeId}\`);

  try {
    console.log('📝 Updating status to "deploying"...');
    await Store.findByIdAndUpdate(storeId, {
      deployStatus: 'deploying',
      deployMessage: 'Starting deployment...',
    });

    console.log('📦 Fetching store data...');
    const store = await Store.findById(storeId);
    if (!store) {
      console.error(\`❌ Store not found for ID: \${storeId}\`);
      throw new Error('Store not found');
    }
    console.log(\`✅ Store found: \${store.name} (\${store.slug})\`);

    console.log('📦 Fetching products...');
    const products = await Product.find({ storeId }).sort({ createdAt: -1 });
    console.log(\`✅ \${products.length} products found\`);

    console.log('📦 Fetching categories...');
    const categories = await Category.find({ storeId }).sort({ order: 1 });
    console.log(\`✅ \${categories.length} categories found\`);

    console.log('📦 Fetching settings...');
    const settings = await Settings.findOne({ storeId });
    
    console.log('📦 Fetching theme...');
    let theme = null;
    if (store.selectedTheme) {
      theme = await Theme.findOne({ id: store.selectedTheme });
    }

    console.log('📁 Ensuring directories exist...');
    await fileSystemService.ensureDirectories();

    const storeData = {
      store,
      products,
      categories,
      settings: settings || {},
      theme: theme || null,
      customer: null,
    };

    console.log('⚙️ Generating HTML pages...');
    const pages = await generateStoreHTML(storeData);

    const storeSlug = store.slug;
    const storeDir = fileSystemService.getStoreDir(storeSlug);

    // ✅ DELETE THE ENTIRE STORE FOLDER – CLEAN OVERWRITE
    console.log(\`🗑️ Deleting existing store folder: \${storeDir}\`);
    await fileSystemService.deleteFolder(storeDir);

    // ✅ RECREATE THE FOLDER (ensureDirectories will recreate it)
    console.log(\`📁 Recreating store folder: \${storeDir}\`);
    await fileSystemService.ensureDirectories();

    // ✅ WRITE ALL PAGES DIRECTLY TO ROOT
    console.log(\`📝 Writing pages directly to root: \${storeDir}\`);
    for (const [filename, content] of Object.entries(pages)) {
      const filePath = \`\${storeDir}/\${filename}\`;
      await fileSystemService.writeFile(filePath, content);
    }
    console.log(\`✅ \${Object.keys(pages).length} pages written to root\`);

    // ✅ COPY ASSETS
    console.log('📁 Copying assets...');
    await fileSystemService.copyAssets(storeSlug);

    // ✅ UPDATE STORE RECORD
    console.log('📝 Updating store record...');
    await Store.findByIdAndUpdate(storeId, {
      isDeployed: true,
      deployedAt: new Date(),
      lastDeployAt: new Date(),
      deployStatus: 'success',
      deployMessage: \`Deployed successfully\`,
    });

    const storeUrl = \`/stores/\${storeSlug}\`;
    console.log(\`✅ Store deployed successfully: \${storeUrl}\`);
    logger.success(\`✅ Store deployed successfully: \${storeUrl}\`);

    return {
      success: true,
      storeId: store._id,
      storeSlug,
      url: storeUrl,
      pagesGenerated: Object.keys(pages).length,
      deployedAt: new Date(),
    };

  } catch (err) {
    console.error(\`❌ Deployment failed for store \${storeId}:\`, err.message);
    console.error('❌ Stack:', err.stack);
    logger.error(\`❌ Deployment failed for store \${storeId}:\`, err);
    
    try {
      await Store.findByIdAndUpdate(storeId, {
        deployStatus: 'failed',
        deployMessage: err.message || 'Deployment failed',
      });
    } catch (updateErr) {
      console.error('❌ Failed to update store status:', updateErr.message);
    }
    throw err;
  }
};

export const getDeployStatus = async (storeId) => {
  try {
    console.log(\`🔍 Fetching deployment status for store: \${storeId}\`);
    const store = await Store.findById(storeId);
    if (!store) {
      console.error(\`❌ Store not found for status check: \${storeId}\`);
      throw new Error('Store not found');
    }
    console.log(\`✅ Status fetched for store: \${store.slug}\`);
    return {
      isDeployed: store.isDeployed,
      deployedAt: store.deployedAt,
      lastDeployAt: store.lastDeployAt,
      deployStatus: store.deployStatus,
      deployMessage: store.deployMessage,
      url: store.isDeployed ? \`/stores/\${store.slug}\` : null,
    };
  } catch (err) {
    console.error('❌ getDeployStatus error:', err.message);
    console.error('❌ Stack:', err.stack);
    throw err;
  }
};

export default {
  deployStore,
  getDeployStatus,
};
`,
};

// ================================================================
// 2. TEMPLATE FILES (EJS) – FULL SET (All 9 pages)
// ================================================================

const templateFiles = {
  'layout.ejs': `<!DOCTYPE html>
<html lang="<%= store.language || 'en' %>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= store.name %> - <%= settings?.seo?.title || 'Online Store' %></title>
  <meta name="description" content="<%= settings?.seo?.description || store.name %>">
  <link rel="icon" href="<%= store.favicon || '' %>">
  <meta property="og:title" content="<%= store.name %>">
  <meta property="og:description" content="<%= settings?.seo?.description || store.name %>">
  <meta property="og:image" content="<%= store.logo || settings?.brand?.logo || '' %>">
  <meta property="og:url" content="<%= \`\${baseUrl}/stores/\${store.slug}\` %>">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="/stores/<%= store.slug %>/assets/global.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root { --primary-color: <%= settings?.styling?.primaryColor || '#f97316' %>; --secondary-color: <%= settings?.styling?.secondaryColor || '#1a1509' %>; }
  </style>
</head>
<body>
  <header class="store-header">
    <div class="container">
      <div class="header-inner">
        <div class="logo">
          <a href="/stores/<%= store.slug %>">
            <% if (store.logo || settings?.brand?.logo) { %><img src="<%= store.logo || settings?.brand?.logo %>" alt="<%= store.name %>"><% } else { %><span class="logo-text"><%= store.name %></span><% } %>
          </a>
        </div>
        <nav class="header-nav">
          <a href="/stores/<%= store.slug %>">Home</a>
          <a href="/stores/<%= store.slug %>/products.html">Products</a>
          <a href="/stores/<%= store.slug %>/cart.html">Cart</a>
          <a href="/stores/<%= store.slug %>/orders.html">Orders</a>
        </nav>
        <div class="header-actions">
          <a href="/stores/<%= store.slug %>/cart.html" class="cart-icon">🛒 <span id="cart-count">0</span></a>
          <div id="auth-buttons">
            <a href="/stores/<%= store.slug %>/login.html">Login</a>
            <a href="/stores/<%= store.slug %>/register.html">Register</a>
          </div>
        </div>
      </div>
    </div>
  </header>
  <main><%- content %></main>
  <footer class="store-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand"><h3><%= settings?.brand?.name || store.name %></h3><p><%= settings?.brand?.tagline || 'Premium online store' %></p></div>
        <div class="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/stores/<%= store.slug %>">Home</a></li>
            <li><a href="/stores/<%= store.slug %>/products.html">Products</a></li>
            <li><a href="/stores/<%= store.slug %>/cart.html">Cart</a></li>
            <li><a href="/stores/<%= store.slug %>/orders.html">Orders</a></li>
          </ul>
        </div>
        <div class="footer-contact">
          <h4>Contact</h4>
          <% if (settings?.footer?.address) { %><p>📍 <%= settings.footer.address %></p><% } %>
          <% if (settings?.footer?.phone) { %><p>📞 <a href="tel:<%= settings.footer.phone %>"><%= settings.footer.phone %></a></p><% } %>
          <% if (settings?.footer?.email) { %><p>✉️ <a href="mailto:<%= settings.footer.email %>"><%= settings.footer.email %></a></p><% } %>
        </div>
        <div class="footer-social">
          <h4>Follow Us</h4>
          <div class="social-links">
            <% if (settings?.footer?.socialLinks?.facebook) { %><a href="<%= settings.footer.socialLinks.facebook %>" target="_blank">📘</a><% } %>
            <% if (settings?.footer?.socialLinks?.instagram) { %><a href="<%= settings.footer.socialLinks.instagram %>" target="_blank">📷</a><% } %>
            <% if (settings?.footer?.socialLinks?.twitter) { %><a href="<%= settings.footer.socialLinks.twitter %>" target="_blank">🐦</a><% } %>
            <% if (settings?.footer?.socialLinks?.youtube) { %><a href="<%= settings.footer.socialLinks.youtube %>" target="_blank">▶️</a><% } %>
          </div>
        </div>
      </div>
      <div class="footer-bottom"><p><%= settings?.footer?.copyright || \`© \${new Date().getFullYear()} \${settings?.brand?.name || store.name}. All rights reserved.\` %></p></div>
    </div>
  </footer>
  <script src="/stores/<%= store.slug %>/assets/app.js"></script>
  <script>
    window.__STORE_CONFIG__ = {
      storeSlug: '<%= store.slug %>',
      storeId: '<%= store._id %>',
      apiBase: '/api',
      currency: '<%= store.currency || "INR" %>',
    };
  </script>
</body>
</html>`,

  'home.ejs': `<section class="hero-section">
  <div class="hero-container">
    <% if (hero.image) { %>
      <div class="hero-image" style="background-image: url('<%= hero.image %>')">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1><%= hero.title || 'Welcome to ' + store.name %></h1>
          <p><%= hero.description || 'Discover our premium collection.' %></p>
          <a href="<%= hero.buttonLink || '/stores/' + store.slug + '/products.html' %>" class="hero-btn"><%= hero.buttonText || 'Shop Now' %></a>
        </div>
      </div>
    <% } else { %>
      <div class="hero-content-center">
        <h1><%= hero.title || 'Welcome to ' + store.name %></h1>
        <p><%= hero.description || 'Discover our premium collection.' %></p>
        <a href="/stores/<%= store.slug %>/products.html" class="hero-btn">Shop Now</a>
      </div>
    <% } %>
  </div>
</section>
<% if (activeCategories && activeCategories.length > 0) { %>
<section class="categories-section">
  <div class="container"><h2>Shop by Category</h2>
  <div class="category-grid">
    <% activeCategories.slice(0, 4).forEach(category => { %>
      <a href="/stores/<%= store.slug %>/products.html?category=<%= category.slug %>" class="category-card">
        <div class="category-image"><img src="<%= category.image || '/placeholder.jpg' %>" alt="<%= category.name %>" loading="lazy"></div>
        <h3><%= category.name %></h3>
      </a>
    <% }) %>
  </div>
  </div>
</section>
<% } %>
<% if (bestSellers && bestSellers.length > 0) { %>
<section class="products-section">
  <div class="container">
    <div class="section-header"><h2>Best Sellers</h2><a href="/stores/<%= store.slug %>/products.html" class="view-all">View All →</a></div>
    <div class="product-grid">
      <% bestSellers.slice(0, 8).forEach(product => { %>
        <div class="product-card">
          <a href="/stores/<%= store.slug %>/product-<%= product.slug || product._id %>.html">
            <div class="product-image"><img src="<%= product.images && product.images[0] ? product.images[0] : '/placeholder.jpg' %>" alt="<%= product.title %>" loading="lazy"><% if (product.isBestSeller) { %><span class="badge bestseller">Bestseller</span><% } %></div>
            <h3 class="product-title"><%= product.title %></h3>
            <p class="product-price">₹<%= helpers.formatCurrency(helpers.getVariantPrice(product.variants)) %></p>
          </a>
        </div>
      <% }) %>
    </div>
  </div>
</section>
<% } %>
<% if (newArrivals && newArrivals.length > 0) { %>
<section class="products-section">
  <div class="container">
    <div class="section-header"><h2>New Arrivals</h2><a href="/stores/<%= store.slug %>/products.html" class="view-all">View All →</a></div>
    <div class="product-grid">
      <% newArrivals.slice(0, 8).forEach(product => { %>
        <div class="product-card">
          <a href="/stores/<%= store.slug %>/product-<%= product.slug || product._id %>.html">
            <div class="product-image"><img src="<%= product.images && product.images[0] ? product.images[0] : '/placeholder.jpg' %>" alt="<%= product.title %>" loading="lazy"><% if (product.isNew) { %><span class="badge new">New</span><% } %></div>
            <h3 class="product-title"><%= product.title %></h3>
            <p class="product-price">₹<%= helpers.formatCurrency(helpers.getVariantPrice(product.variants)) %></p>
          </a>
        </div>
      <% }) %>
    </div>
  </div>
</section>
<% } %>
<% if (homepage?.aboutText) { %>
<section class="about-section"><div class="container"><div class="about-content"><p><%= homepage.aboutText %></p></div></div></section>
<% } %>`,

  'products.ejs': `<section class="products-page">
  <div class="container">
    <div class="page-header"><h1>Our Products</h1><p><%= totalProducts %> products available</p></div>
    <div class="products-layout">
      <aside class="filters-sidebar">
        <h3>Categories</h3>
        <ul class="category-filters">
          <li><a href="/stores/<%= store.slug %>/products.html" class="filter-link active">All Products</a></li>
          <% activeCategories.forEach(category => { %><li><a href="/stores/<%= store.slug %>/products.html?category=<%= category.slug %>" class="filter-link"><%= category.name %></a></li><% }) %>
        </ul>
        <h3>Sort By</h3>
        <select id="sort-select" class="sort-select">
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
        </select>
      </aside>
      <div class="product-grid-container">
        <div class="product-grid">
          <% if (products && products.length > 0) { %>
            <% products.forEach(product => { %>
              <div class="product-card">
                <a href="/stores/<%= store.slug %>/product-<%= product.slug || product._id %>.html">
                  <div class="product-image"><img src="<%= product.images && product.images[0] ? product.images[0] : '/placeholder.jpg' %>" alt="<%= product.title %>" loading="lazy"><% if (product.isBestSeller) { %><span class="badge bestseller">Bestseller</span><% } %><% if (product.isNew) { %><span class="badge new">New</span><% } %></div>
                  <h3 class="product-title"><%= product.title %></h3>
                  <p class="product-price">₹<%= helpers.formatCurrency(helpers.getVariantPrice(product.variants)) %></p>
                  <% if (helpers.getVariantStock(product.variants) <= 0) { %><span class="out-of-stock">Out of Stock</span><% } %>
                </a>
              </div>
            <% }) %>
          <% } else { %><p class="no-products">No products found.</p><% } %>
        </div>
      </div>
    </div>
  </div>
</section>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const sort = urlParams.get('sort');
    if (category) {
      document.querySelectorAll('.filter-link').forEach(link => {
        link.classList.remove('active');
        if (link.href.includes(\`category=\${category}\`)) link.classList.add('active');
      });
    }
    if (sort) { document.getElementById('sort-select').value = sort; }
    document.getElementById('sort-select').addEventListener('change', function() {
      const url = new URL(window.location.href);
      url.searchParams.set('sort', this.value);
      window.location.href = url.toString();
    });
  });
</script>`,

  'product-detail.ejs': `<section class="product-detail-page">
  <div class="container">
    <div class="breadcrumb"><a href="/stores/<%= store.slug %>">Home</a> / <a href="/stores/<%= store.slug %>/products.html">Products</a> / <span><%= product.title %></span></div>
    <div class="product-detail-layout">
      <div class="product-images">
        <div class="main-image"><img src="<%= product.images && product.images[0] ? product.images[0] : '/placeholder.jpg' %>" alt="<%= product.title %>" id="main-product-image"></div>
        <div class="thumbnail-grid">
          <% if (product.images && product.images.length > 0) { %>
            <% product.images.forEach((image, index) => { %><div class="thumbnail <%= index === 0 ? 'active' : '' %>" onclick="changeImage('<%= image %>', this)"><img src="<%= image %>" alt="Thumbnail <%= index + 1 %>"></div><% }) %>
          <% } %>
        </div>
      </div>
      <div class="product-info">
        <h1 class="product-title"><%= product.title %></h1>
        <div class="product-price-container">
          <span class="product-price">₹<%= helpers.formatCurrency(helpers.getVariantPrice(product.variants)) %></span>
          <% if (product.variants && product.variants[0]?.compareAtPrice) { %><span class="compare-price">₹<%= helpers.formatCurrency(product.variants[0].compareAtPrice) %></span><% const discount = Math.round(((product.variants[0].compareAtPrice - helpers.getVariantPrice(product.variants)) / product.variants[0].compareAtPrice) * 100); %><span class="discount-tag">Save <%= discount %>%</span><% } %>
        </div>
        <div class="stock-status"><% if (helpers.getVariantStock(product.variants) > 0) { %><span class="in-stock">✅ In Stock</span><% } else { %><span class="out-of-stock">❌ Out of Stock</span><% } %></div>
        <div class="product-description"><p><%= product.description || 'No description available.' %></p></div>
        <% if (product.variants && product.variants.length > 0) { %>
          <div class="variant-options">
            <% if (product.variants.some(v => v.size)) { %><div class="variant-group"><label>Size:</label><select id="variant-size"><option value="">Select Size</option><% product.variants.forEach((variant, idx) => { %><option value="<%= idx %>"><%= variant.size %></option><% }) %></select></div><% } %>
            <% if (product.variants.some(v => v.color)) { %><div class="variant-group"><label>Color:</label><select id="variant-color"><option value="">Select Color</option><% product.variants.forEach((variant, idx) => { %><option value="<%= idx %>"><%= variant.color %></option><% }) %></select></div><% } %>
          </div>
        <% } %>
        <div class="add-to-cart-section">
          <div class="quantity-selector"><button onclick="decrementQty()">−</button><input type="number" id="quantity" value="1" min="1" max="<%= helpers.getVariantStock(product.variants) || 10 %>"><button onclick="incrementQty()">+</button></div>
          <button class="add-to-cart-btn" onclick="addToCart('<%= product._id %>')" <%= helpers.getVariantStock(product.variants) <= 0 ? 'disabled' : '' %>>🛒 Add to Cart</button>
        </div>
        <div class="product-meta"><p><strong>SKU:</strong> <%= product.variants && product.variants[0]?.sku || 'N/A' %></p><p><strong>Category:</strong> <% const category = activeCategories.find(c => c._id.toString() === product.categoryId?.toString()); %><%= category ? category.name : 'Uncategorized' %></p></div>
      </div>
    </div>
    <% if (relatedProducts && relatedProducts.length > 0) { %>
      <section class="related-products"><h2>You May Also Like</h2><div class="product-grid"><% relatedProducts.slice(0, 4).forEach(product => { %><div class="product-card"><a href="/stores/<%= store.slug %>/product-<%= product.slug || product._id %>.html"><div class="product-image"><img src="<%= product.images && product.images[0] ? product.images[0] : '/placeholder.jpg' %>" alt="<%= product.title %>" loading="lazy"></div><h3 class="product-title"><%= product.title %></h3><p class="product-price">₹<%= helpers.formatCurrency(helpers.getVariantPrice(product.variants)) %></p></a></div><% }) %></div></section>
    <% } %>
  </div>
</section>
<script>
  function changeImage(src, element) { document.getElementById('main-product-image').src = src; document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active')); element.classList.add('active'); }
  function incrementQty() { const input = document.getElementById('quantity'); const max = parseInt(input.max) || 99; if (parseInt(input.value) < max) input.value = parseInt(input.value) + 1; }
  function decrementQty() { const input = document.getElementById('quantity'); if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1; }
  async function addToCart(productId) {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    try {
      const res = await fetch('/api/public/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity, storeSlug: '<%= store.slug %>' }) });
      if (res.ok) { alert('✅ Product added to cart!'); updateCartCount(); } else { const err = await res.json(); alert('❌ Failed: ' + (err.message || 'Please try again')); }
    } catch (e) { alert('❌ Error adding to cart.'); }
  }
  async function updateCartCount() { try { const res = await fetch('/api/public/cart/count?storeSlug=<%= store.slug %>'); if (res.ok) { const data = await res.json(); document.getElementById('cart-count').textContent = data.count || 0; } } catch (e) {} }
  document.addEventListener('DOMContentLoaded', updateCartCount);
</script>`,

  'cart-checkout.ejs': `<section class="cart-checkout-page">
  <div class="container">
    <div class="page-header"><h1><%= title %></h1></div>
    <% if (page === 'cart') { %>
      <div class="cart-container" id="cart-container">
        <div class="cart-items" id="cart-items"><p class="empty-cart">Your cart is empty.</p></div>
        <div class="cart-summary" id="cart-summary" style="display:none;">
          <h3>Order Summary</h3><div class="summary-row"><span>Subtotal</span><span id="subtotal">₹0</span></div>
          <div class="summary-row"><span>Shipping</span><span id="shipping">₹0</span></div>
          <div class="summary-row total"><span>Total</span><span id="total">₹0</span></div>
          <a href="/stores/<%= store.slug %>/checkout.html" class="checkout-btn">Proceed to Checkout</a>
        </div>
      </div>
    <% } else { %>
      <div class="checkout-container">
        <form id="checkout-form" onsubmit="placeOrder(event)">
          <div class="checkout-layout">
            <div class="checkout-form">
              <h3>Shipping Address</h3>
              <div class="form-row"><div class="form-group"><label>First Name *</label><input type="text" id="firstName" required></div><div class="form-group"><label>Last Name *</label><input type="text" id="lastName" required></div></div>
              <div class="form-group"><label>Email *</label><input type="email" id="email" required></div>
              <div class="form-group"><label>Phone *</label><input type="tel" id="phone" required></div>
              <div class="form-group"><label>Address Line 1 *</label><input type="text" id="line1" required></div>
              <div class="form-group"><label>Address Line 2</label><input type="text" id="line2"></div>
              <div class="form-row"><div class="form-group"><label>City *</label><input type="text" id="city" required></div><div class="form-group"><label>State *</label><input type="text" id="state" required></div></div>
              <div class="form-row"><div class="form-group"><label>Pincode *</label><input type="text" id="pincode" required></div><div class="form-group"><label>Country</label><input type="text" id="country" value="India"></div></div>
              <h3>Payment Method</h3>
              <div class="payment-methods"><label><input type="radio" name="paymentMethod" value="COD" checked> Cash on Delivery</label><label><input type="radio" name="paymentMethod" value="Razorpay"> Card / UPI</label></div>
            </div>
            <div class="checkout-summary">
              <h3>Order Summary</h3><div id="order-items"></div>
              <div class="summary-divider"></div>
              <div class="summary-row"><span>Subtotal</span><span id="checkout-subtotal">₹0</span></div>
              <div class="summary-row"><span>Shipping</span><span id="checkout-shipping">₹0</span></div>
              <div class="summary-row total"><span>Total</span><span id="checkout-total">₹0</span></div>
              <button type="submit" class="place-order-btn">Place Order</button>
            </div>
          </div>
        </form>
      </div>
    <% } %>
  </div>
</section>
<script>
  async function loadCart() {
    try {
      const res = await fetch('/api/public/cart?storeSlug=<%= store.slug %>');
      if (!res.ok) return;
      const data = await res.json();
      const items = data.items || [];
      const container = document.getElementById('cart-items');
      const summary = document.getElementById('cart-summary');
      if (items.length === 0) { container.innerHTML = '<p class="empty-cart">Your cart is empty.</p>'; summary.style.display = 'none'; return; }
      summary.style.display = 'block';
      let html = ''; let subtotal = 0;
      items.forEach(item => {
        const total = item.price * item.quantity; subtotal += total;
        html += \`
          <div class="cart-item">
            <img src="\${item.image || '/placeholder.jpg'}" alt="\${item.name}">
            <div class="cart-item-info"><h4>\${item.name}</h4><p>₹\${item.price} × \${item.quantity}</p></div>
            <div class="cart-item-actions">
              <button onclick="updateCart('\${item.productId}', \${item.quantity - 1})">−</button>
              <span>\${item.quantity}</span>
              <button onclick="updateCart('\${item.productId}', \${item.quantity + 1})">+</button>
              <button onclick="removeFromCart('\${item.productId}')" class="remove-btn">✕</button>
            </div>
            <div class="cart-item-total">₹\${total}</div>
          </div>
        \`;
      });
      container.innerHTML = html;
      const shipping = subtotal > 0 ? 99 : 0; const total = subtotal + shipping;
      document.getElementById('subtotal').textContent = '₹' + subtotal;
      document.getElementById('shipping').textContent = '₹' + shipping;
      document.getElementById('total').textContent = '₹' + total;
      document.getElementById('cart-count').textContent = items.length;
    } catch (e) { console.error('Failed to load cart', e); }
  }
  async function updateCart(productId, quantity) {
    if (quantity <= 0) { await removeFromCart(productId); return; }
    try {
      await fetch('/api/public/cart', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity, storeSlug: '<%= store.slug %>' }) });
      loadCart();
    } catch (e) { alert('Failed to update cart'); }
  }
  async function removeFromCart(productId) {
    try { await fetch(\`/api/public/cart/\${productId}?storeSlug=<%= store.slug %>\`, { method: 'DELETE' }); loadCart(); } catch (e) { alert('Failed to remove item'); }
  }
  async function placeOrder(event) {
    event.preventDefault();
    const firstName = document.getElementById('firstName').value, lastName = document.getElementById('lastName').value, email = document.getElementById('email').value, phone = document.getElementById('phone').value, line1 = document.getElementById('line1').value, line2 = document.getElementById('line2').value, city = document.getElementById('city').value, state = document.getElementById('state').value, pincode = document.getElementById('pincode').value, country = document.getElementById('country').value, paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    if (!firstName || !line1 || !city || !state || !pincode || !phone) { alert('Please fill all required fields'); return; }
    try {
      const res = await fetch('/api/public/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ storeSlug: '<%= store.slug %>', shippingAddress: { name: firstName + ' ' + lastName, email, phone, line1, line2, city, state, pincode, country }, paymentMethod }) });
      if (res.ok) { const data = await res.json(); alert('✅ Order placed successfully!'); window.location.href = \`/stores/<%= store.slug %>/order-confirmation.html?orderId=\${data.orderId}\`; } else { const err = await res.json(); alert('❌ Failed: ' + (err.message || 'Please try again')); }
    } catch (e) { alert('❌ Error placing order.'); }
  }
  document.addEventListener('DOMContentLoaded', loadCart);
</script>`,

  'login.ejs': `<section class="auth-page">
  <div class="container">
    <div class="auth-container">
      <h1>Sign In</h1>
      <p class="auth-subtitle">Welcome back! Please login to your account.</p>
      <form id="login-form" onsubmit="handleLogin(event)">
        <div class="form-group"><label for="login-email">Email Address *</label><input type="email" id="login-email" placeholder="you@example.com" required></div>
        <div class="form-group"><label for="login-password">Password *</label><input type="password" id="login-password" placeholder="Enter your password" required></div>
        <div class="form-options"><label class="remember-me"><input type="checkbox" id="remember-me"> Remember me</label><a href="/stores/<%= store.slug %>/forgot-password.html" class="forgot-link">Forgot Password?</a></div>
        <button type="submit" class="auth-btn">Sign In</button>
        <p class="auth-switch">Don't have an account? <a href="/stores/<%= store.slug %>/register.html">Register</a></p>
      </form>
    </div>
  </div>
</section>
<style>
.auth-page { padding: 60px 0 80px; }
.auth-container { max-width: 420px; margin: 0 auto; background: var(--white); padding: 40px; border-radius: var(--radius); box-shadow: var(--shadow); }
.auth-container h1 { font-family: var(--font-display); font-size: 32px; margin-bottom: 8px; text-align: center; }
.auth-subtitle { color: var(--text-light); text-align: center; margin-bottom: 30px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-weight: 500; font-size: 14px; margin-bottom: 4px; }
.form-group input { width: 100%; padding: 12px 14px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; }
.form-options { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 24px; font-size: 13px; }
.remember-me { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.forgot-link { color: var(--primary-color); }
.auth-btn { width: 100%; padding: 14px; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: var(--transition); }
.auth-btn:hover { background: var(--secondary-color); }
.auth-switch { text-align: center; margin-top: 20px; font-size: 14px; color: var(--text-light); }
.auth-switch a { color: var(--primary-color); font-weight: 500; }
</style>
<script>
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (res.ok) { const data = await res.json(); localStorage.setItem('accessToken', data.data.token); localStorage.setItem('refreshToken', data.data.refreshToken); alert('✅ Login successful!'); window.location.href = \`/stores/<%= store.slug %>\`; }
    else { const err = await res.json(); alert('❌ Login failed: ' + (err.message || 'Invalid credentials')); }
  } catch (e) { alert('❌ Error: ' + e.message); }
}
</script>`,

  'register.ejs': `<section class="auth-page">
  <div class="container">
    <div class="auth-container">
      <h1>Create Account</h1>
      <p class="auth-subtitle">Join us and start shopping!</p>
      <form id="register-form" onsubmit="handleRegister(event)">
        <div class="form-group"><label for="reg-name">Full Name *</label><input type="text" id="reg-name" placeholder="John Doe" required></div>
        <div class="form-group"><label for="reg-email">Email Address *</label><input type="email" id="reg-email" placeholder="you@example.com" required></div>
        <div class="form-group"><label for="reg-password">Password *</label><input type="password" id="reg-password" placeholder="Minimum 6 characters" required minlength="6"></div>
        <div class="form-group"><label for="reg-store-name">Store Name</label><input type="text" id="reg-store-name" placeholder="My Store"></div>
        <button type="submit" class="auth-btn">Create Account</button>
        <p class="auth-switch">Already have an account? <a href="/stores/<%= store.slug %>/login.html">Sign In</a></p>
      </form>
    </div>
  </div>
</section>
<style>
/* Same styles as login */
.auth-page { padding: 60px 0 80px; }
.auth-container { max-width: 420px; margin: 0 auto; background: var(--white); padding: 40px; border-radius: var(--radius); box-shadow: var(--shadow); }
.auth-container h1 { font-family: var(--font-display); font-size: 32px; margin-bottom: 8px; text-align: center; }
.auth-subtitle { color: var(--text-light); text-align: center; margin-bottom: 30px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-weight: 500; font-size: 14px; margin-bottom: 4px; }
.form-group input { width: 100%; padding: 12px 14px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; }
.auth-btn { width: 100%; padding: 14px; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: var(--transition); }
.auth-btn:hover { background: var(--secondary-color); }
.auth-switch { text-align: center; margin-top: 20px; font-size: 14px; color: var(--text-light); }
.auth-switch a { color: var(--primary-color); font-weight: 500; }
</style>
<script>
async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const storeName = document.getElementById('reg-store-name').value || \`\${name}'s Store\`;
  try {
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, storeName, storeSlug: '<%= store.slug %>' }) });
    if (res.ok) { const data = await res.json(); localStorage.setItem('accessToken', data.data.token); localStorage.setItem('refreshToken', data.data.refreshToken); alert('✅ Registration successful!'); window.location.href = \`/stores/<%= store.slug %>\`; }
    else { const err = await res.json(); alert('❌ Registration failed: ' + (err.message || 'Try again')); }
  } catch (e) { alert('❌ Error: ' + e.message); }
}
</script>`,

  'order-confirmation.ejs': `<section class="order-confirmation-page">
  <div class="container">
    <h1>🎉 Order Placed Successfully!</h1>
    <p>Your order has been confirmed. We'll notify you once it ships.</p>
    <div id="order-details"><p>Loading order details...</p></div>
    <a href="/stores/<%= store.slug %>" class="btn-primary">Continue Shopping</a>
  </div>
</section>
<style>
.order-confirmation-page { padding: 60px 0; text-align: center; }
.order-confirmation-page h1 { font-family: var(--font-display); font-size: 36px; margin-bottom: 16px; }
.order-confirmation-page #order-details { background: var(--white); padding: 24px; border-radius: var(--radius); margin: 24px 0; text-align: left; }
.btn-primary { display: inline-block; padding: 12px 30px; background: var(--primary-color); color: white; border-radius: 8px; font-weight: 600; transition: var(--transition); }
.btn-primary:hover { background: var(--secondary-color); color: white; }
</style>
<script>
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  if (orderId) {
    fetch(\`/api/public/orders/\${orderId}?storeSlug=<%= store.slug %>\`)
      .then(res => res.json())
      .then(data => {
        const order = data.data;
        document.getElementById('order-details').innerHTML = \`
          <p><strong>Order ID:</strong> \${order.orderId}</p>
          <p><strong>Total:</strong> ₹\${order.total}</p>
          <p><strong>Status:</strong> \${order.orderStatus}</p>
          <p><strong>Placed on:</strong> \${new Date(order.createdAt).toLocaleDateString()}</p>
          <h4>Items:</h4>
          <ul>\${order.items.map(item => \`<li>\${item.name} × \${item.quantity} – ₹\${item.price}</li>\`).join('')}</ul>
        \`;
      })
      .catch(() => document.getElementById('order-details').innerHTML = '<p>Order not found.</p>');
  }
</script>`,

  'orders.ejs': `<section class="orders-history-page">
  <div class="container">
    <h1>My Orders</h1>
    <div id="orders-list"><p>Loading your orders...</p></div>
  </div>
</section>
<style>
.orders-history-page { padding: 60px 0; }
.orders-history-page h1 { font-family: var(--font-display); font-size: 36px; margin-bottom: 32px; }
.order-item { background: var(--white); padding: 16px; border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 16px; }
.order-item .order-header { display: flex; justify-content: space-between; font-weight: 600; }
.order-item .order-details { margin-top: 8px; }
</style>
<script>
  const token = localStorage.getItem('accessToken');
  if (!token) {
    document.getElementById('orders-list').innerHTML = '<p>Please <a href="/stores/<%= store.slug %>/login.html">login</a> to view your orders.</p>';
  } else {
    fetch(\`/api/public/orders?storeSlug=<%= store.slug %>\`, { headers: { 'Authorization': \`Bearer \${token}\` } })
      .then(res => res.json())
      .then(data => {
        const orders = data.data || [];
        if (orders.length === 0) { document.getElementById('orders-list').innerHTML = '<p>You have no orders yet.</p>'; return; }
        document.getElementById('orders-list').innerHTML = orders.map(order => \`
          <div class="order-item">
            <div class="order-header"><span>#\${order.orderId}</span><span>₹\${order.total}</span><span>\${order.orderStatus}</span><span>\${new Date(order.createdAt).toLocaleDateString()}</span></div>
            <div class="order-details"><ul>\${order.items.map(item => \`<li>\${item.name} × \${item.quantity}</li>\`).join('')}</ul></div>
          </div>
        \`).join('');
      })
      .catch(() => document.getElementById('orders-list').innerHTML = '<p>Failed to load orders.</p>');
  }
</script>`,
};

// ================================================================
// 3. ASSET FILES (CSS / JS) – Professional, Responsive
// ================================================================

const assetFiles = {
  'global.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
:root { --primary: #f97316; --secondary: #1a1509; --text: #1a1509; --text-light: #6b6b6b; --bg: #fafaf8; --white: #ffffff; --border: #e8e4da; --shadow: 0 4px 20px rgba(0,0,0,0.08); --radius: 12px; --transition: all 0.3s ease; --font: 'Inter', -apple-system, sans-serif; --font-display: 'Playfair Display', serif; }
body { font-family: var(--font); color: var(--text); background: var(--bg); line-height: 1.6; min-height: 100vh; display: flex; flex-direction: column; }
a { color: var(--primary); text-decoration: none; } a:hover { color: var(--secondary); }
.container { max-width: 1280px; margin: 0 auto; padding: 0 24px; width: 100%; }
.store-header { background: var(--white); border-bottom: 1px solid var(--border); padding: 16px 0; position: sticky; top: 0; z-index: 100; }
.header-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
.logo a { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }
.logo img { max-height: 40px; width: auto; }
.logo-text { color: var(--text); }
.header-nav { display: flex; gap: 24px; align-items: center; }
.header-nav a { color: var(--text-light); font-size: 14px; font-weight: 500; transition: var(--transition); }
.header-nav a:hover { color: var(--primary); }
.header-actions { display: flex; gap: 16px; align-items: center; }
.cart-icon { font-size: 20px; position: relative; color: var(--text); }
.cart-icon #cart-count { position: absolute; top: -8px; right: -12px; background: var(--primary); color: white; font-size: 11px; font-weight: 600; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
#auth-buttons { display: flex; gap: 12px; }
#auth-buttons a { font-size: 14px; padding: 6px 16px; border-radius: 6px; font-weight: 500; transition: var(--transition); }
#auth-buttons a:first-child { color: var(--text); }
#auth-buttons a:last-child { background: var(--primary); color: white; }
#auth-buttons a:last-child:hover { background: var(--secondary); }
.hero-section { padding: 40px 0 60px; }
.hero-container { border-radius: var(--radius); overflow: hidden; position: relative; min-height: 400px; }
.hero-image { background-size: cover; background-position: center; min-height: 500px; display: flex; align-items: center; position: relative; }
.hero-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); }
.hero-content { position: relative; z-index: 2; padding: 60px; color: white; max-width: 600px; }
.hero-content h1 { font-family: var(--font-display); font-size: 48px; font-weight: 700; margin-bottom: 16px; line-height: 1.2; }
.hero-content p { font-size: 18px; opacity: 0.9; margin-bottom: 24px; }
.hero-btn { display: inline-block; padding: 14px 36px; background: var(--primary); color: white; font-weight: 600; border-radius: 8px; transition: var(--transition); text-transform: uppercase; letter-spacing: 0.5px; font-size: 14px; }
.hero-btn:hover { background: var(--secondary); color: white; transform: translateY(-2px); }
.hero-content-center { text-align: center; padding: 80px 40px; background: #f5f5f0; border-radius: var(--radius); }
.hero-content-center h1 { font-family: var(--font-display); font-size: 42px; margin-bottom: 16px; }
.categories-section { padding: 60px 0; }
.categories-section h2 { font-family: var(--font-display); font-size: 32px; margin-bottom: 32px; text-align: center; }
.category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; }
.category-card { background: var(--white); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); transition: var(--transition); text-align: center; }
.category-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
.category-image { height: 160px; overflow: hidden; }
.category-image img { width: 100%; height: 100%; object-fit: cover; }
.category-card h3 { padding: 16px 16px 20px; font-size: 16px; font-weight: 600; color: var(--text); }
.products-section { padding: 60px 0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.section-header h2 { font-family: var(--font-display); font-size: 32px; }
.view-all { color: var(--text-light); font-weight: 500; font-size: 14px; transition: var(--transition); }
.view-all:hover { color: var(--primary); }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 28px; }
.product-card { background: var(--white); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); transition: var(--transition); }
.product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
.product-card a { display: block; color: var(--text); }
.product-image { position: relative; padding-top: 100%; overflow: hidden; background: #f5f5f0; }
.product-image img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: var(--transition); }
.product-card:hover .product-image img { transform: scale(1.05); }
.badge { position: absolute; top: 12px; right: 12px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.badge.bestseller { background: #f97316; color: white; }
.badge.new { background: #22c55e; color: white; }
.product-title { font-size: 15px; font-weight: 500; padding: 12px 16px 4px; min-height: 48px; }
.product-price { font-size: 18px; font-weight: 600; color: var(--primary); padding: 0 16px 16px; }
.out-of-stock { display: inline-block; padding: 4px 12px; background: #ef4444; color: white; border-radius: 4px; font-size: 12px; font-weight: 600; margin: 0 16px 16px; }
.product-detail-page { padding: 40px 0 60px; }
.breadcrumb { font-size: 13px; color: var(--text-light); margin-bottom: 32px; }
.breadcrumb a { color: var(--text-light); }
.breadcrumb a:hover { color: var(--primary); }
.product-detail-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
.product-images .main-image { border-radius: var(--radius); overflow: hidden; background: #f5f5f0; margin-bottom: 16px; }
.product-images .main-image img { width: 100%; height: auto; aspect-ratio: 1/1; object-fit: contain; }
.thumbnail-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.thumbnail { border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: var(--transition); }
.thumbnail:hover, .thumbnail.active { border-color: var(--primary); }
.thumbnail img { width: 100%; aspect-ratio: 1/1; object-fit: cover; }
.product-info .product-title { font-family: var(--font-display); font-size: 32px; padding: 0 0 12px; }
.product-price-container { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.product-price { font-size: 28px; font-weight: 700; color: var(--primary); padding: 0; }
.compare-price { font-size: 18px; color: var(--text-light); text-decoration: line-through; }
.discount-tag { background: #22c55e; color: white; padding: 2px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
.stock-status { margin-bottom: 16px; }
.in-stock { color: #22c55e; font-weight: 600; }
.product-description { margin: 16px 0 24px; color: var(--text-light); line-height: 1.8; }
.variant-options { margin: 16px 0 24px; }
.variant-group { margin-bottom: 12px; }
.variant-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.variant-group select { width: 100%; max-width: 200px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; background: var(--white); }
.add-to-cart-section { display: flex; gap: 16px; align-items: center; margin: 24px 0; }
.quantity-selector { display: flex; align-items: center; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.quantity-selector button { padding: 10px 14px; border: none; background: var(--white); font-size: 18px; cursor: pointer; transition: var(--transition); }
.quantity-selector button:hover { background: #f5f5f0; }
.quantity-selector input { width: 60px; text-align: center; border: none; border-left: 1px solid var(--border); border-right: 1px solid var(--border); padding: 10px 0; font-size: 16px; font-weight: 500; }
.add-to-cart-btn { padding: 14px 36px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: var(--transition); }
.add-to-cart-btn:hover:not(:disabled) { background: var(--secondary); transform: translateY(-2px); }
.add-to-cart-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.product-meta { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); font-size: 14px; color: var(--text-light); }
.related-products { margin-top: 60px; padding-top: 40px; border-top: 1px solid var(--border); }
.related-products h2 { font-family: var(--font-display); font-size: 28px; margin-bottom: 24px; }
.cart-checkout-page { padding: 40px 0 60px; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-family: var(--font-display); font-size: 36px; }
.cart-container { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; }
.cart-item { display: grid; grid-template-columns: 80px 1fr 1fr 1fr; gap: 16px; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border); }
.cart-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
.cart-item-info h4 { font-size: 14px; margin-bottom: 4px; }
.cart-item-info p { font-size: 13px; color: var(--text-light); }
.cart-item-actions { display: flex; align-items: center; gap: 8px; }
.cart-item-actions button { padding: 4px 10px; border: 1px solid var(--border); background: var(--white); border-radius: 4px; cursor: pointer; font-size: 14px; }
.cart-item-actions button:hover { background: #f5f5f0; }
.cart-item-actions .remove-btn { color: #ef4444; border-color: #ef4444; }
.cart-item-actions .remove-btn:hover { background: #fee2e2; }
.cart-item-total { font-weight: 600; text-align: right; }
.empty-cart { text-align: center; padding: 60px 0; color: var(--text-light); font-size: 18px; }
.cart-summary { background: var(--white); padding: 24px; border-radius: var(--radius); box-shadow: var(--shadow); position: sticky; top: 100px; }
.cart-summary h3 { font-size: 18px; margin-bottom: 16px; }
.summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
.summary-row.total { font-size: 18px; font-weight: 700; border-top: 1px solid var(--border); margin-top: 8px; padding-top: 16px; }
.checkout-btn { display: block; text-align: center; padding: 14px; background: var(--primary); color: white; border-radius: 8px; font-weight: 600; margin-top: 16px; transition: var(--transition); }
.checkout-btn:hover { background: var(--secondary); color: white; }
.checkout-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; }
.checkout-form h3 { font-size: 18px; margin-bottom: 16px; margin-top: 24px; }
.checkout-form h3:first-child { margin-top: 0; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.form-group input, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; transition: var(--transition); }
.form-group input:focus, .form-group select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
.payment-methods { display: flex; flex-direction: column; gap: 12px; margin: 12px 0 24px; }
.payment-methods label { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 2px solid var(--border); border-radius: 8px; cursor: pointer; transition: var(--transition); }
.payment-methods label:hover { border-color: var(--primary); }
.payment-methods input[type="radio"]:checked + label { border-color: var(--primary); background: rgba(249,115,22,0.05); }
.checkout-summary { background: var(--white); padding: 24px; border-radius: var(--radius); box-shadow: var(--shadow); position: sticky; top: 100px; }
.checkout-summary h3 { font-size: 18px; margin-bottom: 16px; }
.place-order-btn { width: 100%; padding: 16px; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: var(--transition); margin-top: 16px; }
.place-order-btn:hover { background: var(--secondary); }
.summary-divider { border-top: 1px solid var(--border); margin: 12px 0; }
#order-items .summary-item { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
.store-footer { background: var(--secondary); color: rgba(255,255,255,0.8); padding: 48px 0 24px; margin-top: auto; }
.footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; margin-bottom: 32px; }
.footer-brand h3 { color: white; font-family: var(--font-display); font-size: 24px; margin-bottom: 8px; }
.footer-brand p { font-size: 14px; opacity: 0.7; }
.footer-links h4, .footer-contact h4, .footer-social h4 { color: white; font-size: 14px; font-weight: 600; margin-bottom: 12px; }
.footer-links ul { list-style: none; }
.footer-links li { margin-bottom: 8px; }
.footer-links a { color: rgba(255,255,255,0.7); font-size: 14px; transition: var(--transition); }
.footer-links a:hover { color: white; }
.footer-contact p { font-size: 14px; margin-bottom: 6px; opacity: 0.7; }
.footer-contact a { color: rgba(255,255,255,0.7); }
.footer-contact a:hover { color: white; }
.social-links { display: flex; gap: 12px; font-size: 24px; }
.social-links a { opacity: 0.7; transition: var(--transition); }
.social-links a:hover { opacity: 1; transform: translateY(-2px); }
.footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; text-align: center; font-size: 13px; opacity: 0.6; }
@media (max-width: 1024px) { .product-detail-layout, .cart-container, .checkout-layout { grid-template-columns: 1fr; } }
@media (max-width: 768px) {
  .header-inner { flex-direction: column; align-items: stretch; gap: 12px; }
  .header-nav { justify-content: center; flex-wrap: wrap; }
  .header-actions { justify-content: center; }
  .hero-content { padding: 40px 24px; }
  .hero-content h1 { font-size: 32px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .category-grid { grid-template-columns: repeat(2, 1fr); }
  .form-row { grid-template-columns: 1fr; }
  .cart-item { grid-template-columns: 60px 1fr; gap: 12px; }
  .cart-item-total { grid-column: span 2; text-align: right; }
  .thumbnail-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 480px) {
  .product-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
  .product-title { font-size: 13px; padding: 8px 12px 4px; }
  .product-price { font-size: 15px; padding: 0 12px 12px; }
  .add-to-cart-section { flex-direction: column; }
  .add-to-cart-btn { width: 100%; }
}`,

  'app.js': `const CONFIG = window.__STORE_CONFIG__ || { storeSlug: '', storeId: '', apiBase: '/api', currency: 'INR' };
async function getCartCount() {
  try { const res = await fetch(\`\${CONFIG.apiBase}/public/cart/count?storeSlug=\${CONFIG.storeSlug}\`); if (res.ok) { const data = await res.json(); return data.count || 0; } return 0; } catch { return 0; }
}
async function addToCart(productId, quantity = 1) {
  try { const res = await fetch(\`\${CONFIG.apiBase}/public/cart\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity, storeSlug: CONFIG.storeSlug }) }); if (res.ok) { const data = await res.json(); updateCartUI(data.count || 0); return { success: true, data }; } const err = await res.json(); return { success: false, error: err.message }; } catch (err) { return { success: false, error: err.message }; }
}
async function getCart() {
  try { const res = await fetch(\`\${CONFIG.apiBase}/public/cart?storeSlug=\${CONFIG.storeSlug}\`); if (res.ok) return await res.json(); return { items: [] }; } catch { return { items: [] }; }
}
async function updateCartItem(productId, quantity) {
  try { const res = await fetch(\`\${CONFIG.apiBase}/public/cart\`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity, storeSlug: CONFIG.storeSlug }) }); if (res.ok) { const data = await res.json(); updateCartUI(data.count || 0); return { success: true, data }; } return { success: false }; } catch { return { success: false }; }
}
async function removeFromCart(productId) {
  try { const res = await fetch(\`\${CONFIG.apiBase}/public/cart/\${productId}?storeSlug=\${CONFIG.storeSlug}\`, { method: 'DELETE' }); if (res.ok) { const data = await res.json(); updateCartUI(data.count || 0); return { success: true, data }; } return { success: false }; } catch { return { success: false }; }
}
async function clearCart() {
  try { const res = await fetch(\`\${CONFIG.apiBase}/public/cart?storeSlug=\${CONFIG.storeSlug}\`, { method: 'DELETE' }); if (res.ok) { updateCartUI(0); return { success: true }; } return { success: false }; } catch { return { success: false }; }
}
function updateCartUI(count) { const el = document.getElementById('cart-count'); if (el) el.textContent = count; }
async function renderCart() {
  const container = document.getElementById('cart-items');
  if (!container) return;
  const data = await getCart();
  const items = data.items || [];
  if (items.length === 0) { container.innerHTML = '<p class="empty-cart">Your cart is empty.</p>'; document.getElementById('cart-summary').style.display = 'none'; return; }
  document.getElementById('cart-summary').style.display = 'block';
  let html = ''; let subtotal = 0;
  items.forEach(item => {
    const total = item.price * item.quantity; subtotal += total;
    html += \`
      <div class="cart-item">
        <img src="\${item.image || '/placeholder.jpg'}" alt="\${item.name}">
        <div class="cart-item-info"><h4>\${item.name}</h4><p>₹\${item.price} × \${item.quantity}</p></div>
        <div class="cart-item-actions">
          <button onclick="updateCartItemUI('\${item.productId}', \${item.quantity - 1})">−</button>
          <span>\${item.quantity}</span>
          <button onclick="updateCartItemUI('\${item.productId}', \${item.quantity + 1})">+</button>
          <button onclick="removeFromCartUI('\${item.productId}')" class="remove-btn">✕</button>
        </div>
        <div class="cart-item-total">₹\${total}</div>
      </div>
    \`;
  });
  container.innerHTML = html;
  const shipping = subtotal > 0 ? 99 : 0; const total = subtotal + shipping;
  document.getElementById('subtotal').textContent = '₹' + subtotal;
  document.getElementById('shipping').textContent = '₹' + shipping;
  document.getElementById('total').textContent = '₹' + total;
}
async function updateCartItemUI(productId, quantity) { if (quantity <= 0) { await removeFromCartUI(productId); return; } await updateCartItem(productId, quantity); renderCart(); }
async function removeFromCartUI(productId) { await removeFromCart(productId); renderCart(); }

function isLoggedIn() { return !!localStorage.getItem('accessToken'); }
async function getCurrentUser() {
  try { const token = localStorage.getItem('accessToken'); if (!token) return null; const res = await fetch(\`\${CONFIG.apiBase}/auth/me\`, { headers: { 'Authorization': \`Bearer \${token}\` } }); if (res.ok) { const data = await res.json(); return data.data?.user || null; } return null; } catch { return null; }
}
async function login(email, password) {
  try { const res = await fetch(\`\${CONFIG.apiBase}/auth/login\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); if (res.ok) { const data = await res.json(); localStorage.setItem('accessToken', data.data.token); localStorage.setItem('refreshToken', data.data.refreshToken); updateAuthUI(); return { success: true, data }; } const err = await res.json(); return { success: false, error: err.message }; } catch (err) { return { success: false, error: err.message }; }
}
async function register(name, email, password) {
  try { const res = await fetch(\`\${CONFIG.apiBase}/auth/register\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) }); if (res.ok) { const data = await res.json(); localStorage.setItem('accessToken', data.data.token); localStorage.setItem('refreshToken', data.data.refreshToken); updateAuthUI(); return { success: true, data }; } const err = await res.json(); return { success: false, error: err.message }; } catch (err) { return { success: false, error: err.message }; }
}
function logout() { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); updateAuthUI(); window.location.reload(); }
function updateAuthUI() {
  const container = document.getElementById('auth-buttons');
  if (!container) return;
  const token = localStorage.getItem('accessToken');
  if (token) {
    container.innerHTML = \`<a href="/stores/\${CONFIG.storeSlug}/orders.html">My Orders</a><a href="/stores/\${CONFIG.storeSlug}/profile.html">Profile</a><a href="#" onclick="logout(); return false;">Logout</a>\`;
  } else {
    container.innerHTML = \`<a href="/stores/\${CONFIG.storeSlug}/login.html">Login</a><a href="/stores/\${CONFIG.storeSlug}/register.html">Register</a>\`;
  }
}

async function placeOrder(orderData) {
  try { const token = localStorage.getItem('accessToken'); const headers = { 'Content-Type': 'application/json' }; if (token) headers['Authorization'] = \`Bearer \${token}\`; const res = await fetch(\`\${CONFIG.apiBase}/public/orders\`, { method: 'POST', headers, body: JSON.stringify({ ...orderData, storeSlug: CONFIG.storeSlug }) }); if (res.ok) { const data = await res.json(); return { success: true, data }; } const err = await res.json(); return { success: false, error: err.message }; } catch (err) { return { success: false, error: err.message }; }
}
async function getOrders() {
  try { const token = localStorage.getItem('accessToken'); if (!token) return { orders: [] }; const res = await fetch(\`\${CONFIG.apiBase}/public/orders?storeSlug=\${CONFIG.storeSlug}\`, { headers: { 'Authorization': \`Bearer \${token}\` } }); if (res.ok) { const data = await res.json(); return data; } return { orders: [] }; } catch { return { orders: [] }; }
}

document.addEventListener('DOMContentLoaded', async () => {
  const count = await getCartCount(); updateCartUI(count); updateAuthUI();
  if (document.getElementById('cart-items')) renderCart();
});

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = \`position: fixed; bottom: 20px; right: 20px; padding: 16px 24px; border-radius: 8px; color: white; font-weight: 500; z-index: 10000; max-width: 400px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); animation: slideIn 0.3s ease;\`;
  toast.style.background = type === 'success' ? '#22c55e' : '#ef4444';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s ease'; setTimeout(() => toast.remove(), 300); }, 3000);
}
const style = document.createElement('style');
style.textContent = \`@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }\`;
document.head.appendChild(style);
window.Storefront = { CONFIG, addToCart, getCart, updateCartItem, removeFromCart, clearCart, login, register, logout, isLoggedIn, getCurrentUser, placeOrder, getOrders, showToast };`,
};

// ================================================================
// 4. CONTROLLER FILES
// ================================================================

const controllerFiles = {
  'deployController.js': `
import deploymentService from '../services/deployment/deploymentService.js';
import Store from '../models/Store.js';
import { logger } from '../utils/logger.js';

export const deployStore = async (req, res) => {
  console.log(\`🔍 Received deploy request for store ID: \${req.params.id}\`);
  try {
    const { id } = req.params;
    const userId = req.user.id;
    console.log(\`👤 User ID: \${userId}\`);

    console.log('📝 Checking store ownership...');
    const store = await Store.findOne({ _id: id, ownerId: userId });
    if (!store) {
      console.warn(\`⚠️ Store not found or user \${userId} does not own store \${id}\`);
      return res.status(404).json({ success: false, message: 'Store not found or you do not have permission' });
    }
    console.log(\`✅ Store found: \${store.name}\`);

    if (store.status === 'suspended' || store.status === 'expired') {
      console.warn(\`⚠️ Store is \${store.status}. Cannot deploy.\`);
      return res.status(403).json({ success: false, message: \`Store is \${store.status}. Cannot deploy.\` });
    }

    logger.info(\`Deployment started for store: \${store.name} (\${store._id})\`);
    const result = await deploymentService.deployStore(id);
    console.log(\`✅ Deployment API call successful for store: \${store.slug}\`);
    return res.status(200).json({
      success: true,
      message: 'Store deployed successfully',
      data: {
        storeId: store._id,
        storeSlug: store.slug,
        version: result.version,
        url: result.url,
        deployedAt: result.deployedAt,
        pagesGenerated: result.pagesGenerated
      }
    });
  } catch (err) {
    console.error('❌ deployController error:', err.message);
    console.error('❌ Stack:', err.stack);
    logger.error('Deploy error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to deploy store' });
  }
};

export const getDeployStatus = async (req, res) => {
  console.log(\`🔍 Received status request for store ID: \${req.params.id}\`);
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const store = await Store.findOne({ _id: id, ownerId: userId });
    if (!store) {
      console.warn(\`⚠️ Store not found for status check: \${id}\`);
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    const status = await deploymentService.getDeployStatus(id);
    console.log(\`✅ Status response sent for store: \${store.slug}\`);
    return res.status(200).json({ success: true, data: status });
  } catch (err) {
    console.error('❌ getDeployStatus error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Failed to get deployment status' });
  }
};

export default {
  deployStore,
  getDeployStatus,
};
`,

  'publicOrderController.js': `
import Order from '../models/Order.js';
import Store from '../models/Store.js';

export const listOrders = async (req, res) => {
  console.log(\`🔍 listOrders called for store: \${req.storeId}\`);
  try {
    const storeId = req.storeId;
    const customerId = req.user?._id;
    if (!customerId) {
      console.warn('⚠️ Unauthorized order list attempt (no customerId)');
      return res.status(401).json({ success: false, message: 'Please login to view orders' });
    }
    const orders = await Order.find({ storeId, customerId }).sort({ createdAt: -1 });
    console.log(\`✅ Found \${orders.length} orders for customer \${customerId}\`);
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('❌ listOrders error:', err.message);
    console.error('❌ Stack:', err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrder = async (req, res) => {
  console.log(\`🔍 getOrder called for orderId: \${req.params.orderId}\`);
  try {
    const { orderId } = req.params;
    const storeId = req.storeId;
    const order = await Order.findOne({ storeId, orderId });
    if (!order) {
      console.warn(\`⚠️ Order not found: \${orderId} in store \${storeId}\`);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    console.log(\`✅ Order found: \${orderId}\`);
    res.json({ success: true, data: order });
  } catch (err) {
    console.error('❌ getOrder error:', err.message);
    console.error('❌ Stack:', err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
};
`,
};

// ================================================================
// 5. MIDDLEWARE FILE
// ================================================================

const middlewareFile = {
  'public.js': `
import Store from '../models/Store.js';

export const resolveStoreFromSlug = async (req, res, next) => {
  try {
    const storeSlug = req.body.storeSlug || req.query.storeSlug || req.params.storeSlug;
    
    if (!storeSlug) {
      console.warn('⚠️ [Public Middleware] Store slug missing in request:', req.method, req.originalUrl);
      return res.status(400).json({ success: false, message: 'Store slug is required' });
    }

    console.log(\`🔍 [Public Middleware] Resolving store for slug: \${storeSlug}\`);

    const store = await Store.findOne({ slug: storeSlug });
    if (!store) {
      console.warn(\`⚠️ [Public Middleware] Store not found for slug: \${storeSlug}\`);
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    req.storeId = store._id;
    req.store = store;
    console.log(\`✅ [Public Middleware] Store resolved successfully. ID: \${store._id}, Name: \${store.name}\`);
    next();
  } catch (err) {
    console.error('❌ [Public Middleware] Database or internal error:', err.message);
    console.error('❌ [Public Middleware] Stack trace:', err.stack);
    return res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
  }
};
`,
};

// ================================================================
// 6. ROUTE FILES
// ================================================================

const routeFiles = {
  'deploy.js': `
import express from 'express';
import { protect } from '../middleware/auth.js';
import { deployStore, getDeployStatus } from '../controllers/deployController.js';

const router = express.Router();

router.use(protect);

router.post('/:id/deploy', deployStore);
router.get('/:id/deploy/status', getDeployStatus);

export default router;
`,

  'public.js': `
import express from 'express';
import { resolveStoreFromSlug } from '../middleware/public.js';
import * as cartController from '../controllers/cartController.js';
import * as orderController from '../controllers/orderController.js';
import { listOrders, getOrder } from '../controllers/publicOrderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

console.log('🛣️ Initializing Public Routes...');

// ==================== CART (Guest & Logged-in) ====================
router.post('/cart', resolveStoreFromSlug, cartController.addToCart);
router.put('/cart', resolveStoreFromSlug, cartController.updateCartItem);
router.delete('/cart/:productId', resolveStoreFromSlug, cartController.removeFromCart);
router.get('/cart', resolveStoreFromSlug, cartController.getCart);
router.delete('/cart', resolveStoreFromSlug, cartController.clearCart);
console.log('✅ Cart routes mounted');

// ==================== ORDERS ====================
router.post('/orders', resolveStoreFromSlug, orderController.createOrder);
router.get('/orders', protect, resolveStoreFromSlug, listOrders);
router.get('/orders/:orderId', resolveStoreFromSlug, getOrder);
console.log('✅ Order routes mounted');

export default router;
`,
};

// ================================================================
// MAIN EXECUTION
// ================================================================

console.log('🚀 Starting HTML Storefront Generator setup...\n');

// Create service files
for (const [filename, content] of Object.entries(serviceFiles)) {
  const filePath = path.join(SERVICES_DIR, filename);
  writeFile(filePath, content);
}

// Create template files
for (const [filename, content] of Object.entries(templateFiles)) {
  const filePath = path.join(TEMPLATES_DIR, filename);
  writeFile(filePath, content);
}

// Create asset files
for (const [filename, content] of Object.entries(assetFiles)) {
  const filePath = path.join(STORES_ASSETS_DIR, filename);
  writeFile(filePath, content);
}

// Create controller files
for (const [filename, content] of Object.entries(controllerFiles)) {
  const filePath = path.join(CONTROLLERS_DIR, filename);
  writeFile(filePath, content);
}

// Create middleware file
for (const [filename, content] of Object.entries(middlewareFile)) {
  const filePath = path.join(MIDDLEWARE_DIR, filename);
  writeFile(filePath, content);
}

// Create route files
for (const [filename, content] of Object.entries(routeFiles)) {
  const filePath = path.join(ROUTES_DIR, filename);
  writeFile(filePath, content);
}

console.log('\n✅ All files created successfully!');
console.log('\n📋 Next steps:');
console.log('1. Manually modify backend/src/models/Store.js – Add deployment fields:');
console.log('   isDeployed, deployedAt, deploymentVersion, lastDeployAt, deployStatus, deployMessage');
console.log('2. Manually modify backend/src/routes/index.js – Add:');
console.log('   import deployRoutes from \'./deploy.js\';');
console.log('   import publicRoutes from \'./public.js\';');
console.log('   app.use(\'/api/stores\', deployRoutes);');
console.log('   app.use(\'/api/public\', publicRoutes);');
console.log('3. Run: npm start');
console.log('\n🎉 Done!');