import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, Store, Subscription, Plan, ActivityLog } from '../models/index.js';
import storeRepository from '../repositories/storeRepository.js';
import { sendWelcomeEmail, sendPasswordResetEmail, sendEmailVerification } from './emailService.js';
import { logger } from '../utils/logger.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, storeId: user.storeId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d' }
  );
};

export const registerClient = async (name, email, password, storeName, storeSlug) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('User already exists');
    err.statusCode = 409;
    throw err;
  }

  const user = new User({
    name,
    email,
    password,
    storeId: null,
    role: 'owner',
  });
  await user.save();

  const store = await storeRepository.create({
    name: storeName,
    slug: storeSlug,
    ownerId: user._id,
    status: 'trial',
  });

  user.storeId = store._id;
  await user.save();

  const freePlan = await Plan.findOne({ code: 'free' });
  if (!freePlan) {
    const err = new Error('Free plan not found');
    err.statusCode = 500;
    throw err;
  }

  const subscription = new Subscription({
    storeId: store._id,
    planId: freePlan._id,
    status: 'trial',
    trialStart: new Date(),
    trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    autoRenew: false,
  });
  await subscription.save();

  store.subscriptionId = subscription._id;
  await store.save();

  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  await ActivityLog.create({
    storeId: store._id,
    userId: user._id,
    userEmail: user.email,
    action: 'STORE_CREATED',
    details: { storeName, storeSlug },
  });

  // Non-blocking welcome email
  sendWelcomeEmail(email, name, storeName).catch(err => {
    logger.error('❌ Failed to send welcome email:', err);
  });

  return { user, store, subscription, token, refreshToken };
};

export const login = async (email, password, ip, userAgent) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401; // ✅ 401 Unauthorized
    throw err;
  }
  if (user.status === 'suspended') {
    const err = new Error('Account suspended');
    err.statusCode = 403; // ✅ 403 Forbidden
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401; // ✅ 401 Unauthorized
    throw err;
  }

  // ✅ Check store status for non‑super_admin users
  if (user.role !== 'super_admin' && user.storeId) {
    const store = await Store.findById(user.storeId);
    if (!store) {
      const err = new Error('Your store no longer exists. Please contact support.');
      err.statusCode = 403;
      throw err;
    }
    const blockedStatuses = ['suspended', 'expired', 'deleted', 'inactive', 'blocked'];
    if (blockedStatuses.includes(store.status)) {
      const err = new Error(`Your store is ${store.status}. Please contact support.`);
      err.statusCode = 403;
      throw err;
    }
  }

  user.lastLogin = new Date();
  user.loginHistory = user.loginHistory || [];
  user.loginHistory.push({ ip, userAgent, timestamp: new Date() });
  if (user.loginHistory.length > 50) user.loginHistory = user.loginHistory.slice(-50);
  await user.save();

  await ActivityLog.create({
    storeId: user.storeId,
    userId: user._id,
    userEmail: user.email,
    action: 'LOGIN',
    details: { ip, userAgent },
  });

  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, token, refreshToken };
};

export const refreshToken = async (refreshTokenValue) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshTokenValue, process.env.JWT_REFRESH_SECRET);
  } catch (jwtErr) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 401;
    throw err;
  }

  if (user.status === 'suspended') {
    const err = new Error('Account suspended');
    err.statusCode = 403;
    throw err;
  }

  // ✅ Check store status for non‑super_admin users
  if (user.role !== 'super_admin' && user.storeId) {
    const store = await Store.findById(user.storeId);
    if (!store) {
      const err = new Error('Store not found');
      err.statusCode = 403;
      throw err;
    }
    const blockedStatuses = ['suspended', 'expired', 'deleted', 'inactive', 'blocked'];
    if (blockedStatuses.includes(store.status)) {
      const err = new Error(`Store is ${store.status}`);
      err.statusCode = 403;
      throw err;
    }
  }

  const token = generateToken(user);
  return { token };
};

export const generateResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetExpiry = Date.now() + 30 * 60 * 1000;
  await user.save();
  await sendPasswordResetEmail(email, token);
  return token;
};

export const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({ resetToken: token, resetExpiry: { $gt: Date.now() } });
  if (!user) {
    const err = new Error('Invalid or expired token');
    err.statusCode = 400;
    throw err;
  }
  user.password = newPassword;
  user.resetToken = undefined;
  user.resetExpiry = undefined;
  await user.save();

  await ActivityLog.create({
    storeId: user.storeId,
    userId: user._id,
    userEmail: user.email,
    action: 'PASSWORD_RESET',
  });

  return user;
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    const err = new Error('Old password is incorrect');
    err.statusCode = 400;
    throw err;
  }
  user.password = newPassword;
  await user.save();

  await ActivityLog.create({
    storeId: user.storeId,
    userId: user._id,
    userEmail: user.email,
    action: 'PASSWORD_CHANGED',
  });

  return user;
};

export const verifyEmail = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpiry: { $gt: Date.now() },
  });
  if (!user) {
    const err = new Error('Invalid or expired token');
    err.statusCode = 400;
    throw err;
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();
  return user;
};

export const sendVerificationEmail = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  const token = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = token;
  user.emailVerificationExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
  await user.save();
  await sendEmailVerification(user.email, token);
  return token;
};

export const logout = async (userId) => {
  await ActivityLog.create({
    userId,
    action: 'LOGOUT',
  });
  return true;
};