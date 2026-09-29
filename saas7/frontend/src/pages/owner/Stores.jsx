import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStores, suspendStore, activateStore, deleteStore } from '../../api/stores';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const OwnerStores = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['owner-stores', page],
    queryFn: () => getStores({ page, limit: 10 }).then(res => res.data.data),
  });
  const queryClient = useQueryClient();

  const suspendMutation = useMutation({
    mutationFn: suspendStore,
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-stores']);
      toast.success('Store suspended');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to suspend'),
  });

  const activateMutation = useMutation({
    mutationFn: activateStore,
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-stores']);
      toast.success('Store activated');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to activate'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStore,
    onSuccess: () => {
      queryClient.invalidateQueries(['owner-stores']);
      toast.success('Store deleted');
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete'),
  });

  if (isLoading) return <div>Loading stores...</div>;

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Stores</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.docs.map(store => (
                <tr key={store._id} className="border-b hover:bg-secondary-50">
                  <td className="p-3">
                    <Link to={`/owner/stores/${store._id}`} className="text-primary-500 hover:underline">
                      {store.name}
                    </Link>
                  </td>
                  <td>{store.slug}</td>
                  <td>
                    <span className={`badge ${store.status === 'active' ? 'badge-success' :
                        store.status === 'suspended' ? 'badge-danger' :
                          store.status === 'expired' ? 'badge-warning' :
                            'badge-secondary'
                      }`}>
                      {store.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap justify-center gap-1">
                      {/* View Details */}
                      <Link to={`/owner/stores/${store._id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>

                      {/* Suspend: show if status is not 'suspended' and not 'deleted' */}
                      {store.status !== 'suspended' && store.status !== 'deleted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => suspendMutation.mutate(store._id)}
                        >
                          Suspend
                        </Button>
                      )}

                      {/* Activate: show if status is not 'active' and not 'deleted' */}
                      {store.status !== 'active' && store.status !== 'deleted' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => activateMutation.mutate(store._id)}
                        >
                          Activate
                        </Button>
                      )}

                      {/* Delete: always show (with confirmation) */}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to permanently delete "${store.name}"? This cannot be undone.`)) {
                            deleteMutation.mutate(store._id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {[...Array(data.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-primary-500 text-white' : 'bg-secondary-200'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OwnerStores;