import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileBuffer, folder = 'drape', options = {}) => {
  const result = await cloudinary.uploader.upload(
    `data:image/jpeg;base64,${fileBuffer.toString('base64')}`,
    {
      folder,
      use_filename: true,
      unique_filename: true,
      ...options,
    }
  );
  return { url: result.secure_url, public_id: result.public_id, width: result.width, height: result.height };
};

export const uploadMultiple = async (files, folder = 'drape', options = {}) => {
  const results = [];
  for (const file of files) {
    const result = await uploadImage(file.buffer, folder, options);
    results.push(result);
  }
  return results;
};

export const deleteImage = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
    return true;
  } catch (err) {
    console.error('Cloudinary delete error:', err);
    return false;
  }
};

export const deleteImages = async (public_ids) => {
  const results = [];
  for (const id of public_ids) {
    results.push(await deleteImage(id));
  }
  return results;
};

export const updateImage = async (oldPublicId, newFileBuffer, folder = 'drape', options = {}) => {
  if (oldPublicId) await deleteImage(oldPublicId);
  return uploadImage(newFileBuffer, folder, options);
};

export const getOptimizedUrl = (public_id, options = {}) => {
  return cloudinary.url(public_id, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options,
  });
};

export const getThumbnailUrl = (public_id, width = 200, height = 200) => {
  return cloudinary.url(public_id, {
    fetch_format: 'auto',
    quality: 'auto',
    width,
    height,
    crop: 'fill',
  });
};
