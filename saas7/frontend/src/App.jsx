import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './providers/ThemeProvider';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import OwnerRoute from './routes/OwnerRoute';
import { SkeletonPage } from './components/ui/SkeletonPage';

// Lazy imports
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Profile = lazy(() => import('./pages/Profile'));
const OrdersHistory = lazy(() => import('./pages/OrdersHistory'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Compare = lazy(() => import('./pages/Compare'));
const RecentlyViewed = lazy(() => import('./pages/RecentlyViewed'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminTheme = lazy(() => import('./pages/admin/Theme'));
const AdminSubscription = lazy(() => import('./pages/admin/Subscription'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminActivity = lazy(() => import('./pages/admin/Activity'));

const OwnerDashboard = lazy(() => import('./pages/owner/Dashboard'));
const OwnerStores = lazy(() => import('./pages/owner/Stores'));
const OwnerStoreDetail = lazy(() => import('./pages/owner/StoreDetail'));
const OwnerStoreAnalytics = lazy(() => import('./pages/owner/StoreAnalytics'));
const OwnerRevenue = lazy(() => import('./pages/owner/Revenue'));
const OwnerGlobalSettings = lazy(() => import('./pages/owner/GlobalSettings'));
const AdminNewProduct = lazy(() => import('./pages/admin/NewProduct'));
const AdminEditProduct = lazy(() => import('./pages/admin/EditProduct'));
const OwnerPlans = lazy(() => import('./pages/owner/plans')); // ⚠️ Ensure file name matches case (Plans.jsx)
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  const { loadTheme } = useTheme();

  // ✅ FIXED: Run only ONCE on component mount
  // Previously `[loadTheme]` caused infinite re-renders because
  // loadTheme reference changed on every render.
  // Now it runs only when the component first mounts.
  useEffect(() => {
    if (typeof loadTheme === 'function') {
      loadTheme();
    }
  }, []); // ← இதுதான் முக்கிய மாற்றம்! Empty dependency array.

  return (
    <BrowserRouter>
      <Suspense fallback={<SkeletonPage />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:slug" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route path="verify-email/:token" element={<VerifyEmail />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<OrdersHistory />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/recently-viewed" element={<RecentlyViewed />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="theme" element={<AdminTheme />} />
              <Route path="products/new" element={<AdminNewProduct />} />
              <Route path="products/:id" element={<AdminEditProduct />} />
              <Route path="subscription" element={<AdminSubscription />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="activity" element={<AdminActivity />} />
            </Route>
          </Route>

          <Route element={<OwnerRoute />}>
            <Route path="/owner" element={<DashboardLayout />}>
              <Route index element={<OwnerDashboard />} />
              <Route path="stores" element={<OwnerStores />} />
              <Route path="stores/:id" element={<OwnerStoreDetail />} />
              <Route path="stores/:id/analytics" element={<OwnerStoreAnalytics />} />
              <Route path="revenue" element={<OwnerRevenue />} />
              <Route path="global-settings" element={<OwnerGlobalSettings />} />
              <Route path="plans" element={<OwnerPlans />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;