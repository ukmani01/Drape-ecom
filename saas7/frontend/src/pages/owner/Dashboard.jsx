import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOwnerDashboard } from '../../api/stores';        // fixed
import Card from '../../components/ui/Card';                 // also fixed
import { formatCurrency } from '../../utils/helpers';        // also fixed

// ... rest unchanged

const OwnerDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['owner-dashboard'],
    queryFn: () => getOwnerDashboard().then(res => res.data.data),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6" style={{ color: 'var(--color-text, #1c180e)' }}>Owner Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <p className="text-3xl font-bold" style={{ color: 'var(--color-primary, #f97316)' }}>{data?.totalStores}</p>
          <p className="text-secondary-500">Total Stores</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-3xl font-bold text-green-600">{data?.activeStores}</p>
          <p className="text-secondary-500">Active</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-3xl font-bold text-yellow-600">{data?.trialStores}</p>
          <p className="text-secondary-500">Trial</p>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-3xl font-bold" style={{ color: 'var(--color-primary, #f97316)' }}>{formatCurrency(data?.totalRevenue || 0)}</p>
          <p className="text-secondary-500">Revenue</p>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;
