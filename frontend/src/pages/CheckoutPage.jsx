import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { orderService } from '../services/orderService';
import { AddressSelector } from '../components/checkout/AddressSelector';
import { PaymentOptions } from '../components/checkout/PaymentOptions';
import { OrderSummary } from '../components/checkout/OrderSummary';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, addresses, fetchAddresses, isAuthenticated } = useAuthStore();
  const { items, subtotal, fetchCart, clearCartState } = useCartStore();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CREDIT_CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchAddresses();
    fetchCart();
  }, [isAuthenticated]);

  // Set default address if available
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault || a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.addressId || defaultAddr.address_id);
    }
  }, [addresses]);

  const handleExecuteCheckout = async () => {
    if (!selectedAddressId) {
      setErrorMessage('Please select or create a shipping address before completing your order.');
      return;
    }

    if (!selectedPaymentMethod) {
      setErrorMessage('Please select a payment settlement method.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const response = await orderService.checkout({
        addressId: selectedAddressId,
        paymentMethod: selectedPaymentMethod,
      });

      const orderData = response.data || response;
      const orderId = orderData.orderId || orderData.order_id;

      // Clear cart client state
      clearCartState();

      // Navigate to order success receipt page
      navigate(`/orders/success/${orderId}`, { state: { orderData } });
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(
        err.message || 'An issue occurred while finalizing your order. Please check item stock and try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Your shopping bag is empty</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Please add hardware items to your bag before proceeding to checkout.</p>
        <Link to="/catalog" className="inline-block px-5 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 rounded-xl">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 py-8 space-y-8">
      {/* Checkout Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Express Checkout</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fast, 256-bit encrypted checkout with full 2-year warranty coverage.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">1. Shipping Address</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">2. Payment</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">3. Review & Settle</span>
        </div>
      </div>

      {/* Error notification banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Checkout Notice:</span>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
            <AddressSelector
              selectedAddressId={selectedAddressId}
              onSelectAddress={(id) => setSelectedAddressId(id)}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
            <PaymentOptions
              selectedPaymentMethod={selectedPaymentMethod}
              onSelectPaymentMethod={(m) => setSelectedPaymentMethod(m)}
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-4 sticky top-28 space-y-6">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            isProcessing={isProcessing}
            onPlaceOrder={handleExecuteCheckout}
            buttonText="Place Order & Authorize"
          />
        </div>
      </div>
    </div>
  );
};
