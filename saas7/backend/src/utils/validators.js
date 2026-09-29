import Joi from 'joi';

export const validateEmail = (email) => {
  const schema = Joi.string().email().required();
  return schema.validate(email);
};

export const validatePhone = (phone) => {
  const schema = Joi.string().pattern(/^[0-9]{10}$/);
  return schema.validate(phone);
};

export const validatePincode = (pincode) => {
  const schema = Joi.string().pattern(/^[0-9]{6}$/);
  return schema.validate(pincode);
};

export const validateUrl = (url) => {
  const schema = Joi.string().uri();
  return schema.validate(url);
};

export const validateObjectId = (id) => {
  const schema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);
  return schema.validate(id);
};

export const validateSlug = (slug) => {
  const schema = Joi.string().pattern(/^[a-z0-9-]+$/);
  return schema.validate(slug);
};

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim();
  }
  return input;
};

export default {
  validateEmail,
  validatePhone,
  validatePincode,
  validateUrl,
  validateObjectId,
  validateSlug,
  sanitizeInput,
};
