import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import ImageUpload from '../../components/ui/ImageUpload';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    order: 0,
    status: 'active',
  });

  // ✅ Fetch Categories
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories().then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Create Category
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category created successfully');
      resetForm();
      setIsFormOpen(false);
    },
    onError: (err) => {
      console.error('Create error:', err);
      toast.error(err.response?.data?.message || 'Failed to create category');
    },
  });

  // ✅ Update Category
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category updated successfully');
      resetForm();
      setEditing(null);
      setIsFormOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update category');
    },
  });

  // ✅ Delete Category
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    },
  });

  // ✅ Reset Form
  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      image: '',
      order: 0,
      status: 'active',
    });
  };

  // ✅ Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || '',
      image: form.image || '',
      order: Number(form.order) || 0,
      status: form.status || 'active',
    };

    if (editing) {
      updateMutation.mutate({ id: editing._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // ✅ Handle Edit
  const handleEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      order: category.order || 0,
      status: category.status || 'active',
    });
    setIsFormOpen(true);
  };

  // ✅ Handle Delete
  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}" category?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleImageUpload = (imageData) => {
    setForm({ ...form, image: imageData.url });
  };

  const categories = data?.docs || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-2 text-secondary-500">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-secondary-900">Categories</h1>
          <p className="text-secondary-500 text-sm mt-1">Manage your product categories</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditing(null);
            setIsFormOpen(!isFormOpen);
          }}
          className="flex items-center gap-2"
        >
          <FiPlus className="h-4 w-4" />
          {isFormOpen ? 'Close Form' : 'Add Category'}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Card className="p-6 mb-8 border-2 border-primary-100">
          <h2 className="font-display text-xl font-semibold mb-4 text-secondary-900">
            {editing ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Category Name *"
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Women's Wear"
                required
              />
              <div>
                <label className="label-luxury">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="input-luxury"
                >
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>

            <Input
              label="Description (2 lines)"
              name="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description about this category..."
            />

            <div>
              <label className="label-luxury">Category Image (Background)</label>
              <ImageUpload
                onUpload={handleImageUpload}
                folder="categories"
                existingImage={form.image}
              />
              <p className="text-xs text-secondary-500 mt-1">
                Recommended: 1200x900px. This will be the background image on Home Page.
              </p>
            </div>

            <Input
              label="Order"
              name="order"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={createMutation.isLoading || updateMutation.isLoading}>
                {editing ? 'Update Category' : 'Create Category'}
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setEditing(null);
                    setIsFormOpen(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      {/* Category List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary-50">
              <tr className="border-b border-secondary-200">
                <th className="p-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider">Image</th>
                <th className="p-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider">Name</th>
                <th className="p-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider">Description</th>
                <th className="p-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider">Order</th>
                <th className="p-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider">Status</th>
                <th className="p-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-secondary-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📂</span>
                      <p>No categories yet</p>
                      <p className="text-sm">Click "Add Category" to create your first category</p>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="border-b hover:bg-secondary-50 transition-colors">
                    <td className="p-3">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center text-secondary-400">
                          <span className="text-xs">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="font-medium text-secondary-900">{cat.name}</td>
                    <td className="text-sm text-secondary-600 max-w-xs truncate">
                      {cat.description || '-'}
                    </td>
                    <td>{cat.order}</td>
                    <td>
                      <span className={`badge ${cat.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {cat.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id, cat.name)}
                          className="p-2 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminCategories;