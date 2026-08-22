import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Package, Printer, ArrowRight, ShieldCheck, Calendar, CreditCard, MapPin, Truck } from 'lucide-react';
import { orderService } from '../services/orderService';
import { Loader } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';

export const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await orderService.getOrderById(id);
        setOrder(res.data || res);
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <Loader size="lg" text="Generating your verified order receipt..." />
      </div>
    );
  }

  const orderId = order?.orderId || order?.order_id || id;
  const transactionId = order?.payment?.transactionId || order?.transactionId || `TXN_${orderId}_SECURE`;
  const paymentMethod = order?.payment?.paymentMethod || order?.payment_method || 'CREDIT_CARD';
  const paymentStatus = order?.payment?.paymentStatus || order?.payment_status || 'PAID & CONFIRMED';
  const orderItems = order?.items || order?.order_items || [];
  const address = order?.address || {};

  const subtotal = Number(order?.subtotalAmount || order?.subtotal_amount || 0);
  const tax = Number(order?.taxAmount || order?.tax_amount || 0);
  const shipping = Number(order?.shippingFee || order?.shipping_fee || 0);
  const total = Number(order?.totalAmount || order?.total_amount || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Confirmation Banner */}
      <div className="bg-emerald-600 dark:bg-emerald-700 text-white rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-3 relative overflow-hidden">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <h1 className="text-xl sm:text-3xl font-black tracking-tight">
          Thank You for Your Order!
        </h1>
        <p className="text-emerald-100 text-xs sm:text-sm max-w-lg mx-auto">
          Your order has been confirmed and is being packaged for insured express dispatch. A detailed tax invoice has been generated below.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-2 sm:gap-3 text-xs font-mono">
          <span className="px-3 py-1 bg-emerald-700/80 rounded-full border border-emerald-500/40">
            Order Reference: #{orderId}
          </span>
          <span className="px-3 py-1 bg-emerald-700/80 rounded-full border border-emerald-500/40">
            Transaction: {transactionId}
          </span>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-8 shadow-sm space-y-6 sm:space-y-8 print:border-none print:shadow-none">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">VORTEX Hardware Labs</span>
              <Badge variant="success" size="sm">Paid & Confirmed</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Official Tax Invoice & Serialized Warranty Record</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Invoice
            </button>
            <Link
              to="/my-orders"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors shadow-sm"
            >
              <Package className="w-4 h-4" />
              View Orders
            </Link>
          </div>
        </div>

        {/* 3 Meta Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Order Details</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-white font-mono">Order #{orderId}</p>
            <p className="text-slate-500 dark:text-slate-400">Date: {new Date(order?.orderDate || order?.order_date || Date.now()).toLocaleDateString()}</p>
            <p className="text-slate-500 dark:text-slate-400">Status: <strong className="text-emerald-600 dark:text-emerald-400">{order?.orderStatus || order?.order_status || 'PROCESSING'}</strong></p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Shipping Address</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-white">{address.fullName || address.full_name || 'Customer'}</p>
            <p className="text-slate-500 dark:text-slate-400 truncate">{address.addressLine1 || address.address_line1}</p>
            <p className="text-slate-500 dark:text-slate-400">{address.city}, {address.state} - {address.pincode}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Payment Details</span>
            </div>
            <p className="font-semibold text-slate-900 dark:text-white">Method: {paymentMethod}</p>
            <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px] truncate">TXN: {transactionId}</p>
            <p className="text-emerald-600 dark:text-emerald-400 font-bold">Status: {paymentStatus}</p>
          </div>
        </div>

        {/* Items Table with horizontal scrolling on mobile */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Itemized Hardware Summary
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Guaranteed Price Protection
            </span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Item & Configuration</th>
                  <th className="py-3 px-4 text-center">Unit Price</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orderItems.map((it, idx) => (
                  <tr key={it.orderItemId || it.order_item_id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{it.productName || it.product_name}</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{it.variantDetails || it.variant_details}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300 font-mono">
                      {formatPrice(it.unitPrice || it.unit_price)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {it.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white font-mono">
                      {formatPrice(it.totalPrice || it.total_price || (it.unitPrice || it.unit_price) * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200 font-mono">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>GST (18%):</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200 font-mono">{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Insured Shipping:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200 font-mono">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
              <span>Total Paid:</span>
              <span className="text-base text-slate-900 dark:text-emerald-400 font-black font-mono">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
