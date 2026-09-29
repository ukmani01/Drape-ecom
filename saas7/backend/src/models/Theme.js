import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  previewImage: { type: String, default: '' },
  variables: { type: mongoose.Schema.Types.Mixed, default: {} },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

themeSchema.index({ id: 1 }, { unique: true });
themeSchema.index({ isActive: 1 });

export default mongoose.model('Theme', themeSchema);
