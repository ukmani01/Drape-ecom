import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct } from '../../api/products';
import { getCategories } from '../../api/categories';
import { uploadProductImage } from '../../api/upload';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';
import { FiPlus, FiX } from 'react-icons/fi';

const NewProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    status: 'published',
    categoryId: '',
    images: [],
  });
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch Categories for Dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories().then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const categories = categoriesData?.docs || [];

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast.success('Product created successfully!');
      navigate('/admin/products');
    },
    onError: (err) => {
      console.error('Create error:', err);
      toast.error(err.response?.data?.message || 'Failed to create product');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadProductImage(file);
      const imageUrl = response.data?.data?.url || response.data?.url;
      if (imageUrl) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, imageUrl],
        }));
        toast.success('Image uploaded');
      } else {
        throw new Error('No URL in response');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validate
    if (!form.title.trim()) {
      toast.error('Product title is required');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || '',
      categoryId: form.categoryId || null,
      variants: [
        {
          price: parseFloat(form.price) || 0,
          stock: parseInt(form.stock) || 0,
          sku: form.sku || '',
        },
      ],
      status: form.status,
      images: form.images,
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-display font-bold mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Basic Information</h2>

          {/* Product Title */}
          <Input
            label="Product Title *"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Premium Cotton T-Shirt"
            required
          />

          {/* Description */}
          <div className="mt-3">
            <label className="label-luxury">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="input-luxury"
              placeholder="Product description..."
            />
          </div>

          {/* ✅ CATEGORY DROPDOWN */}
          <div className="mt-3">
            <label className="label-luxury">Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="input-luxury"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-secondary-500 mt-1">
              Select a category to group this product
            </p>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4 mt-3">
            <Input
              label="Price (₹)"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="0"
            />
            <Input
              label="Stock"
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          {/* SKU */}
          <div className="mt-3">
            <Input
              label="SKU (Optional)"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="Leave empty for auto-generation"
            />
            <p className="text-xs text-secondary-500 mt-1">
              SKU is optional. Leave empty to auto-generate.
            </p>
          </div>

          {/* Status */}
          <div className="mt-3">
            <label className="label-luxury">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="input-luxury"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </Card>

        {/* Product Images */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Product Images</h2>

          <div className="flex flex-wrap gap-3">
            {form.images.map((url, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-secondary-200">
                <img src={url} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                >
                  <FiX className="h-3 w-3" />
                </button>
              </div>
            ))}

            {!uploading && (
              <label className="w-24 h-24 border-2 border-dashed border-secondary-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <FiPlus className="h-6 w-6 text-secondary-400" />
                <span className="text-xs text-secondary-400 mt-1">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
            {uploading && (
              <div className="w-24 h-24 border-2 border-dashed border-secondary-300 rounded-lg flex items-center justify-center">
                <span className="text-sm text-secondary-400">Uploading...</span>
              </div>
            )}
          </div>
          <p className="text-xs text-secondary-500 mt-3">Upload product images (JPG, PNG, WEBP)</p>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" loading={createMutation.isLoading}>
            Create Product
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewProduct;