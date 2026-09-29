import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../api/orders';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';

const OrdersHistory = () => {
    const { user } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ['orders-history', user?.id],
        queryFn: () => getOrders({ limit: 50 }).then(res => res.data.data),
        enabled: !!user,
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    const orders = data?.docs || [];

    if (orders.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-2xl font-display font-semibold mb-2">No Orders Yet</h2>
                <p className="text-secondary-500">Start shopping to see your orders here.</p>
                <Link to="/products" className="btn-primary inline-block mt-4">Browse Products</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-display font-bold mb-8">Order History</h1>
            <p className="text-secondary-500 mb-6">{orders.length} orders found</p>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary-50">
                            <tr className="border-b">
                                <th className="p-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider">Order ID</th>
                                <th className="p-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider">Date</th>
                                <th className="p-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider">Items</th>
                                <th className="p-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider">Total</th>
                                <th className="p-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider">Status</th>
                                <th className="p-3 text-xs font-semibold text-secondary-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="border-b hover:bg-secondary-50 transition-colors">
                                    <td className="p-3 font-mono text-sm">#{order.orderId}</td>
                                    <td className="p-3 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="p-3 text-sm">{order.items?.length || 0}</td>
                                    <td className="p-3 font-medium">₹{order.total || 0}</td>
                                    <td className="p-3">
                                        <span className={`badge ${order.orderStatus === 'Delivered' ? 'badge-success' :
                                                order.orderStatus === 'Cancelled' ? 'badge-danger' :
                                                    order.orderStatus === 'Confirmed' ? 'badge-info' :
                                                        'badge-warning'
                                            }`}>
                                            {order.orderStatus || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <Link to={`/orders/${order._id}`} className="text-primary-500 hover:underline text-sm">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default OrdersHistory;