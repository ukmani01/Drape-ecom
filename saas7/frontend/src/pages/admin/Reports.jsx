import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSalesReport } from '../../api/reports';
import Card from '../../components/ui/Card';
import { formatCurrency } from '../../utils/helpers';

const AdminReports = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-reports'],
        queryFn: () => getSalesReport({ period: 'month' }).then(res => res.data.data),
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>


            <h1 className="text-2xl font-display font-bold mb-6">Sales Report</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                    <p className="text-3xl font-bold text-primary-500">{formatCurrency(data?.totalRevenue || 0)}</p>
                    <p className="text-secondary-500">Revenue</p>
                </Card>
                <Card className="p-6 text-center">
                    <p className="text-3xl font-bold text-green-600">{data?.totalOrders || 0}</p>
                    <p className="text-secondary-500">Orders</p>
                </Card>
                <Card className="p-6 text-center">
                    <p className="text-3xl font-bold text-blue-600">{data?.averageOrderValue || 0}</p>
                    <p className="text-secondary-500">Avg Order Value</p>
                </Card>
            </div>
            <div className="mt-6">
                <Card className="p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Daily Sales</h3>
                    <div className="bg-secondary-50 p-4 rounded text-center">Chart placeholder</div>
                </Card>
            </div>
        </div>
    );
};

export default AdminReports;