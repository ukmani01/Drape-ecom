import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  type: { type: String, required: true },
  seq: { type: Number, default: 0 },
}, { timestamps: true });

counterSchema.index({ storeId: 1, type: 1 }, { unique: true });

export default mongoose.model('Counter', counterSchema);