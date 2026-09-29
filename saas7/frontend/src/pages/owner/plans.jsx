import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPlans } from '../../api/plans';
import Card from '../../components/ui/Card';
import { formatCurrency } from '../../utils/helpers';

const OwnerPlans = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['plans'],
        queryFn: () => getPlans().then(res => res.data.data),
    });

    if (isLoading) return <div>Loading plans...</div>;
    if (error) return <div>Error loading plans: {error.message}</div>;

    const plans = data?.docs || [];

    return (
        <div>
            <h1 className="text-2xl font-display font-bold mb-6">Subscription Plans</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan._id} className="p-6 flex flex-col">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="text-3xl font-bold text-primary-500 mt-2">{formatCurrency(plan.price)}<span className="text-sm font-normal text-secondary-500">/{plan.billingCycle}</span></p>
                        <p className="text-secondary-500 text-sm mt-1">{plan.description}</p>
                        <ul className="mt-4 space-y-2 text-sm flex-1">
                            <li>Max Products: {plan.features?.maxProducts === -1 ? 'Unlimited' : plan.features?.maxProducts}</li>
                            <li>Max Staff: {plan.features?.maxStaff === -1 ? 'Unlimited' : plan.features?.maxStaff}</li>
                            <li>Max Storage: {plan.features?.maxStorage === -1 ? 'Unlimited' : plan.features?.maxStorage} MB</li>
                            <li>{plan.features?.analytics ? '✅' : '❌'} Analytics</li>
                            <li>{plan.features?.bulkImport ? '✅' : '❌'} Bulk Import</li>
                            <li>{plan.features?.aiTools ? '✅' : '❌'} AI Tools</li>
                            <li>{plan.features?.customDomain ? '✅' : '❌'} Custom Domain</li>
                            <li>{plan.features?.prioritySupport ? '✅' : '❌'} Priority Support</li>
                            <li>Themes: {plan.features?.themeAccess?.length || 0}</li>
                        </ul>
                        <div className="mt-4 pt-4 border-t border-secondary-200 text-center">
                            <span className={`badge ${plan.isDefault ? 'badge-success' : 'badge-secondary'}`}>
                                {plan.isDefault ? 'Default' : plan.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default OwnerPlans;