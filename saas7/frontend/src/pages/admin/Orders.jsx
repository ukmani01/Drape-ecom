import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../../api/orders';
import Card from '../../components/ui/Card';
import { Link } from 'react-router-dom';

const AdminOrders = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => getOrders({ limit: 50 }).then(res => res.data.data),
  });

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Orders</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(!data?.docs || data.docs.length === 0) ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-secondary-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                data.docs.map(order => (
                  <tr key={order._id} className="border-b hover:bg-secondary-50 transition-colors">
                    <td className="p-3 font-medium">{order.orderId}</td>
                    <td className="p-3">{order.shippingAddress?.name || 'N/A'}</td>
                    <td className="p-3">₹{order.total}</td>
                    <td className="p-3">
                      <span className="badge badge-primary">{order.orderStatus}</span>
                    </td>
                    <td className="p-3">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors min-h-[44px] min-w-[44px]"
                      >
                        View
                      </Link>
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

export default AdminOrders;