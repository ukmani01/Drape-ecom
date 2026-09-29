import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  storeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Store', 
    required: true 
  },
  orderId: { 
    type: String, 
    required: false,   // ✅ CHANGE THIS ONE LINE
    unique: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: false
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    variant: String,
    sku: String,
    quantity: { type: Number, min: 1 },
    price: Number,
    compareAtPrice: Number,
    image: String,
    total: Number,
  }],
  subtotal: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  discount: { 
    type: Number, 
    default: 0 
  },
  couponCode: String,
  couponDiscount: { 
    type: Number, 
    default: 0 
  },
  shippingFee: { 
    type: Number, 
    default: 0 
  },
  tax: { 
    type: Number, 
    default: 0 
  },
  total: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  shippingAddress: {
    name: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    phone: { type: String, required: true },
  },
  billingAddress: {
    name: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    phone: String,
  },
  paymentMethod: { 
    type: String, 
    enum: ['COD', 'Razorpay', 'Stripe', 'PayPal'], 
    default: 'COD' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'], 
    default: 'Pending' 
  },
  paymentId: String,
  paymentDetails: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  orderStatus: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled', 'Returned'], 
    default: 'Pending' 
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  trackingNumber: String,
  trackingProvider: String,
  trackingUrl: String,
  notes: String,
  meta: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
}, { timestamps: true });

// ✅ This will now work because orderId is NOT required
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    try {
      const Counter = mongoose.model('Counter');
      const counter = await Counter.findOneAndUpdate(
        { storeId: this.storeId, type: 'order' },
        { $inc: { seq: 1 } },
        { upsert: true, new: true }
      );
      this.orderId = `ORD-${String(this.storeId).slice(-4)}-${String(counter.seq).padStart(4, '0')}`;
    } catch (err) {
      // ✅ Fallback – always works
      this.orderId = `ORD-${Date.now().toString().slice(-8)}`;
    }
  }
  next();
});

// ✅ Indexes
orderSchema.index({ storeId: 1, orderId: 1 }, { unique: true });
orderSchema.index({ storeId: 1, customerId: 1 });
orderSchema.index({ storeId: 1, orderStatus: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, paymentStatus: 1 });

export default mongoose.model('Order', orderSchema);