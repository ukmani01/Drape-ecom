import { Subscription, Store, Plan, ActivityLog } from '../models/index.js';
import { sendSubscriptionReminder } from './emailService.js';
import { logger } from '../utils/logger.js';

export const getSubscription = async (storeId) => {
  return Subscription.findOne({ storeId }).populate('planId');
};

export const createSubscription = async (storeId, planId, options = {}) => {
  const plan = await Plan.findById(planId);
  if (!plan) throw new Error('Plan not found');

  const subscription = new Subscription({
    storeId,
    planId,
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    autoRenew: options.autoRenew || true,
    ...options,
  });
  await subscription.save();

  await Store.findByIdAndUpdate(storeId, { subscriptionId: subscription._id, status: 'active' });

  await ActivityLog.create({
    storeId,
    action: 'SUBSCRIPTION_CREATED',
    details: { planId, planName: plan.name },
  });

  return subscription;
};

export const renewSubscription = async (storeId, paymentDetails = {}) => {
  const subscription = await Subscription.findOne({ storeId }).populate('planId');
  if (!subscription) throw new Error('Subscription not found');

  subscription.currentPeriodStart = new Date();
  subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  subscription.status = 'active';
  subscription.paymentHistory = subscription.paymentHistory || [];
  subscription.paymentHistory.push({
    date: new Date(),
    amount: subscription.planId.price,
    ...paymentDetails,
  });
  await subscription.save();

  await Store.findByIdAndUpdate(storeId, { status: 'active' });

  await ActivityLog.create({
    storeId,
    action: 'SUBSCRIPTION_RENEWED',
    details: { planId: subscription.planId._id, amount: subscription.planId.price },
  });

  return subscription;
};

export const cancelSubscription = async (storeId) => {
  const subscription = await Subscription.findOne({ storeId });
  if (!subscription) throw new Error('Subscription not found');

  subscription.status = 'cancelled';
  subscription.autoRenew = false;
  subscription.cancelledAt = new Date();
  await subscription.save();

  await ActivityLog.create({
    storeId,
    action: 'SUBSCRIPTION_CANCELLED',
  });

  return subscription;
};

export const upgradePlan = async (storeId, newPlanId) => {
  const subscription = await Subscription.findOne({ storeId });
  if (!subscription) throw new Error('Subscription not found');

  const plan = await Plan.findById(newPlanId);
  if (!plan) throw new Error('Plan not found');

  subscription.planId = newPlanId;
  subscription.status = 'active';
  await subscription.save();

  await ActivityLog.create({
    storeId,
    action: 'SUBSCRIPTION_UPGRADED',
    details: { newPlanId, newPlanName: plan.name },
  });

  return subscription;
};

export const checkExpiringSubscriptions = async () => {
  const now = new Date();
  const fiveDaysLater = new Date(now);
  fiveDaysLater.setDate(now.getDate() + 5);

  const expiring = await Subscription.find({
    status: 'active',
    currentPeriodEnd: { $lte: fiveDaysLater, $gt: now },
  }).populate({
    path: 'storeId',
    populate: { path: 'ownerId' },
  });

  for (const sub of expiring) {
    const store = sub.storeId;
    if (store && store.ownerId) {
      await sendSubscriptionReminder(store.ownerId.email, store.name, sub.currentPeriodEnd);
    }
  }

  return expiring.length;
};

export const checkExpiredSubscriptions = async () => {
  const now = new Date();

  const expired = await Subscription.find({
    status: 'active',
    currentPeriodEnd: { $lt: now },
  }).populate('storeId');

  for (const sub of expired) {
    const store = sub.storeId;
    if (store) {
      store.status = 'expired';
      await store.save();
      sub.status = 'expired';
      await sub.save();

      await ActivityLog.create({
        storeId: store._id,
        action: 'SUBSCRIPTION_EXPIRED',
      });
    }
  }

  return expired.length;
};

export const getSubscriptionStatus = async (storeId) => {
  const subscription = await getSubscription(storeId);
  if (!subscription) return { status: 'none' };

  const now = new Date();
  const daysLeft = Math.ceil((new Date(subscription.currentPeriodEnd) - now) / (1000 * 60 * 60 * 24));

  return {
    status: subscription.status,
    plan: subscription.planId,
    daysLeft,
    expiresAt: subscription.currentPeriodEnd,
    autoRenew: subscription.autoRenew,
  };
};

export default {
  getSubscription,
  createSubscription,
  renewSubscription,
  cancelSubscription,
  upgradePlan,
  checkExpiringSubscriptions,
  checkExpiredSubscriptions,
  getSubscriptionStatus,
};
