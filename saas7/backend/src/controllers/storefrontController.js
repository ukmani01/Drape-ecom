import {
  isStorefrontPage,
  normalizeStorefrontPageName,
  renderStorefrontPage,
} from '../services/storefrontService.js';

export const serveStorefrontPage = async (req, res, next) => {
  const rawStoreSlug = req.params.storeSlug;
  if (!rawStoreSlug) return next();

  const pageName = normalizeStorefrontPageName(req.params.pageName || 'index.html');
  if (!isStorefrontPage(pageName)) return next();

  try {
    const html = await renderStorefrontPage(rawStoreSlug, pageName, req.query);
    if (!html) {
      return res.status(404).type('text/plain').send('Store or page not found');
    }

    res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    return res.status(200).type('html').send(html);
  } catch (error) {
    console.error('Storefront rendering failed:', error);
    return res.status(500).type('text/plain').send('Unable to load store');
  }
};