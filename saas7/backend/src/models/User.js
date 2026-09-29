import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', default: null },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['super_admin', 'owner', 'admin', 'staff', 'customer'], 
    default: 'customer' 
  },
  permissions: [{ type: String }],
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpiry: Date,
  resetToken: String,
  resetExpiry: Date,
  lastLogin: Date,
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now },
  }],
  preferences: {
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'INR' },
    notifications: { type: Boolean, default: true },
  },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetToken;
  delete obj.resetExpiry;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpiry;
  return obj;
};

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ storeId: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);