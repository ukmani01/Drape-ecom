import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, deleteProduct, bulkDeleteProducts, updateProduct } from '../../api/products';
import { getCategories } from '../../api/categories';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi';
// 🔥 NEW: Import useAuth to get feature limits
import { useAuth } from '../../contexts/AuthContext';

const AdminProducts = () => {
  const [selected, setSelected] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  // 🔥 NEW: Get maxProducts limit from subscription
  const { getFeatureLimit } = useAuth();
  const maxProducts = getFeatureLimit('maxProducts'); // Returns number or -1 (unlimited)

  // ✅ Fetch Products with Filters
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-products', categoryFilter, statusFilter],
    queryFn: () => {
      const params = { limit: 100 };
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      return getProducts(params).then(res => res.data.data);
    },
  });

  // ✅ Fetch Categories for Filter Dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories().then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const categories = categoriesData?.docs || [];
  const products = data?.docs || [];
  const productCount = products.length;

  // 🔥 NEW: Check if user reached the product limit
  const isLimitReached = maxProducts !== -1 && productCount >= maxProducts;

  // ... (deleteMutation, bulkDeleteMutation, updateMutation remain the same)

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast.success('Product deleted');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteProducts,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      setSelected([]);
      toast.success('Products deleted');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast.success('Product updated');
    },
  });

  // ✅ Clear Filters
  const clearFilters = () => {
    setCategoryFilter('');
    setStatusFilter('');
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-display font-bold">Products</h1>

        {/* ============================================================= */}
        {/* 🔥 SMART FIX: "Add Product" Button - Limit-ஐ Check பண்ணு */}
        {/* ============================================================= */}
        <div className="flex items-center gap-3">
          {isLimitReached ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm">
              <span>🔒 Product limit reached ({maxProducts})</span>
              <Link
                to="/admin/subscription"
                className="text-amber-600 hover:text-amber-800 font-medium underline"
              >
                Upgrade
              </Link>
            </div>
          ) : (
            <Link to="/admin/products/new" className="btn-primary">
              Add Product {maxProducts !== -1 && `(${productCount}/${maxProducts})`}
            </Link>
          )}
        </div>
        {/* ============================================================= */}
      </div>

      {/* Filters Section */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FiFilter className="text-secondary-400" />
            <span className="text-sm font-medium text-secondary-600">Filters:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-luxury py-2 px-3 text-sm w-48"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-luxury py-2 px-3 text-sm w-40"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear
          </Button>

          {selected.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (window.confirm(`Delete ${selected.length} products?`)) {
                  bulkDeleteMutation.mutate(selected);
                }
              }}
              loading={bulkDeleteMutation.isLoading}
            >
              Delete Selected ({selected.length})
            </Button>
          )}
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected(products.map((p) => p._id));
                      } else {
                        setSelected([]);
                      }
                    }}
                    checked={selected.length === products.length && products.length > 0}
                  />
                </th>
                <th className="p-3">Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-secondary-500">
                    No products found. Create your first product!
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const category = categories.find((c) => c._id === product.categoryId);
                  return (
                    <tr key={product._id} className="border-b hover:bg-secondary-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(product._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelected([...selected, product._id]);
                            } else {
                              setSelected(selected.filter((id) => id !== product._id));
                            }
                          }}
                        />
                      </td>
                      <td className="p-3">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center text-secondary-400 text-xs">
                            No img
                          </div>
                        )}
                      </td>
                      <td className="font-medium">{product.title}</td>
                      <td>
                        <span className="text-sm text-secondary-600">
                          {category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td>₹{product.variants[0]?.price || 0}</td>
                      <td>{product.variants[0]?.stock || 0}</td>
                      <td>
                        <span className={`badge ${product.status === 'published' ? 'badge-success' :
                          product.status === 'draft' ? 'badge-warning' :
                            'badge-danger'
                          }`}>
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/products/${product._id}`}
                            className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${product.title}"?`)) {
                                deleteMutation.mutate(product._id);
                              }
                            }}
                            className="p-2 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminProducts;