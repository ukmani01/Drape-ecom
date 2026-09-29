export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
};

export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export const generateSlug = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

export const getDiscount = (price, comparePrice) => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

export const getStarRating = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return { full, half, empty };
};

// export const formatCurrency = (amount) => {
//   return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
// };