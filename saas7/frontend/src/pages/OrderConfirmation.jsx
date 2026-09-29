import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderByOrderId } from '../api/orders';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const OrderConfirmation = () => {
  const { orderId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderByOrderId(orderId).then(res => res.data.data),
    enabled: !!orderId,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        <p className="mt-4 text-secondary-500">Loading order details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-display font-semibold mb-2">Order Not Found</h2>
        <p className="text-secondary-500">We couldn't find your order details.</p>
        <Link to="/products" className="btn-primary inline-block mt-4">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const order = data;
  const items = order.items || [];
  const customer = order.customerId || {};
  const shippingAddress = order.shippingAddress || {};
  const billingAddress = order.billingAddress || shippingAddress;
  const timeline = order.timeline || [];

  // ✅ Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ✅ Get status badge color
  const getStatusBadge = (status) => {
    const colors = {
      'Pending': 'badge-warning',
      'Confirmed': 'badge-info',
      'Packed': 'badge-info',
      'Shipped': 'badge-info',
      'OutForDelivery': 'badge-info',
      'Delivered': 'badge-success',
      'Cancelled': 'badge-danger',
      'Returned': 'badge-danger',
    };
    return colors[status] || 'badge-warning';
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ✅ Success Header */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-display font-bold text-green-600">Order Confirmed!</h1>
        <p className="text-secondary-500 mt-2">
          Thank you for your order. We'll notify you when it ships.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-3">
          <p className="text-sm text-secondary-400">
            Order ID: <span className="font-mono font-bold">{order.orderId}</span>
          </p>
          <p className="text-sm text-secondary-400">
            Placed on: {formatDate(order.createdAt)}
          </p>
          <p className="text-sm text-secondary-400">
            Status: <span className={`badge ${getStatusBadge(order.orderStatus)}`}>{order.orderStatus || 'Pending'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ✅ Left: Order Items & Timeline */}
        <div className="lg:col-span-2">
          {/* Order Items */}
          <Card className="p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Order Items ({items.length})</h2>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 border-b border-secondary-100 pb-4 last:border-0">
                  <img
                    src={item.image || 'https://via.placeholder.com/60'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg bg-secondary-100"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-secondary-900">{item.name}</h3>
                    <p className="text-sm text-secondary-500">
                      SKU: {item.sku || 'N/A'} • Quantity: {item.quantity}
                    </p>
                    {item.variant && (
                      <p className="text-xs text-secondary-400">Variant: {item.variant}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-secondary-500">₹{item.price} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-4 border-t border-secondary-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Subtotal</span>
                  <span>₹{order.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                {order.couponCode && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({order.couponCode})</span>
                    <span>-₹{order.couponDiscount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-secondary-600">Shipping</span>
                  <span>₹{order.shippingFee?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Tax (8%)</span>
                  <span>₹{order.tax?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-secondary-200 pt-2">
                  <span>Total</span>
                  <span className="text-primary-500">₹{order.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* ✅ Order Timeline */}
          <Card className="p-6 mt-6">
            <h2 className="font-display text-xl font-semibold mb-4">Order Timeline</h2>
            <div className="relative pl-6 border-l-2 border-secondary-200 space-y-6">
              {timeline.length > 0 ? (
                timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-primary-500 border-2 border-white"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-secondary-900">{event.status || 'Update'}</p>
                        {event.note && <p className="text-sm text-secondary-500">{event.note}</p>}
                      </div>
                      <p className="text-sm text-secondary-400">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-secondary-500 text-sm">No timeline updates yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* ✅ Right: Customer & Address Details */}
        <div>
          {/* Customer Details */}
          <Card className="p-6">
            <h2 className="font-display text-xl font-semibold mb-4">Customer Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-secondary-500 text-xs uppercase tracking-wider">Name</p>
                <p className="font-medium">
                  {customer.firstName || shippingAddress.name ?
                    `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || shippingAddress.name
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-secondary-500 text-xs uppercase tracking-wider">Email</p>
                <p className="font-medium">{customer.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-secondary-500 text-xs uppercase tracking-wider">Phone</p>
                <p className="font-medium">{customer.phone || shippingAddress.phone || 'N/A'}</p>
              </div>
              {customer.totalOrders !== undefined && (
                <div className="border-t border-secondary-100 pt-3 mt-2">
                  <div className="flex justify-between">
                    <span className="text-secondary-500 text-xs uppercase tracking-wider">Total Orders</span>
                    <span className="font-medium">{customer.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-500 text-xs uppercase tracking-wider">Lifetime Value</span>
                    <span className="font-medium text-primary-500">₹{customer.lifetimeValue?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="p-6 mt-6">
            <h2 className="font-display text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{shippingAddress.name}</p>
              <p>{shippingAddress.line1}</p>
              {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
              <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
              <p>{shippingAddress.country}</p>
              <p className="text-secondary-500">📞 {shippingAddress.phone}</p>
            </div>
          </Card>

          {/* Payment Details */}
          <Card className="p-6 mt-6">
            <h2 className="font-display text-xl font-semibold mb-4">Payment Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-500">Method</span>
                <span className="font-medium">{order.paymentMethod || 'COD'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500">Status</span>
                <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : order.paymentStatus === 'Failed' ? 'badge-danger' : 'badge-warning'}`}>
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between">
                  <span className="text-secondary-500">Transaction ID</span>
                  <span className="font-mono text-xs">{order.paymentId}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-secondary-500">Tracking</span>
                  <span className="font-medium">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 mt-6">
            <Link to="/products" className="btn-primary w-full text-center inline-block">
              Continue Shopping
            </Link>
            {order.orderStatus === 'Pending' && (
              <Button variant="outline" className="w-full" onClick={() => window.print()}>
                🖨️ Print Order
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;