import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStoreAnalytics } from '../../api/stores';
import Card from '../../components/ui/Card';
import { formatCurrency } from '../../utils/helpers';

const OwnerStoreAnalytics = () => {
    const { id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['store-analytics', id],
        queryFn: () => getStoreAnalytics(id).then(res => res.data.data),
        enabled: !!id,
    });

    if (isLoading) return <div>Loading analytics...</div>;
    if (error) return <div>Error loading analytics: {error.message}</div>;

    return (
        <div>
            <h1 className="text-2xl font-display font-bold mb-6">Store Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 text-center">
                    <p className="text-3xl font-bold text-primary-500">{data?.totalOrders || 0}</p>
                    <p className="text-secondary-500">Total Orders</p>
                </Card>
                <Card className="p-6 text-center">
                    <p className="text-3xl font-bold text-green-600">{data?.totalCustomers || 0}</p>
                    <p className="text-secondary-500">Total Customers</p>
                </Card>
                <Card className="p-6 text-center">
                    <p className="text-3xl font-bold text-blue-600">{data?.totalProducts || 0}</p>
                    <p className="text-secondary-500">Total Products</p>
                </Card>
                <Card className="p-6 text-center">
                    <p className="text-3xl font-bold text-purple-600">{formatCurrency(data?.revenue || 0)}</p>
                    <p className="text-secondary-500">Revenue</p>
                </Card>
            </div>
            <div className="mt-6">
                <Card className="p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Store Performance Summary</h3>
                    <p className="text-secondary-500">This store has generated {formatCurrency(data?.revenue || 0)} revenue from {data?.totalOrders || 0} orders with {data?.totalCustomers || 0} customers.</p>
                    {/* You can add a chart here later */}
                </Card>
            </div>
        </div>
    );
};

export default OwnerStoreAnalytics;