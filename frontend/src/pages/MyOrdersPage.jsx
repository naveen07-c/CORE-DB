import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, ChevronDown, ChevronUp, ExternalLink, ShieldCheck, Truck, Clock, CheckCircle2 } from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuthStore } from '../store/useAuthStore';
import { Loader } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';

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
      case 'CONFIRMED':
        return <Badge variant="success" size="md">{status === 'CONFIRMED' ? 'Confirmed' : 'Delivered'}</Badge>;
      case 'SHIPPED':
        return <Badge variant="info" size="md">Shipped</Badge>;
      case 'PENDING':
        return <Badge variant="primary" size="md">Pending</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" size="md">Cancelled</Badge>;
      default:
        return <Badge variant="warning" size="md">{status || 'Pending'}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border-2 border-ink/10 shadow-card text-center space-y-4">
        <Package className="w-12 h-12 text-ink/20 mx-auto" />
        <h2 className="text-xl font-bold text-ink">Sign in to view your orders</h2>
        <p className="text-sm text-ink/50">Your purchase history and receipts live here.</p>
        <Link to="/login" className="btn-primary mx-auto">
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
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">My Orders</h1>
        <p className="text-sm text-ink/50 mt-1">
          Your purchase history, receipts, and delivery status — all in one place.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-ink/15 p-12 text-center space-y-4">
          <Package className="w-16 h-16 text-ink/15 mx-auto" />
          <h3 className="text-base font-bold text-ink">No orders yet</h3>
          <p className="text-xs text-ink/40 max-w-sm mx-auto">
            When you place an order it will show up here with its receipt.
          </p>
          <Link to="/catalog" className="btn-primary mx-auto">
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
                className="bg-white rounded-3xl border-2 border-ink/10 shadow-card overflow-hidden transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : orderId)}
                  className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-peach/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cream border-2 border-ink/10 flex items-center justify-center text-brand-600 font-bold flex-shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-ink">
                          Order #{orderId}
                        </span>
                        {getStatusBadge(order.orderStatus || order.order_status)}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-ink/40 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(order.orderDate || order.order_date || Date.now()).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-ink/40 block">Total Paid</span>
                      <span className="text-base font-black text-ink font-mono">
                        {formatPrice(order.totalAmount || order.total_amount)}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-cream border border-ink/10 text-ink/60">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Item Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-ink/5 space-y-4 bg-cream/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-ink uppercase tracking-wider">
                        Purchased Items
                      </span>
                      <Link
                        to={`/orders/success/${orderId}`}
                        className="text-brand-600 font-bold hover:underline flex items-center gap-1"
                      >
                        View Receipt
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="bg-white rounded-2xl border border-ink/10 overflow-hidden divide-y divide-ink/5">
                      {items.map((item, idx) => (
                        <div
                          key={item.orderItemId || item.order_item_id || idx}
                          className="p-4 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-ink">{item.productName || item.product_name}</p>
                            <p className="text-[11px] text-ink/40 mt-0.5">
                              {formatPrice(item.price ?? item.unitPrice ?? item.unit_price ?? 0)} × {item.quantity}
                            </p>
                          </div>
                          <span className="font-bold text-ink font-mono">
                            {formatPrice(item.totalPrice || item.total_price)}
                          </span>
                        </div>
                      ))}
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
