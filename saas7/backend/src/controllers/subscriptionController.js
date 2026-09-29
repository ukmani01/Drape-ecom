import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import Store from '../models/Store.js';
import ActivityLog from '../models/ActivityLog.js';

export const getSubscriptionStatus = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const subscription = await Subscription.findOne({ storeId }).populate('planId');
    if (!subscription) {
      return res.status(200).json({ success: true, data: { status: 'none' } });
    }
    const now = new Date();
    const daysLeft = Math.ceil((new Date(subscription.currentPeriodEnd) - now) / (1000 * 60 * 60 * 24));
    res.status(200).json({
      success: true,
      data: {
        status: subscription.status,
        plan: subscription.planId,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        expiresAt: subscription.currentPeriodEnd,
        autoRenew: subscription.autoRenew,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
    res.status(200).json({
      success: true,
      data: { docs: plans, total: plans.length },
    });
  } catch (err) {
    next(err);
  }
};

export const upgradePlan = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan) throw new Error('Plan not found');
    let subscription = await Subscription.findOne({ storeId });
    if (!subscription) {
      subscription = new Subscription({ storeId, planId, status: 'active' });
    } else {
      subscription.planId = planId;
      subscription.status = 'active';
    }
    subscription.currentPeriodStart = new Date();
    subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await subscription.save();
    await Store.findByIdAndUpdate(storeId, { subscriptionId: subscription._id, status: 'active' });
    await ActivityLog.create({
      storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'SUBSCRIPTION_UPGRADED',
      details: { planId, planName: plan.name },
    });
    res.status(200).json({ success: true, data: subscription });
  } catch (err) {
    next(err);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const subscription = await Subscription.findOne({ storeId });
    if (!subscription) throw new Error('Subscription not found');
    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    subscription.cancelledAt = new Date();
    await subscription.save();
    await ActivityLog.create({
      storeId,
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'SUBSCRIPTION_CANCELLED',
    });
    res.status(200).json({ success: true, message: 'Subscription cancelled' });
  } catch (err) {
    next(err);
  }
};