import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.EMAIL_FROM || 'noreply@drape.com';

export const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  return resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
    reply_to: replyTo,
  });
};

export const sendWelcomeEmail = async (email, name, storeName) => {
  const html = `
    <h1>Welcome ${name}!</h1>
    <p>Your store <strong>${storeName}</strong> has been created successfully.</p>
    <p>You can now log in to your admin panel and start customizing your store.</p>
    <a href="${process.env.FRONTEND_URL}/login">Login to Dashboard</a>
    <p>Thank you for choosing Drape!</p>
  `;
  return sendEmail({ to: email, subject: 'Welcome to Drape – Your Store is Ready', html });
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const html = `
    <h1>Reset Your Password</h1>
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>This link expires in 30 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  return sendEmail({ to: email, subject: 'Reset Your Password – Drape', html });
};

export const sendEmailVerification = async (email, token) => {
  const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const html = `
    <h1>Verify Your Email</h1>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="${verifyLink}">Verify Email</a>
    <p>This link expires in 7 days.</p>
  `;
  return sendEmail({ to: email, subject: 'Verify Your Email – Drape', html });
};

export const sendOrderConfirmation = async (email, orderId, items, total) => {
  const html = `
    <h1>Order Confirmed!</h1>
    <p>Your order <strong>#${orderId}</strong> has been placed successfully.</p>
    <p>Total: ₹${total}</p>
    <p>We'll notify you when your order ships.</p>
  `;
  return sendEmail({ to: email, subject: `Order #${orderId} Confirmed`, html });
};

export const sendOrderShipped = async (email, orderId, trackingNumber) => {
  const html = `
    <h1>Order Shipped!</h1>
    <p>Your order <strong>#${orderId}</strong> has been shipped.</p>
    <p>Tracking Number: ${trackingNumber}</p>
    <p>You can track your order in your account dashboard.</p>
  `;
  return sendEmail({ to: email, subject: `Order #${orderId} Shipped`, html });
};

export const sendSubscriptionReminder = async (email, storeName, expiryDate) => {
  const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  const html = `
    <h1>Subscription Reminder</h1>
    <p>Your store <strong>${storeName}</strong> subscription expires in <strong>${daysLeft} days</strong>.</p>
    <p>Please renew your subscription to avoid any disruption.</p>
    <a href="${process.env.FRONTEND_URL}/admin/subscription">Renew Now</a>
  `;
  return sendEmail({ to: email, subject: `Subscription Expires in ${daysLeft} Days`, html });
};

export const sendBroadcastMessage = async (emails, subject, message) => {
  const html = `
    <h1>Broadcast Message</h1>
    <p>${message}</p>
  `;
  return sendEmail({ to: emails, subject, html });
};

export const sendSupportReply = async (email, message) => {
  const html = `
    <h1>Support Team</h1>
    <p>${message}</p>
  `;
  return sendEmail({ to: email, subject: 'Support Reply – Drape', html });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendOrderConfirmation,
  sendOrderShipped,
  sendSubscriptionReminder,
  sendBroadcastMessage,
  sendSupportReply,
};
