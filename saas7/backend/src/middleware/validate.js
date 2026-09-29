import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }
    next();
  };
};

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  storeName: Joi.string().min(2).max(100).required(),
  storeSlug: Joi.string().min(2).max(50).pattern(/^[a-z0-9-]+$/).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const productSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow(''),
  categoryId: Joi.string(),
  price: Joi.number().min(0).required(),
  compareAtPrice: Joi.number().min(0),
  stock: Joi.number().min(0).default(0),
  status: Joi.string().valid('draft', 'published', 'archived'),
  isFeatured: Joi.boolean(),
  tags: Joi.array().items(Joi.string()),
});

// ✅ UPDATED orderSchema
export const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      sku: Joi.string().allow(''),
    })
  ).min(1).required(),
  shippingAddress: Joi.object({
    name: Joi.string().required(),
    line1: Joi.string().required(),
    line2: Joi.string().allow('').optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
    country: Joi.string().default('India'),
    phone: Joi.string().required(),
  }).required(),
  billingAddress: Joi.object({
    name: Joi.string().optional(),
    line1: Joi.string().optional(),
    line2: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    pincode: Joi.string().optional(),
    country: Joi.string().optional(),
    phone: Joi.string().optional(),
  }).optional(),
  paymentMethod: Joi.string().valid('COD', 'Razorpay', 'Stripe').default('COD'),
  customerId: Joi.string().optional(),
  notes: Joi.string().optional().allow(''),
});

export const settingsSchema = Joi.object({
  brand: Joi.object({
    name: Joi.string(),
    logo: Joi.string(),
    tagline: Joi.string(),
  }),
  hero: Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    buttonText: Joi.string(),
    buttonLink: Joi.string(),
    image: Joi.string(),
  }),
});

export default {
  validate,
  registerSchema,
  loginSchema,
  productSchema,
  orderSchema,
  settingsSchema,
};