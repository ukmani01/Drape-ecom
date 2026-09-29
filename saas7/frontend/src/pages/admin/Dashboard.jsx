import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '../../api/analytics';
import Card from '../../components/ui/Card';
import { formatCurrency } from '../../utils/helpers';

const AdminDashboard = () => {
  // =============================================================
  // 🔥 FIX: Handle 403 Error for Analytics
  // =============================================================
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => getAnalytics().then(res => res.data.data),
    retry: false, // Don't retry on 403
  });

  if (isLoading) return <div>Loading...</div>;

  // =============================================================
  // 🔥 If 403 Forbidden - Show Upgrade Message
  // =============================================================
  if (isError) {
    const isForbidden = error?.response?.status === 403;
    return (
      <div className="p-6">
        <h1 className="text-2xl font-display font-bold mb-6" style={{ color: 'var(--color-text, #1c180e)' }}>
          Dashboard
        </h1>
        <Card className="p-8 text-center bg-amber-50 border border-amber-200">
          {isForbidden ? (
            <>
              <div className="text-4xl mb-4">🔒</div>
              <h2 className="text-xl font-semibold text-amber-800 mb-2">Analytics Not Available</h2>
              <p className="text-amber-700">
                {error?.response?.data?.message || 'Analytics is not included in your current subscription plan.'}
              </p>
              <p className="text-sm text-amber-600 mt-2">
                Please upgrade your plan to access detailed analytics and reports.
              </p>
              <button
                onClick={() => window.location.href = '/admin/subscription'}
                className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                View Plans
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-red-800 mb-2">Failed to Load Dashboard</h2>
              <p className="text-red-700">{error?.message || 'Something went wrong. Please try again.'}</p>
            </>
          )}
        </Card>
      </div>
    );
  }

  // =============================================================
  // ✅ Success: Show Dashboard Data
  // =============================================================
  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6" style={{ color: 'var(--color-text, #1c180e)' }}>
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <p className="text-3xl font-bold" style={{ color: 'var(--color-primary, #f97316)' }}>
            {data?.totalOrders || 0}
          </p>
          <p className="text-secondary-500">Total Orders</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-3xl font-bold" style={{ color: 'var(--color-primary, #f97316)' }}>
            {formatCurrency(data?.revenue || 0)}
          </p>
          <p className="text-secondary-500">Revenue</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-3xl font-bold" style={{ color: 'var(--color-primary, #f97316)' }}>
            {data?.totalCustomers || 0}
          </p>
          <p className="text-secondary-500">Customers</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-3xl font-bold" style={{ color: 'var(--color-primary, #f97316)' }}>
            {data?.totalProducts || 0}
          </p>
          <p className="text-secondary-500">Products</p>
        </Card>
      </div>

    </div>
  );
};

export default AdminDashboard;