// backend/src/controllers/authController.js

import { registerClient, login, refreshToken, generateResetToken, resetPassword, changePassword, verifyEmail, sendVerificationEmail, logout } from '../services/authService.js';
import { logger } from '../utils/logger.js';
import { User, Store } from '../models/index.js'; // ✅ Added Store
import jwt from 'jsonwebtoken'; // ✅ Added jwt

// ✅ Improved Global Error Handler for Auth Controllers
const handleAuthError = (err, res) => {
  logger.error('Auth Controller Error:', err);

  // ✅ NEW: If error has a statusCode, use it
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || 'Something went wrong'
    });
  }

  // Fallback: Check specific error messages for backward compatibility
  if (err.message === 'Invalid credentials' || err.message === 'Invalid email or password') {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  
  if (err.message === 'User not found') {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (err.message === 'User already exists') {
    return res.status(409).json({ success: false, message: 'User already exists' });
  }

  if (err.message === 'Free plan not found') {
    return res.status(500).json({ success: false, message: 'System configuration error' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Default: Internal Server Error
  res.status(500).json({ success: false, message: 'Internal server error' });
};

// ============ Controllers ============

export const register = async (req, res) => {
  try {
    const { name, email, password, storeName, storeSlug } = req.body;
    const result = await registerClient(name, email, password, storeName, storeSlug);
    res.status(201).json({
      success: true,
      message: 'Account and store created successfully',
      data: result,
    });
  } catch (err) {
    handleAuthError(err, res);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const result = await login(email, password, ip, userAgent);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (err) {
    handleAuthError(err, res);
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new Error('Refresh token required');
    const result = await refreshToken(token);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    handleAuthError(err, res);
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetToken -resetExpiry');
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    handleAuthError(err, res);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await generateResetToken(email);
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (err) {
    handleAuthError(err, res);
  }
};

export const resetPasswordUser = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    await resetPassword(token, password);
    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (err) {
    handleAuthError(err, res);
  }
};

export const changePasswordUser = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await changePassword(req.user.id, oldPassword, newPassword);
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    handleAuthError(err, res);
  }
};

export const verifyUserEmail = async (req, res) => {
  try {
    const { token } = req.params;
    await verifyEmail(token);
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (err) {
    handleAuthError(err, res);
  }
};

export const sendVerification = async (req, res) => {
  try {
    await sendVerificationEmail(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (err) {
    handleAuthError(err, res);
  }
};

export const logoutUser = async (req, res) => {
  try {
    await logout(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    handleAuthError(err, res);
  }
};

// =============================================================
// ✅ NEW: CUSTOMER REGISTRATION (Public - No Token Required)
// =============================================================
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, storeSlug } = req.body;

    console.log('📝 [registerCustomer] Request:', { name, email, storeSlug });

    // 1. Validate required fields
    if (!name || !email || !password || !storeSlug) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and storeSlug are required',
      });
    }

    // 2. Find existing store by slug
    const store = await Store.findOne({ slug: storeSlug });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: `Store with slug "${storeSlug}" not found`,
      });
    }

    // 3. Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // 4. Create Customer User
    const user = new User({
      name,
      email,
      password,
      storeId: store._id,
      role: 'customer', // ✅ Customer Role
    });
    await user.save();

    // 5. Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, storeId: user.storeId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    // 6. Send Response
    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          storeId: user.storeId,
        },
        token,
        refreshToken,
        store: {
          _id: store._id,
          name: store.name,
          slug: store.slug,
        },
      },
    });
  } catch (err) {
    console.error('❌ [registerCustomer] Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
};