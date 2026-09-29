import express from 'express';
import { serveStorefrontPage } from '../controllers/storefrontController.js';

const router = express.Router();

router.get('/:storeSlug', serveStorefrontPage);
router.get('/:storeSlug/:pageName', serveStorefrontPage);

export default router;