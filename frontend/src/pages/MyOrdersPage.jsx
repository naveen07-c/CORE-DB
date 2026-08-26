import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, ChevronDown, ChevronUp, ExternalLink, ShieldCheck, Truck, Clock, CheckCircle2 } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuthStore } from '../store/useAuthStore';
import { Loader } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';
import { getProductImage } from '../utils/productImages';

export const MyOrdersPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const res = await orderService.getOrders();
        const data = res.data || res || [];
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [isAuthenticated]);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="success" size="md">Delivered</Badge>;
      case 'SHIPPED':
        return <Badge variant="info" size="md">Shipped</Badge>;
      case 'PROCESSING':
        return <Badge variant="primary" size="md">Processing</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" size="md">Cancelled</Badge>;
      default:
        return <Badge variant="warning" size="md">{status || 'Pending'}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
        <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Sign In to View Orders</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Access your verified purchase history, tracking status, and invoices.</p>
        <Link to="/login" className="inline-block px-5 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 rounded-xl">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <Loader size="lg" text="Loading your purchase history & order tracking..." />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Orders & Invoices</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review your previous orders, print invoices, and track courier dispatch status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4">
          <Package className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
            Browse our catalog to select workstations, headphones, and devices.
          </p>
          <Link
            to="/catalog"
            className="inline-block px-5 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 rounded-xl shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const orderId = order.orderId || order.order_id;
            const isExpanded = expandedOrderId === orderId;
            const items = order.items || order.order_items || [];

            return (
              <div
                key={orderId}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : orderId)}
                  className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-emerald-400 font-bold flex-shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                          Order #{orderId}
                        </span>
                        {getStatusBadge(order.orderStatus || order.order_status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(order.orderDate || order.order_date || Date.now()).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Paid</span>
                      <span className="text-base font-black text-slate-900 dark:text-emerald-400 font-mono">
                        {formatPrice(order.totalAmount || order.total_amount)}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Item Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Purchased Items & Configuration
                      </span>
                      <Link
                        to={`/orders/success/${orderId}`}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        View Full Invoice Receipt
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                      {items.map((item, idx) => {
                        const pName = item.productName || item.product_name || 'Product';
                        const vDetails = item.variantDetails || item.variant_details || item.sku || 'Standard';
                        const uPrice = item.unitPrice || item.unit_price || item.price || 0;
                        const tPrice = item.totalPrice || item.total_price || (uPrice * item.quantity);
                        const prodId = item.productId || item.product_id;
                        const varId = item.variantId || item.variant_id;
                        const imgUrl = getProductImage(prodId, varId);

                        return (
                          <div
                            key={item.orderItemId || item.order_item_id || idx}
                            className="p-4 flex items-center justify-between text-xs gap-4"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 p-1.5 flex-shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <img
                                  src={imgUrl}
                                  alt={pName}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&q=80';
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                {prodId ? (
                                  <Link
                                    to={`/product/${prodId}`}
                                    className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate block"
                                  >
                                    {pName}
                                  </Link>
                                ) : (
                                  <p className="font-bold text-slate-900 dark:text-white truncate">{pName}</p>
                                )}
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
                                    {vDetails}
                                  </span>
                                  {item.sku && (
                                    <span className="text-[10px] font-mono text-slate-400">
                                      SKU: {item.sku}
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-400 text-[11px] mt-1 font-mono">
                                  Unit Price: {formatPrice(uPrice)} × {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm flex-shrink-0">
                              {formatPrice(tPrice)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
