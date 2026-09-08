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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CARD');
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
      setErrorMessage('Please choose a payment method before placing your order.');
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
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border-2 border-ink/10 shadow-card text-center space-y-4">
        <h2 className="text-xl font-bold text-ink">Your shopping bag is empty</h2>
        <p className="text-sm text-ink/50">Add a few things you love before checking out.</p>
        <Link to="/catalog" className="btn-primary mx-auto">
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
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">Checkout</h1>
          <p className="text-sm text-ink/50 mt-1">
            Fast, encrypted checkout with your price locked the moment you confirm.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-ink/40">
          <span className="text-brand-600 font-bold">1. Address</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brand-600 font-bold">2. Payment</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brand-600 font-bold">3. Place Order</span>
        </div>
      </div>

      {/* Error notification banner */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Checkout notice:</span>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-3xl border-2 border-ink/10 p-6 shadow-card">
            <AddressSelector
              selectedAddressId={selectedAddressId}
              onSelectAddress={(id) => setSelectedAddressId(id)}
            />
          </div>

          <div className="bg-white rounded-3xl border-2 border-ink/10 p-6 shadow-card">
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
