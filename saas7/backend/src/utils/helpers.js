export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const formatCurrency = (amount, currency = 'INR', locale = 'en-IN') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getPagination = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  return { skip, limit: limitNum, page: pageNum };
};

export const generateOrderId = (storeId, counter) => {
  const storePart = String(storeId).slice(-4);
  const counterPart = String(counter).padStart(4, '0');
  return `ORD-${storePart}-${counterPart}`;
};

export const calculateDiscount = (price, discountPercent) => {
  return price - (price * discountPercent) / 100;
};

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone) => {
  return /^[0-9]{10}$/.test(phone);
};

export const sanitizeHtml = (html) => {
  // Simple sanitization – for production use a library like xss
  return html.replace(/<script.*?>.*?<\/script>/gi, '');
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
  generateSlug,
  formatCurrency,
  getPagination,
  generateOrderId,
  calculateDiscount,
  isValidEmail,
  isValidPhone,
  sanitizeHtml,
  truncateText,
  sleep,
};
