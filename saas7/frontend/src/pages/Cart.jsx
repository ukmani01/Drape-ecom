import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Button from '../components/ui/Button';
// =============================================================
// 🔥 DEFAULT THEME CSS - All Page Styles (Variables + Components)
// =============================================================
import '../themes/default.css';

const Cart = () => {
  const { cart, updateItem, removeItem, clearCart } = useCart();
  const items = cart?.items || [];
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div className="page-cart-luxury">
        {/* ✅ ALL STYLES ARE NOW IN default.css */}
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="empty-title">Your Cart is Empty</h1>
          <Link to="/products" className="btn btn-dark">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-cart-luxury">
      {/* ✅ ALL STYLES ARE NOW IN default.css */}
      {/* ✅ THEME VARIABLES ARE LOADED FROM theme1-10.css */}

      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <span>Cart</span>
        </div>

        <h1 className="page-title">Shopping Cart</h1>

        <div className="cart-grid">
          <div>
            {items.map((item) => (
              <div key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} />

                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-meta">₹{item.price} per item</div>

                  <div className="cart-item-actions">
                    <div className="qty-control">
                      <button
                        onClick={() => updateItem(item.productId._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.productId._id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId._id)}
                      className="remove-link"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="cart-item-price">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}

            <button onClick={clearCart} className="clear-cart-btn">
              Clear Cart
            </button>
          </div>

          <div className="summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>₹99</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{subtotal + 99}</span>
            </div>

            <Link to="/checkout" className="btn btn-dark btn-block text-center">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;