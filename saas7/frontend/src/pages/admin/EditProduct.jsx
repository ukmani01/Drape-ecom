import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct, updateProduct } from '../../api/products';
import { getCategories } from '../../api/categories';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import toast from 'react-hot-toast';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        stock: '',
        sku: '',
        status: 'draft',
        categoryId: '',
        images: [],
    });

    // ✅ Fetch Product Data
    const { data: productData, isLoading: productLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProduct(id).then(res => res.data.data),
        enabled: !!id,
    });

    // ✅ Fetch Categories
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getCategories().then(res => res.data.data),
        staleTime: 5 * 60 * 1000,
    });

    const categories = categoriesData?.docs || [];

    // ✅ Fill form when product loads
    useEffect(() => {
        if (productData) {
            setForm({
                title: productData.title || '',
                description: productData.description || '',
                price: productData.variants?.[0]?.price || '',
                stock: productData.variants?.[0]?.stock || '',
                sku: productData.variants?.[0]?.sku || '',
                status: productData.status || 'draft',
                categoryId: productData.categoryId || '',
                images: productData.images || [],
            });
        }
    }, [productData]);

    const mutation = useMutation({
        mutationFn: (data) => updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-products']);
            queryClient.invalidateQueries(['product', id]);
            toast.success('Product updated successfully');
            navigate('/admin/products');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to update product');
        },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleImageUpload = (imageData) => {
        setForm({ ...form, images: [...form.images, imageData.url] });
    };

    const removeImage = (index) => {
        const updated = form.images.filter((_, i) => i !== index);
        setForm({ ...form, images: updated });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            toast.error('Product title is required');
            return;
        }

        const productData = {
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
            images: form.images,
            status: form.status,
        };

        mutation.mutate(productData);
    };

    if (productLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                    <p className="mt-2 text-secondary-500">Loading product...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-display font-bold mb-6">Edit Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                    <h2 className="font-display text-xl font-semibold mb-4">Basic Information</h2>

                    <Input
                        label="Product Title *"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Premium Cotton T-Shirt"
                        required
                    />

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

                    {/* ✅ Category Dropdown */}
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

                    <div className="mt-3">
                        <Input
                            label="SKU (Optional)"
                            name="sku"
                            value={form.sku}
                            onChange={handleChange}
                            placeholder="Leave empty for auto-generation"
                        />
                    </div>

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

                <div className="flex gap-4">
                    <Button type="submit" loading={mutation.isLoading}>
                        Update Product
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;