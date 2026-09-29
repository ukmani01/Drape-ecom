import cron from 'node-cron';
import { Subscription, Store } from '../models/index.js';
import { sendSubscriptionReminder } from '../services/emailService.js';
import { logger } from '../utils/logger.js';

cron.schedule('0 0 * * *', async () => {
  logger.info('Running subscription checker...');

  try {
    const now = new Date();
    const fiveDaysLater = new Date(now);
    fiveDaysLater.setDate(now.getDate() + 5);

    const expiringSubs = await Subscription.find({
      status: 'active',
      currentPeriodEnd: { $lte: fiveDaysLater, $gt: now },
    }).populate({
      path: 'storeId',
      populate: { path: 'ownerId' },
    });

    for (const sub of expiringSubs) {
      const store = sub.storeId;
      if (store && store.ownerId) {
        await sendSubscriptionReminder(store.ownerId.email, store.name, sub.currentPeriodEnd);
        logger.info(`Reminder sent for store: ${store.name}`);
      }
    }

    const expiredSubs = await Subscription.find({
      status: 'active',
      currentPeriodEnd: { $lt: now },
    }).populate('storeId');

    for (const sub of expiredSubs) {
      const store = sub.storeId;
      if (store) {
        store.status = 'expired';
        await store.save();
        sub.status = 'expired';
        await sub.save();
        logger.info(`Store expired: ${store.name}`);
      }
    }

    logger.info(`Subscription check completed. Expiring: ${expiringSubs.length}, Expired: ${expiredSubs.length}`);
  } catch (err) {
    logger.error('Subscription checker error:', err);
  }
});

logger.info('📅 Subscription checker scheduled');
