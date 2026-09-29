import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  image: { type: String, default: '' },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'hidden'], default: 'active' },
  seo: {
    title: String,
    description: String,
  },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

categorySchema.index({ storeId: 1, slug: 1 }, { unique: true });
categorySchema.index({ storeId: 1, parentId: 1 });
categorySchema.index({ storeId: 1, order: 1 });

export default mongoose.model('Category', categorySchema);