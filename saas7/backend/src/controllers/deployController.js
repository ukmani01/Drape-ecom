
import deploymentService from '../services/deployment/deploymentService.js';
import Store from '../models/Store.js';
import { logger } from '../utils/logger.js';

export const deployStore = async (req, res) => {
  console.log(`🔍 Received deploy request for store ID: ${req.params.id}`);
  try {
    const { id } = req.params;
    const userId = req.user.id;
    console.log(`👤 User ID: ${userId}`);

    console.log('📝 Checking store ownership...');
    const store = await Store.findOne({ _id: id, ownerId: userId });
    if (!store) {
      console.warn(`⚠️ Store not found or user ${userId} does not own store ${id}`);
      return res.status(404).json({ success: false, message: 'Store not found or you do not have permission' });
    }
    console.log(`✅ Store found: ${store.name}`);

    if (store.status === 'suspended' || store.status === 'expired') {
      console.warn(`⚠️ Store is ${store.status}. Cannot deploy.`);
      return res.status(403).json({ success: false, message: `Store is ${store.status}. Cannot deploy.` });
    }

    logger.info(`Deployment started for store: ${store.name} (${store._id})`);
    const result = await deploymentService.deployStore(id);
    console.log(`✅ Deployment API call successful for store: ${store.slug}`);
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
  console.log(`🔍 Received status request for store ID: ${req.params.id}`);
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const store = await Store.findOne({ _id: id, ownerId: userId });
    if (!store) {
      console.warn(`⚠️ Store not found for status check: ${id}`);
      return res.status(404).json({ success: false, message: 'Store not found' });
    }
    const status = await deploymentService.getDeployStatus(id);
    console.log(`✅ Status response sent for store: ${store.slug}`);
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
