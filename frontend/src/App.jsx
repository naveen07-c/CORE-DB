import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ToastContainer } from './components/common/Toast';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { WishlistPage } from './pages/WishlistPage';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { ScrollToTopButton } from './components/common/SmartImage';

export const App = () => {
  const location = useLocation();
  const { isAuthenticated, fetchAddresses } = useAuthStore();
  const { fetchCart } = useCartStore();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Initial sync of user state
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
      fetchCart();
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <Navbar />
      <CartDrawer />
      <ToastContainer />
      <main className="flex-1" key={location.pathname}>
        <div className={`animate-pagein ${location.pathname === '/' ? '' : 'pt-[88px]'}`}>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/success/:id" element={<OrderSuccessPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="*" element={<CatalogPage />} />
          </Routes>
        </div>
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default App;
