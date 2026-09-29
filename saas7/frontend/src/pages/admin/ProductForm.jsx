import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct, createProduct, updateProduct } from '../../api/products';
import { getCategories } from '../../api/categories';
import { uploadSingle } from '../../api/upload';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    status: 'draft',
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    images: [],
    variants: [
      {
        size: '',
        color: '',
        sku: '',
        price: 0,
        compareAtPrice: 0,
        costPerItem: 0,
        stock: 0,
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
      },
    ],
    meta: {}, // Custom attributes
    tags: [],
    seo: { title: '', description: '', keywords: '' },
  });

  // Meta fields state (dynamic)
  const [metaFields, setMetaFields] = useState([{ key: '', value: '' }]);

  // Fetch product if editing
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id).then(res => res.data.data),
    enabled: isEditing,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories().then(res => res.data.data),
  });

  useEffect(() => {
    if (productData) {
      setForm({
        title: productData.title || '',
        description: productData.description || '',
        shortDescription: productData.shortDescription || '',
        categoryId: productData.categoryId || '',
        status: productData.status || 'draft',
        isFeatured: productData.isFeatured || false,
        isBestSeller: productData.isBestSeller || false,
        isNew: productData.isNew !== undefined ? productData.isNew : true,
        images: productData.images || [],
        variants: productData.variants || [{ size: '', color: '', sku: '', price: 0, compareAtPrice: 0, costPerItem: 0, stock: 0, weight: 0, dimensions: { length: 0, width: 0, height: 0 } }],
        meta: productData.meta || {},
        tags: productData.tags || [],
        seo: productData.seo || { title: '', description: '', keywords: '' },
      });

      // Convert meta object to array for UI
      if (productData.meta && Object.keys(productData.meta).length > 0) {
        const fields = Object.entries(productData.meta).map(([key, value]) => ({ key, value }));
        setMetaFields(fields);
      }
    }
  }, [productData]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data };
      if (isEditing) {
        return updateProduct(id, payload);
      }
      return createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast.success(isEditing ? 'Product updated' : 'Product created');
      navigate('/admin/products');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save product');
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...form.variants];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, variants: updated }));
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { size: '', color: '', sku: '', price: 0, compareAtPrice: 0, costPerItem: 0, stock: 0, weight: 0, dimensions: { length: 0, width: 0, height: 0 } },
      ],
    }));
  };

  const removeVariant = (index) => {
    if (form.variants.length <= 1) return;
    const updated = form.variants.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, variants: updated }));
  };

  const handleMetaChange = (index, field, value) => {
    const updated = [...metaFields];
    updated[index] = { ...updated[index], [field]: value };
    setMetaFields(updated);
  };

  const addMetaField = () => {
    setMetaFields([...metaFields, { key: '', value: '' }]);
  };

  const removeMetaField = (index) => {
    if (metaFields.length <= 1) return;
    const updated = metaFields.filter((_, i) => i !== index);
    setMetaFields(updated);
  };

  const handleImageUpload = (imageData) => {
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, imageData.url],
    }));
  };

  const removeImage = (index) => {
    const updated = form.images.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, images: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Build meta object from fields
    const meta = {};
    metaFields.forEach((field) => {
      if (field.key.trim()) {
        meta[field.key.trim()] = field.value;
      }
    });

    const payload = {
      ...form,
      meta,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    mutation.mutate(payload);
  };

  if (productLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-display font-bold mb-6">
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Basic Information</h2>
          <Input
            label="Product Title *"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <div className="mt-3">
            <label className="label-luxury">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="5"
              className="input-luxury"
            />
          </div>
          <div className="mt-3">
            <label className="label-luxury">Short Description</label>
            <textarea
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              rows="2"
              className="input-luxury"
            />
          </div>
          <div className="mt-3">
            <label className="label-luxury">Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="input-luxury"
            >
              <option value="">Select Category</option>
              {categories?.docs?.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isBestSeller" checked={form.isBestSeller} onChange={handleChange} />
              Best Seller
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isNew" checked={form.isNew} onChange={handleChange} />
              New Arrival
            </label>
          </div>
          <div className="mt-3">
            <label className="label-luxury">Tags (comma separated)</label>
            <input
              name="tags"
              value={form.tags.join(', ')}
              onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map(t => t.trim()) })}
              className="input-luxury"
              placeholder="e.g. cotton, summer, sale"
            />
          </div>
          <div className="mt-3">
            <label className="label-luxury">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-luxury">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </Card>

        {/* Images */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Images</h2>
          <ImageUpload
            onUpload={handleImageUpload}
            folder="products"
            existingImage=""
          />
          <div className="flex flex-wrap gap-3 mt-4">
            {form.images.map((url, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                <img src={url} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Variants */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-xl font-semibold">Variants</h2>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <FiPlus className="mr-1" /> Add Variant
            </Button>
          </div>
          {form.variants.map((variant, idx) => (
            <div key={idx} className="border border-secondary-200 rounded-lg p-4 mb-4 relative">
              {form.variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <FiTrash2 />
                </button>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input
                  label="Size"
                  value={variant.size}
                  onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                />
                <Input
                  label="Color"
                  value={variant.color}
                  onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                />
                <Input
                  label="SKU"
                  value={variant.sku}
                  onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                />
                <Input
                  label="Price *"
                  type="number"
                  value={variant.price}
                  onChange={(e) => handleVariantChange(idx, 'price', parseFloat(e.target.value) || 0)}
                  required
                />
                <Input
                  label="Compare Price"
                  type="number"
                  value={variant.compareAtPrice}
                  onChange={(e) => handleVariantChange(idx, 'compareAtPrice', parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Cost"
                  type="number"
                  value={variant.costPerItem}
                  onChange={(e) => handleVariantChange(idx, 'costPerItem', parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Stock"
                  type="number"
                  value={variant.stock}
                  onChange={(e) => handleVariantChange(idx, 'stock', parseInt(e.target.value) || 0)}
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={variant.weight}
                  onChange={(e) => handleVariantChange(idx, 'weight', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          ))}
        </Card>

        {/* Custom Attributes (Meta) */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-xl font-semibold">Custom Attributes</h2>
            <Button type="button" variant="outline" size="sm" onClick={addMetaField}>
              <FiPlus className="mr-1" /> Add Field
            </Button>
          </div>
          <p className="text-sm text-secondary-500 mb-4">
            Add custom details like Fabric, Length, Occasion, etc.
          </p>
          {metaFields.map((field, idx) => (
            <div key={idx} className="flex gap-3 mb-3 items-center">
              <input
                placeholder="Label (e.g. Fabric)"
                value={field.key}
                onChange={(e) => handleMetaChange(idx, 'key', e.target.value)}
                className="input-luxury flex-1"
              />
              <input
                placeholder="Value (e.g. Cotton)"
                value={field.value}
                onChange={(e) => handleMetaChange(idx, 'value', e.target.value)}
                className="input-luxury flex-1"
              />
              {metaFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMetaField(idx)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          ))}
        </Card>

        {/* SEO */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4">SEO</h2>
          <Input
            label="Meta Title"
            name="seo.title"
            value={form.seo.title}
            onChange={(e) => setForm({ ...form, seo: { ...form.seo, title: e.target.value } })}
          />
          <div className="mt-3">
            <label className="label-luxury">Meta Description</label>
            <textarea
              value={form.seo.description}
              onChange={(e) => setForm({ ...form, seo: { ...form.seo, description: e.target.value } })}
              rows="2"
              className="input-luxury"
            />
          </div>
          <Input
            label="Meta Keywords"
            value={form.seo.keywords}
            onChange={(e) => setForm({ ...form, seo: { ...form.seo, keywords: e.target.value } })}
          />
        </Card>

        <div className="flex gap-4">
          <Button type="submit" loading={mutation.isLoading}>
            {isEditing ? 'Update Product' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;