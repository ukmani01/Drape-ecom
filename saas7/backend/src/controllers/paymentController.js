import Razorpay from 'razorpay'; // 🔥 NEW: Store Keys-க்கு Dynamic Instance Create பண்ண
import { 
  createOrder, 
  verifyPaymentSignature, 
  verifyPaymentSignatureWithSecret, 
  capturePayment, 
  verifyWebhookSignature, 
  getStoreRazorpayInstance 
} from '../services/paymentService.js';
import { Order, ActivityLog, Subscription, Store } from '../models/index.js';

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency, receipt, notes } = req.body;
    const storeId = req.user?.storeId;
    const planId = notes?.planId;

    let razorpayInstance;
    let orderNotes = { storeId, planId, ...notes };

    // 🔥 STRATEGY: planId இருந்தால் Subscription (Platform Keys). இல்லைனால் Product (Store Keys).
    if (planId) {
      // Subscription: Platform Default Keys-ஐ Use பண்ணு
      razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    } else {
      // Product Purchase: Store Owner-ன் Keys-ஐ Use பண்ணு (Multi-Tenant)
      try {
        razorpayInstance = await getStoreRazorpayInstance(storeId);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Store owner has not configured payment gateway. Please contact store admin.',
        });
      }
    }

    const order = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100),
      currency: currency || 'INR',
      receipt: receipt || `ord_${Date.now()}`,
      notes: orderNotes,
    });

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error('❌ Order creation error:', err);
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, orderData } = req.body;
    const storeId = req.user?.storeId;
    const planId = orderData?.planId;
    let isValid = false;
    let razorpayInstance;

    // 🔥 DYNAMIC VERIFICATION: planId வைத்து Secret-ஐ Decide பண்ணு
    if (planId) {
      // Subscription: Platform Secret-ஐ Use பண்ணு
      isValid = verifyPaymentSignature(orderId, paymentId, signature);
    } else {
      // Product: Store Owner Secret-ஐ Use பண்ணு
      try {
        razorpayInstance = await getStoreRazorpayInstance(storeId);
        isValid = verifyPaymentSignatureWithSecret(
          orderId,
          paymentId,
          signature,
          razorpayInstance.key_secret
        );
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'Store payment configuration error. Please contact store owner.',
        });
      }
    }

    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    // =============================================================
    // 🔥 CAPTURE PAYMENT (Dynamic Instance)
    // =============================================================
    if (orderData && orderData.amount) {
      try {
        if (razorpayInstance) {
          await razorpayInstance.payments.capture(paymentId, Math.round(orderData.amount * 100));
        } else {
          await capturePayment(paymentId, orderData.amount);
        }
        console.log('✅ Payment captured successfully');
      } catch (captureErr) {
        if (captureErr.statusCode === 400 || captureErr.error?.code === 'BAD_REQUEST_ERROR') {
          console.log('ℹ️ Payment already captured. Skipping capture step.');
        } else {
          throw captureErr;
        }
      }
    }

    // Update Order payment status (if orderId provided)
    if (orderData && orderData.orderId) {
      await Order.findOneAndUpdate(
        { _id: orderData.orderId },
        { paymentStatus: 'Paid', paymentId }
      );
    }

    // =============================================================
    // 🔥 SUBSCRIPTION ACTIVATION (Only if planId exists)
    // =============================================================
    if (planId && storeId) {
      let subscription = await Subscription.findOne({ storeId });
      if (subscription) {
        subscription.planId = planId;
        subscription.status = 'active';
        subscription.currentPeriodStart = new Date();
        subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        subscription.autoRenew = true;
        subscription.cancelledAt = null;
        await subscription.save();
        console.log(`✅ Subscription updated for store ${storeId} to plan ${planId}`);
      } else {
        subscription = new Subscription({
          storeId,
          planId,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          autoRenew: true,
        });
        await subscription.save();
        console.log(`✅ New subscription created for store ${storeId}`);
      }
      await Store.findByIdAndUpdate(storeId, {
        status: 'active',
        subscriptionId: subscription._id
      });
    }
    // =============================================================

    await ActivityLog.create({
      storeId: req.user?.storeId,
      userId: req.user?.id,
      userEmail: req.user?.email,
      action: 'PAYMENT_VERIFIED',
      details: { paymentId, orderId, type: planId ? 'subscription' : 'product' },
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and processed successfully',
    });
  } catch (err) {
    console.error('❌ Verify Payment Error:', err);
    next(err);
  }
};

export const paymentWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    switch (event) {
      case 'payment.captured':
        console.log('ℹ️ Webhook: payment.captured received (Ignored for now)');
        break;
      case 'payment.failed':
        console.log('ℹ️ Webhook: payment.failed received');
        break;
      case 'subscription.charged':
        console.log('ℹ️ Webhook: subscription.charged received');
        break;
      default:
        console.log(`ℹ️ Webhook: Unknown event ${event} received`);
        break;
    }

    await ActivityLog.create({
      action: 'PAYMENT_WEBHOOK',
      details: { event, receivedAt: new Date() },
    });

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ Webhook Error:', err);
    next(err);
  }
};

export const capturePaymentOrder = async (req, res, next) => {
  try {
    const { paymentId, amount } = req.body;
    const result = await capturePayment(paymentId, amount);
    res.status(200).json({
      success: true,
      message: 'Payment captured',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};