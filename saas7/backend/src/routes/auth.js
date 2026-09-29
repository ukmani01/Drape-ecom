// backend/src/routes/auth.js

import express from 'express';
import {
  register,
  loginUser,
  refresh,
  getMe,
  forgotPassword,
  resetPasswordUser,
  changePasswordUser,
  verifyUserEmail,
  sendVerification,
  logoutUser,
  registerCustomer, // ✅ NEW: Customer Registration Controller
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../middleware/validate.js';

const router = express.Router();

// =============================================================
// ✅ PUBLIC ROUTES – No Authentication Required
// =============================================================

// 🔹 Store Owner Registration (Existing)
router.post('/register', validate(registerSchema), register);

// 🔹 Customer Registration (NEW – Public)
router.post('/register-customer', registerCustomer);

// 🔹 Login & Authentication (Existing)
router.post('/login', validate(loginSchema), loginUser);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPasswordUser);

// 🔹 Email Verification (Existing)
router.get('/verify-email/:token', verifyUserEmail);

// =============================================================
// ✅ PROTECTED ROUTES – JWT Token Required (Existing)
// =============================================================

router.use(protect); // ⚠️ All routes below this line require a valid JWT token

// 🔹 User Profile & Management (Existing)
router.get('/me', getMe);
router.post('/change-password', changePasswordUser);
router.post('/send-verification', sendVerification);
router.post('/logout', logoutUser);

export default router;