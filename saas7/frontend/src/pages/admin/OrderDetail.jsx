import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrder, updateOrderStatus } from '../../api/orders';
import Card from '../../components/ui/Card';

// =============================================================
// 🎨 STATUS BADGE COLORS
// =============================================================
const STATUS_STYLES = {
  Pending:       { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  Confirmed:     { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-300' },
  Packed:        { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  Shipped:       { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  OutForDelivery:{ bg: 'bg-cyan-100',   text: 'text-cyan-800',   border: 'border-cyan-300' },
  Delivered:     { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-300' },
  Cancelled:     { bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-300' },
  Returned:      { bg: 'bg-gray-100',   text: 'text-gray-800',   border: 'border-gray-300' },
};

const PAYMENT_STATUS_STYLES = {
  Pending:  { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Paid:     { bg: 'bg-green-100',  text: 'text-green-800'  },
  Failed:   { bg: 'bg-red-100',    text: 'text-red-800'    },
  Refunded: { bg: 'bg-gray-100',   text: 'text-gray-800'   },
};

const ORDER_STATUSES = [
  'Pending', 'Confirmed', 'Packed', 'Shipped',
  'OutForDelivery', 'Delivered', 'Cancelled', 'Returned'
];

// =============================================================
// 🎨 HELPER COMPONENTS
// =============================================================
const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      {status}
    </span>
  );
};

const PaymentBadge = ({ status }) => {
  const style = PAYMENT_STATUS_STYLES[status] || PAYMENT_STATUS_STYLES.Pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${style.bg} ${style.text}`}>
      {status}
    </span>
  );
};

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-start gap-3 py-2">
    {icon && <span className="text-secondary-400 mt-0.5">{icon}</span>}
    <div className="flex-1 min-w-0">
      <p className="text-xs uppercase tracking-wider text-secondary-500 font-medium mb-0.5">
        {label}
      </p>
      <p className="text-sm text-secondary-900 break-words">
        {value || <span className="text-secondary-400 italic">Not provided</span>}
      </p>
    </div>
  </div>
);

// =============================================================
// 📄 MAIN COMPONENT
// =============================================================
const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // =============================================================
  // 🔄 FETCH ORDER
  // =============================================================
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => getOrder(id).then((res) => res.data.data),
    enabled: !!id,
  });

  // =============================================================
  // 🔄 UPDATE STATUS MUTATION
  // =============================================================
  const updateStatusMutation = useMutation({
    mutationFn: ({ status, note }) => updateOrderStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNote('');
    },
    onError: (err) => {
      alert('❌ Failed to update status: ' + (err.response?.data?.message || err.message));
    },
  });

  const handleStatusUpdate = () => {
    if (!newStatus) {
      alert('Please select a status');
      return;
    }
    updateStatusMutation.mutate({ status: newStatus, note: statusNote });
  };

  // =============================================================
  // ⏳ LOADING STATE
  // =============================================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  // =============================================================
  // ❌ ERROR STATE
  // =============================================================
  if (isError) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              Order not found
            </h2>
            <p className="text-secondary-500 mb-6">
              {error?.response?.data?.message || 'Failed to load order details'}
            </p>
            <Link
              to="/admin/orders"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              ← Back to Orders
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // =============================================================
  // 📦 EXTRACT ORDER DATA
  // =============================================================
  const order = data || {};
  const {
    orderId,
    customerId,
    items = [],
    subtotal = 0,
    discount = 0,
    couponCode,
    couponDiscount = 0,
    shippingFee = 0,
    tax = 0,
    total = 0,
    shippingAddress = {},
    billingAddress = {},
    paymentMethod = 'COD',
    paymentStatus = 'Pending',
    orderStatus = 'Pending',
    timeline = [],
    trackingNumber,
    trackingProvider,
    trackingUrl,
    notes,
    createdAt,
  } = order;

  // Customer details (if populated)
  const customer = customerId || {};
  const customerName = customer.name || customer.firstName
    ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
    : shippingAddress.name || 'Guest Customer';
  const customerEmail = customer.email || shippingAddress.email || 'N/A';
  const customerPhone = customer.phone || shippingAddress.phone || 'N/A';

  // =============================================================
  // 🎨 RENDER
  // =============================================================
  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ===== BACK BUTTON ===== */}
      <div>
        <Link
          to="/admin/orders"
          className="inline-flex items-center text-sm text-secondary-600 hover:text-primary-600 transition-colors"
        >
          ← Back to Orders
        </Link>
      </div>

      {/* ===== HEADER ===== */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-display font-bold text-secondary-900">
                Order #{orderId || id.slice(-8).toUpperCase()}
              </h1>
              <StatusBadge status={orderStatus} />
              <PaymentBadge status={paymentStatus} />
            </div>
            <p className="text-sm text-secondary-500">
              Placed on{' '}
              {createdAt
                ? new Date(createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setNewStatus(orderStatus);
                setShowStatusModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
            >
              ✏️ Update Status
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-secondary-300 text-secondary-700 text-sm font-medium rounded-md hover:bg-secondary-50 transition-colors"
            >
              🖨️ Print Invoice
            </button>
          </div>
        </div>
      </Card>

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===== LEFT COLUMN (2/3) ===== */}
        <div className="lg:col-span-2 space-y-6">

          {/* ---- ORDER ITEMS ---- */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-900">
                📦 Order Items
              </h2>
              <span className="text-sm text-secondary-500">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="divide-y divide-secondary-100">
              {items.length === 0 ? (
                <p className="text-center text-secondary-500 py-8">
                  No items in this order
                </p>
              ) : (
                items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-secondary-100 border border-secondary-200">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-secondary-400">
                          🖼️
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-secondary-900 text-sm">
                        {item.name || 'Product'}
                      </h3>
                      {item.sku && (
                        <p className="text-xs text-secondary-500 mt-0.5">
                          SKU: {item.sku}
                        </p>
                      )}
                      {item.variant && (
                        <p className="text-xs text-secondary-500">
                          Variant: {item.variant}
                        </p>
                      )}
                      <p className="text-xs text-secondary-600 mt-1">
                        ₹{Number(item.price || 0).toLocaleString('en-IN')} × {item.quantity || 1}
                      </p>
                    </div>

                    {/* Line Total */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-secondary-900">
                        ₹{Number(item.total || (item.price * item.quantity) || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* ---- PAYMENT SUMMARY ---- */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              💰 Payment Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Subtotal</span>
                <span className="font-medium text-secondary-900">
                  ₹{Number(subtotal).toLocaleString('en-IN')}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -₹{Number(discount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">
                    Coupon {couponCode && `(${couponCode})`}
                  </span>
                  <span className="font-medium text-green-600">
                    -₹{Number(couponDiscount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Tax</span>
                <span className="font-medium text-secondary-900">
                  ₹{Number(tax).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Shipping</span>
                <span className="font-medium text-secondary-900">
                  ₹{Number(shippingFee).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="border-t border-secondary-200 pt-3 mt-3 flex justify-between">
                <span className="text-base font-semibold text-secondary-900">Total</span>
                <span className="text-lg font-bold text-primary-600">
                  ₹{Number(total).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-4 pt-4 border-t border-secondary-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-secondary-500 font-medium">
                    Payment Method
                  </p>
                  <p className="text-sm font-medium text-secondary-900 mt-0.5">
                    {paymentMethod === 'COD' ? '💵 Cash on Delivery' : `💳 ${paymentMethod}`}
                  </p>
                </div>
                <PaymentBadge status={paymentStatus} />
              </div>
            </div>
          </Card>

          {/* ---- ORDER TIMELINE ---- */}
          {timeline && timeline.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                📝 Order Timeline
              </h2>
              <div className="relative pl-6 border-l-2 border-secondary-200 space-y-4">
                {timeline.map((entry, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-primary-500 border-2 border-white"></div>
                    <div>
                      <p className="font-medium text-sm text-secondary-900">
                        {entry.status}
                      </p>
                      {entry.note && (
                        <p className="text-xs text-secondary-600 mt-0.5">
                          {entry.note}
                        </p>
                      )}
                      <p className="text-xs text-secondary-400 mt-1">
                        {entry.timestamp
                          ? new Date(entry.timestamp).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ---- TRACKING INFO ---- */}
          {trackingNumber && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                🚚 Tracking Information
              </h2>
              <div className="space-y-2">
                <InfoRow label="Tracking Number" value={trackingNumber} />
                {trackingProvider && (
                  <InfoRow label="Provider" value={trackingProvider} />
                )}
                {trackingUrl && (
                  <div className="pt-2">
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 underline"
                    >
                      Track Package →
                    </a>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ---- NOTES ---- */}
          {notes && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-900 mb-3">
                📝 Order Notes
              </h2>
              <p className="text-sm text-secondary-700 whitespace-pre-wrap">
                {notes}
              </p>
            </Card>
          )}
        </div>

        {/* ===== RIGHT COLUMN (1/3) ===== */}
        <div className="space-y-6">

          {/* ---- CUSTOMER DETAILS ---- */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              👤 Customer Details
            </h2>
            <div className="space-y-1">
              <InfoRow
                label="Name"
                value={customerName}
                icon="👤"
              />
              <InfoRow
                label="Email"
                value={customerEmail}
                icon="✉️"
              />
              <InfoRow
                label="Phone"
                value={customerPhone}
                icon="📞"
              />
            </div>
          </Card>

          {/* ---- SHIPPING ADDRESS ---- */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              📍 Shipping Address
            </h2>
            {shippingAddress && shippingAddress.line1 ? (
              <div className="text-sm text-secondary-700 space-y-0.5 leading-relaxed">
                <p className="font-medium text-secondary-900">
                  {shippingAddress.name}
                </p>
                <p>{shippingAddress.line1}</p>
                {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                <p>
                  {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                </p>
                <p>{shippingAddress.country || 'India'}</p>
                {shippingAddress.phone && (
                  <p className="pt-2 text-secondary-600">
                    📞 {shippingAddress.phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-secondary-400 italic">
                No shipping address provided
              </p>
            )}
          </Card>

          {/* ---- BILLING ADDRESS ---- */}
          {billingAddress && billingAddress.line1 && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                💳 Billing Address
              </h2>
              <div className="text-sm text-secondary-700 space-y-0.5 leading-relaxed">
                <p className="font-medium text-secondary-900">
                  {billingAddress.name}
                </p>
                <p>{billingAddress.line1}</p>
                {billingAddress.line2 && <p>{billingAddress.line2}</p>}
                <p>
                  {billingAddress.city}, {billingAddress.state} - {billingAddress.pincode}
                </p>
                <p>{billingAddress.country || 'India'}</p>
                {billingAddress.phone && (
                  <p className="pt-2 text-secondary-600">
                    📞 {billingAddress.phone}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ===== STATUS UPDATE MODAL ===== */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Update Order Status
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Note (optional)
                </label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows="3"
                  placeholder="Add a note for this status change..."
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus('');
                  setStatusNote('');
                }}
                className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-md hover:bg-secondary-50 transition-colors"
                disabled={updateStatusMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updateStatusMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetail;