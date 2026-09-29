import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../api/orders';
import { updateCustomer } from '../api/customers';
import { createRazorpayOrder, verifyRazorpayPayment } from '../api/subscriptions';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { FiPlus, FiMinus, FiTrash2, FiEdit2 } from 'react-icons/fi';
// =============================================================
// 🔥 DEFAULT THEME CSS - All Page Styles (Variables + Components)
// =============================================================
import '../themes/default.css';

const Checkout = () => {
  const { cart, clearCart, updateItem, removeItem } = useCart();
  const { customer, user, updateCustomer: updateCustomerContext } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const navigate = useNavigate();

  const items = cart?.items || [];
  const hasSavedDetails = customer && customer.addresses && customer.addresses.length > 0;
  const [useSavedDetails, setUseSavedDetails] = useState(() => !!(customer && customer.addresses && customer.addresses.length > 0));

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    line1: '', line2: '', city: '', state: '', pincode: '',
    country: 'India', paymentMethod: 'COD',
  });

  useEffect(() => {
    if (useSavedDetails && customer) {
      const address = customer.addresses?.find(a => a.isDefault) || customer.addresses?.[0];
      if (address) {
        setForm({
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          email: customer.email || '',
          phone: customer.phone || address?.phone || '',
          line1: address?.line1 || '',
          line2: address?.line2 || '',
          city: address?.city || '',
          state: address?.state || '',
          pincode: address?.pincode || '',
          country: address?.country || 'India',
          paymentMethod: 'COD',
        });
      }
    }
  }, [useSavedDetails, customer]);

  const toggleSavedDetails = () => {
    setUseSavedDetails(!useSavedDetails);
    if (!useSavedDetails && customer) {
      const address = customer.addresses?.find(a => a.isDefault) || customer.addresses?.[0];
      if (address) {
        setForm({
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          email: customer.email || '',
          phone: customer.phone || address?.phone || '',
          line1: address?.line1 || '',
          line2: address?.line2 || '',
          city: address?.city || '',
          state: address?.state || '',
          pincode: address?.pincode || '',
          country: address?.country || 'India',
          paymentMethod: 'COD',
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (!isEditing) setIsEditing(true);
  };

  const saveCustomerDetails = async () => {
    if (!customer) {
      toast.error('No customer profile found');
      return false;
    }
    try {
      await updateCustomer(customer._id, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        addresses: [{
          type: 'shipping', label: 'Default Address',
          line1: form.line1, line2: form.line2 || '',
          city: form.city, state: form.state,
          pincode: form.pincode, country: form.country || 'India',
          phone: form.phone, isDefault: true,
        }]
      });
      toast.success('Details saved for future orders');
      return true;
    } catch (err) {
      toast.error('Could not save details');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.line1 || !form.city || !form.state || !form.pincode || !form.phone) {
      toast.error('Please fill all required shipping fields');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // COD Order
    if (form.paymentMethod === 'COD') {
      setLoading(true);
      try {
        if (customer) await saveCustomerDetails();
        const orderData = {
          customerId: customer?._id || null,
          items: items.map(item => ({ productId: item.productId, quantity: item.quantity, sku: item.sku || '' })),
          shippingAddress: {
            name: `${form.firstName} ${form.lastName}`.trim(),
            email: form.email || undefined,
            line1: form.line1, line2: form.line2 || '',
            city: form.city, state: form.state,
            pincode: form.pincode, country: form.country || 'India',
            phone: form.phone,
          },
          paymentMethod: 'COD',
        };
        const { data } = await createOrder(orderData);
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/order-confirmation/${data.data.orderId}`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to place order');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Razorpay Order
    if (form.paymentMethod === 'Razorpay') {
      setPaymentProcessing(true);
      try {
        if (customer) await saveCustomerDetails();
        const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
        const shipping = subtotal > 0 ? 99 : 0;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        const orderData = {
          customerId: customer?._id || null,
          items: items.map(item => ({ productId: item.productId, quantity: item.quantity, sku: item.sku || '' })),
          shippingAddress: {
            name: `${form.firstName} ${form.lastName}`.trim(),
            email: form.email || undefined,
            line1: form.line1, line2: form.line2 || '',
            city: form.city, state: form.state,
            pincode: form.pincode, country: form.country || 'India',
            phone: form.phone,
          },
          paymentMethod: 'Razorpay',
        };

        const { data } = await createOrder(orderData);
        const order = data.data;

        const paymentRes = await createRazorpayOrder({
          amount: order.total,
          currency: 'INR',
          notes: { orderId: order._id },
        });
        const razorpayOrder = paymentRes.data.data;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Drape Store',
          description: `Order #${order.orderId}`,
          order_id: razorpayOrder.id,
          prefill: { name: `${form.firstName} ${form.lastName}`.trim(), email: form.email || '', contact: form.phone },
          theme: { color: '#f97316' },
          handler: async function (response) {
            try {
              const verifyRes = await verifyRazorpayPayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                orderData: { orderId: order._id, amount: order.total },
              });
              if (verifyRes.data.success) {
                toast.success('Payment Successful! Order placed.');
                clearCart();
                navigate(`/order-confirmation/${order.orderId}`);
              } else {
                toast.error('Payment verification failed.');
              }
            } catch (err) {
              toast.error('Payment failed. Please try again.');
            } finally {
              setPaymentProcessing(false);
            }
          },
          modal: { ondismiss: function () { toast.error('Payment cancelled'); setPaymentProcessing(false); } },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to initiate payment.');
        setPaymentProcessing(false);
      }
    }
  };

  // Cart empty check
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center" style={{ fontFamily: "'Work Sans', sans-serif" }}>
        <h1 className="text-3xl mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>Your Cart is Empty</h1>
        <button
          onClick={() => navigate('/products')}
          style={{ background: '#1c1a16', color: '#fff', padding: '17px 38px', textTransform: 'uppercase', letterSpacing: '2.6px', fontSize: '11.5px', border: 'none', cursor: 'pointer' }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
  const shipping = subtotal > 0 ? 99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const isProcessing = loading || paymentProcessing;
  const buttonText = paymentProcessing ? 'Opening Payment...' : loading ? 'Processing...' : 'Place Order';

  return (
    <div className="page-checkout-luxury">
      {/* ✅ ALL STYLES ARE NOW IN default.css */}
      {/* ✅ THEME VARIABLES ARE LOADED FROM theme1-10.css */}

      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/cart">Cart</Link> / <span>Checkout</span>
        </div>

        <h1 className="page-title">Checkout</h1>

        <div className="checkout-steps">
          <span className="step active">1. Shipping</span> <span>—</span> <span className="step">2. Payment</span> <span>—</span> <span className="step">3. Review</span>
        </div>

        {/* Customer Info Banners */}
        {customer && hasSavedDetails && (
          <div className="info-banner">
            <label className="toggle-label" htmlFor="useSaved">
              <input
                type="checkbox"
                id="useSaved"
                checked={useSavedDetails}
                onChange={toggleSavedDetails}
              />
              Use saved shipping details
            </label>
            <button type="button" onClick={() => setIsEditing(true)} className="edit-btn">
              <FiEdit2 /> Edit
            </button>
          </div>
        )}

        {customer && hasSavedDetails && useSavedDetails && !isEditing && (
          <div className="info-banner muted">
            Your saved details are auto-filled. You can proceed to place your order.
          </div>
        )}

        {customer && !hasSavedDetails && (
          <div className="info-banner muted">
            Your details will be saved for future orders for a faster checkout experience.
          </div>
        )}

        <div className="checkout-grid">
          <div>
            <div className="form-card">
              <h3>Shipping Address</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jane" required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email (Optional)</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@email.com" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" required />
                </div>
              </div>

              <div className="form-group">
                <label>Street Address</label>
                <input type="text" name="line1" value={form.line1} onChange={handleChange} placeholder="123 Fifth Avenue" required />
              </div>

              <div className="form-group">
                <label>Apartment, Suite, etc. (Optional)</label>
                <input type="text" name="line2" value={form.line2} onChange={handleChange} placeholder="Apt 4B" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="New York" required />
                </div>
                <div className="form-group">
                  <label>State / Province</label>
                  <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="NY" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code</label>
                  <input type="text" name="pincode" value={form.pincode} onChange={handleChange} placeholder="10001" required />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input type="text" name="country" value={form.country} onChange={handleChange} placeholder="United States" required />
                </div>
              </div>
            </div>

            <div className="form-card">
              <h3>Payment Method</h3>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                  <option value="COD">Cash on Delivery</option>
                  <option value="Razorpay">Credit Card / Razorpay</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="summary-card">
              <h3>Order Summary</h3>

              <div style={{ marginBottom: '24px' }}>
                {items.map((item, idx) => (
                  <div key={idx} className="summary-item">
                    <span>{item.name} <span style={{ color: 'var(--color-text-secondary, #6e5f38)' }}>× {item.quantity}</span></span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Tax (8%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              <button
                className="btn btn-dark btn-block"
                onClick={handleSubmit}
                disabled={isProcessing || items.length === 0}
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;