import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStoreDetails, suspendStore, activateStore, deleteStore, resetAdminPassword } from '../../api/stores';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers'; // ✅ Keep only formatCurrency

const OwnerStoreDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['store-detail', id],
        queryFn: () => getStoreDetails(id).then(res => res.data.data),
        enabled: !!id,
    });

    const suspendMutation = useMutation({
        mutationFn: suspendStore,
        onSuccess: () => {
            queryClient.invalidateQueries(['store-detail', id]);
            toast.success('Store suspended');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to suspend'),
    });

    const activateMutation = useMutation({
        mutationFn: activateStore,
        onSuccess: () => {
            queryClient.invalidateQueries(['store-detail', id]);
            toast.success('Store activated');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to activate'),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStore,
        onSuccess: () => {
            toast.success('Store deleted');
            navigate('/owner/stores');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete'),
    });

    const resetPasswordMutation = useMutation({
        mutationFn: resetAdminPassword,
        onSuccess: () => {
            toast.success('Password reset link sent to admin email');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to reset password'),
    });

    if (isLoading) return <div>Loading store details...</div>;
    if (error) return <div>Error loading store: {error.message}</div>;

    const store = data?.store;
    const subscription = data?.subscription;
    const admin = data?.admin;

    if (!store) return <div>Store not found</div>;

    const isSuspended = store.status === 'suspended';
    const isActive = store.status === 'active';

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-display font-bold">{store.name}</h1>
                <div className="flex space-x-2">
                    {isActive && (
                        <Button variant="outline" size="sm" onClick={() => suspendMutation.mutate(store._id)}>Suspend</Button>
                    )}
                    {isSuspended && (
                        <Button variant="primary" size="sm" onClick={() => activateMutation.mutate(store._id)}>Activate</Button>
                    )}
                    <Button variant="danger" size="sm" onClick={() => {
                        if (window.confirm('Are you sure you want to permanently delete this store? This action cannot be undone.')) {
                            deleteMutation.mutate(store._id);
                        }
                    }}>Delete Permanently</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Store Information */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Store Information</h2>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between"><dt>Name:</dt><dd>{store.name}</dd></div>
                        <div className="flex justify-between"><dt>Slug:</dt><dd>{store.slug}</dd></div>
                        <div className="flex justify-between"><dt>Status:</dt>
                            <dd><span className={`badge ${store.status === 'active' ? 'badge-success' : store.status === 'suspended' ? 'badge-danger' : 'badge-warning'}`}>{store.status}</span></dd>
                        </div>
                        <div className="flex justify-between"><dt>Theme:</dt><dd>Level {store.selectedTheme}</dd></div>
                        <div className="flex justify-between"><dt>Currency:</dt><dd>{store.currency}</dd></div>
                        <div className="flex justify-between"><dt>Domain:</dt><dd>{store.domain || 'Not set'}</dd></div>
                        <div className="flex justify-between"><dt>Subdomain:</dt><dd>{store.subdomain || 'Not set'}</dd></div>
                        <div className="flex justify-between"><dt>Created:</dt><dd>{new Date(store.createdAt).toLocaleDateString()}</dd></div>
                    </dl>
                </Card>

                {/* Subscription Details */}
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Subscription</h2>
                    {subscription ? (
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between"><dt>Plan:</dt><dd>{subscription.plan?.name || 'N/A'}</dd></div>
                            <div className="flex justify-between"><dt>Status:</dt>
                                <dd><span className={`badge ${subscription.status === 'active' ? 'badge-success' : subscription.status === 'trial' ? 'badge-warning' : 'badge-danger'}`}>{subscription.status}</span></dd>
                            </div>
                            <div className="flex justify-between"><dt>Auto-Renew:</dt><dd>{subscription.autoRenew ? 'Yes' : 'No'}</dd></div>
                            <div className="flex justify-between"><dt>Current Period:</dt><dd>{new Date(subscription.currentPeriodStart).toLocaleDateString()} – {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</dd></div>
                            {subscription.trialEnd && (
                                <div className="flex justify-between"><dt>Trial Ends:</dt><dd>{new Date(subscription.trialEnd).toLocaleDateString()}</dd></div>
                            )}
                            <div className="flex justify-between"><dt>Days Left:</dt><dd>{subscription.daysLeft || 0} days</dd></div>
                        </dl>
                    ) : (
                        <p className="text-secondary-500">No active subscription</p>
                    )}
                </Card>

                {/* Admin User */}
                <Card className="p-6 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Store Admin</h2>
                        <Button variant="outline" size="sm" onClick={() => resetPasswordMutation.mutate(store._id)}>
                            Reset Admin Password
                        </Button>
                    </div>
                    {admin ? (
                        <dl className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between"><dt>Name:</dt><dd>{admin.name}</dd></div>
                            <div className="flex justify-between"><dt>Email:</dt><dd>{admin.email}</dd></div>
                            <div className="flex justify-between"><dt>Role:</dt><dd>{admin.role}</dd></div>
                            <div className="flex justify-between"><dt>Status:</dt><dd>{admin.status}</dd></div>
                            <div className="flex justify-between"><dt>Verified:</dt><dd>{admin.isEmailVerified ? 'Yes' : 'No'}</dd></div>
                        </dl>
                    ) : (
                        <p className="text-secondary-500 mt-4">No admin user found for this store.</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default OwnerStoreDetail;