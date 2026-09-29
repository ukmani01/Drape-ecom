
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
  console.log(`🚀 Starting deployment for store ID: ${storeId}`);

  try {
    console.log('📝 Updating status to "deploying"...');
    await Store.findByIdAndUpdate(storeId, {
      deployStatus: 'deploying',
      deployMessage: 'Starting deployment...',
    });

    console.log('📦 Fetching store data...');
    const store = await Store.findById(storeId);
    if (!store) {
      console.error(`❌ Store not found for ID: ${storeId}`);
      throw new Error('Store not found');
    }
    console.log(`✅ Store found: ${store.name} (${store.slug})`);

    console.log('📦 Fetching products...');
    const products = await Product.find({ storeId }).sort({ createdAt: -1 });
    console.log(`✅ ${products.length} products found`);

    console.log('📦 Fetching categories...');
    const categories = await Category.find({ storeId }).sort({ order: 1 });
    console.log(`✅ ${categories.length} categories found`);

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
    console.log(`🗑️ Deleting existing store folder: ${storeDir}`);
    await fileSystemService.deleteFolder(storeDir);

    // ✅ RECREATE THE FOLDER (ensureDirectories will recreate it)
    console.log(`📁 Recreating store folder: ${storeDir}`);
    await fileSystemService.ensureDirectories();

    // ✅ WRITE ALL PAGES DIRECTLY TO ROOT
    console.log(`📝 Writing pages directly to root: ${storeDir}`);
    for (const [filename, content] of Object.entries(pages)) {
      const filePath = `${storeDir}/${filename}`;
      await fileSystemService.writeFile(filePath, content);
    }
    console.log(`✅ ${Object.keys(pages).length} pages written to root`);

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
      deployMessage: `Deployed successfully`,
    });

    const storeUrl = `/stores/${storeSlug}`;
    console.log(`✅ Store deployed successfully: ${storeUrl}`);
    logger.success(`✅ Store deployed successfully: ${storeUrl}`);

    return {
      success: true,
      storeId: store._id,
      storeSlug,
      url: storeUrl,
      pagesGenerated: Object.keys(pages).length,
      deployedAt: new Date(),
    };

  } catch (err) {
    console.error(`❌ Deployment failed for store ${storeId}:`, err.message);
    console.error('❌ Stack:', err.stack);
    logger.error(`❌ Deployment failed for store ${storeId}:`, err);
    
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
    console.log(`🔍 Fetching deployment status for store: ${storeId}`);
    const store = await Store.findById(storeId);
    if (!store) {
      console.error(`❌ Store not found for status check: ${storeId}`);
      throw new Error('Store not found');
    }
    console.log(`✅ Status fetched for store: ${store.slug}`);
    return {
      isDeployed: store.isDeployed,
      deployedAt: store.deployedAt,
      lastDeployAt: store.lastDeployAt,
      deployStatus: store.deployStatus,
      deployMessage: store.deployMessage,
      url: store.isDeployed ? `/stores/${store.slug}` : null,
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
