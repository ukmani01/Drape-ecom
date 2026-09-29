import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Store from '../models/Store.js';

dotenv.config();

// =============================================================
// 🔥 SECURITY LAYER: AES-256-GCM Encryption (Hack-Proof)
// =============================================================
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.ENCRYPTION_MASTER_KEY || 'fallback-key-change-me').digest();
const ALGORITHM = 'aes-256-gcm';

const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

const decrypt = (cipherText) => {
  if (!cipherText) return null;
  const [ivHex, authTagHex, encryptedText] = cipherText.split(':');
  if (!ivHex || !authTagHex || !encryptedText) return null;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
// =============================================================

// Platform Default Razorpay Instance (Super Admin / Subscription)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// =============================================================
// 🔥 Store-Specific Razorpay Instance (Multi-Tenant BYOK)
// =============================================================
const getStoreRazorpayInstance = async (storeId) => {
  const store = await Store.findById(storeId).select('razorpayKeyId razorpayKeySecret');
  if (!store) throw new Error('Store not found');

  if (store.razorpayKeyId && store.razorpayKeySecret) {
    try {
      const decryptedKeyId = decrypt(store.razorpayKeyId);
      const decryptedSecret = decrypt(store.razorpayKeySecret);
      if (!decryptedKeyId || !decryptedSecret) {
        throw new Error('Decryption failed. Keys might be corrupted.');
      }
      return new Razorpay({
        key_id: decryptedKeyId,
        key_secret: decryptedSecret,
      });
    } catch (error) {
      console.error('❌ Failed to decrypt store keys:', error.message);
      throw new Error('Invalid store payment configuration. Please reconfigure Razorpay keys.');
    }
  }
  throw new Error('Store owner has not configured a payment gateway. Please contact the store.');
};

// =============================================================
// 🔥 Signature Verification with Dynamic Secret
// =============================================================
export const verifyPaymentSignatureWithSecret = (orderId, paymentId, signature, secret) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');
  return expectedSignature === signature;
};

// =============================================================
// 📌 EXISTING FUNCTIONS (Subscription - Platform Keys)
// =============================================================
export const createOrder = async (amount, currency = 'INR', receipt = null, notes = {}) => {
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt: receipt || `ord_${Date.now()}`,
    notes,
  });
};

export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  return expectedSignature === signature;
};

export const verifyWebhookSignature = (body, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

export const capturePayment = async (paymentId, amount, currency = 'INR') => {
  return razorpay.payments.capture(paymentId, Math.round(amount * 100), currency);
};

export const getPaymentDetails = async (paymentId) => {
  return razorpay.payments.fetch(paymentId);
};

export const refundPayment = async (paymentId, amount = null, notes = {}) => {
  const data = { notes };
  if (amount) data.amount = Math.round(amount * 100);
  return razorpay.payments.refund(paymentId, data);
};

export const createSubscriptionPlan = async (name, amount, currency = 'INR', interval = 'monthly') => {
  return razorpay.plans.create({
    period: interval,
    interval: 1,
    item: { name, amount: Math.round(amount * 100), currency },
  });
};

export const createSubscription = async (planId, customerEmail, customerContact) => {
  return razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: 12,
    notes: { email: customerEmail, contact: customerContact },
  });
};

export const cancelSubscription = async (subscriptionId) => {
  return razorpay.subscriptions.cancel(subscriptionId);
};

// =============================================================
// 📌 DEFAULT EXPORT (for backward compatibility)
// =============================================================
export default {
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  capturePayment,
  getPaymentDetails,
  refundPayment,
  createSubscriptionPlan,
  createSubscription,
  cancelSubscription,
  encrypt,
  decrypt,
  getStoreRazorpayInstance,
  verifyPaymentSignatureWithSecret,
};

// =============================================================
// ✅ NAMED EXPORTS (for direct import in storeController)
// =============================================================
export { encrypt, decrypt, getStoreRazorpayInstance };
// verifyPaymentSignatureWithSecret is already exported above using 'export const'