import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubscriptionStatus, getPlans, cancelSubscription, createRazorpayOrder, verifyRazorpayPayment } from '../../api/subscriptions';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import DeployButton from './DeployButton';

const AdminSubscription = () => {
  const queryClient = useQueryClient();

  // ===== Existing Queries =====
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => getSubscriptionStatus().then(res => res.data.data),
  });
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => getPlans().then(res => res.data.data),
  });

  // ===== Cancel Mutation =====
  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription-status']);
      toast.success('Subscription cancelled');
    },
  });

  // ===== 🔥 Razorpay Upgrade Handler =====
  const handleUpgrade = async (plan) => {
    try {
      // 1. Create Razorpay Order (Backend-ல storeId Auto-ஆ Add ஆகும்)
      const orderRes = await createRazorpayOrder({
        amount: plan.price,
        currency: 'INR',
        notes: {
          planId: plan._id,
        },
      });

      const razorpayOrder = orderRes.data.data;

      // 2. Razorpay Checkout Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Drape Store',
        description: `Upgrade to ${plan.name} Plan`,
        order_id: razorpayOrder.id,
        prefill: {
          name: 'Store Owner',
          email: 'owner@drape.com',
        },
        theme: {
          color: '#f97316',
        },
        handler: async function (response) {
          try {
            const verifyRes = await verifyRazorpayPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              orderData: {
                planId: plan._id,
                amount: plan.price,
              },
            });

            if (verifyRes.data.success) {
              toast.success(`Successfully upgraded to ${plan.name}!`);
              queryClient.invalidateQueries(['subscription-status']);
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verification Error:', err);
            toast.error('Payment failed. Please try again.');
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error('Failed to initiate payment. Please try again.');
    }
  };

  // ===== Loading State =====
  if (statusLoading || plansLoading) return <div>Loading...</div>;

  // ===== UI =====
  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Subscription</h1>
      <DeployButton />

      <Card className="p-6 mb-6">
        <h2 className="font-display text-xl font-semibold mb-4">Current Plan</h2>
        <div className="space-y-2">
          <p><strong>Plan:</strong> {status?.plan?.name || 'None'}</p>
          <p><strong>Status:</strong> <span className="badge">{status?.status}</span></p>
          <p><strong>Expires:</strong> {status?.expiresAt ? new Date(status.expiresAt).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Days Left:</strong> {status?.daysLeft ?? 'N/A'}</p>
        </div>
        {status?.status !== 'cancelled' && (
          <Button variant="danger" onClick={() => cancelMutation.mutate()} className="mt-4">
            Cancel Subscription
          </Button>
        )}
      </Card>

      <h2 className="font-display text-xl font-semibold mb-4">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans?.docs?.map((plan) => {
          const isCurrentPlan = plan.code === status?.plan?.code;
          return (
            <Card key={plan._id} className="p-4">
              <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
              <p className="text-secondary-500">₹{plan.price}/{plan.billingCycle}</p>
              <ul className="mt-2 text-sm list-disc list-inside">
                {Object.entries(plan.features).map(([key, value]) => (
                  <li key={key}>{key}: {value === true ? '✅' : value === false ? '❌' : value}</li>
                ))}
              </ul>

              {!isCurrentPlan ? (
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleUpgrade(plan)}
                >
                  Upgrade - ₹{plan.price}
                </Button>
              ) : (
                <Button variant="secondary" size="sm" className="mt-4" disabled>
                  Current Plan
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSubscription;