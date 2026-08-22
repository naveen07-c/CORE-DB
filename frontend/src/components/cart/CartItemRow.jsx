import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';

export const CartItemRow = ({ item, onUpdateQuantity, onRemove, readOnly = false }) => {
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const id = item.cartItemId || item.cart_item_id;
  const name = item.productName || item.product_name || item.name || 'Product';
  const variantDetails = item.variantDetails || item.variant_details || item.sku || 'Standard';
  const unitPrice = Number(item.unitPrice || item.unit_price || item.price || 0);
  const quantity = Number(item.quantity || 1);
  const totalPrice = Number(item.totalPrice || item.total_price || unitPrice * quantity);
  const stockAvailable = item.stockAvailable ?? item.stock_available ?? item.stock_quantity ?? 99;
  const imageUrl = item.imageUrl || item.image_url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=300&q=80';

  return (
    <div className="py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex gap-3 items-center">
        {/* Thumbnail */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 dark:bg-slate-800 p-2 flex-shrink-0 flex items-center justify-center border border-slate-200/60 dark:border-slate-700">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80';
            }}
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{name}</h4>
          <p className="text-[10px] sm:text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">{variantDetails}</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{formatPrice(unitPrice)}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">each</span>
          </div>
        </div>

        {/* Total Price (on larger viewports) */}
        <div className="hidden sm:block text-right min-w-[70px]">
          <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      {/* Mobile-optimized action & subtotal row */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/60 sm:border-0 sm:mt-0 sm:pt-0 sm:justify-end sm:gap-4">
        {!readOnly ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => onUpdateQuantity(id, quantity - 1)}
                className="p-1 sm:p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 sm:w-7 text-center text-xs font-bold text-slate-800 dark:text-slate-200">{quantity}</span>
              <button
                type="button"
                disabled={quantity >= stockAvailable}
                onClick={() => onUpdateQuantity(id, quantity + 1)}
                className="p-1 sm:p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onRemove(id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-500 dark:text-slate-400">Qty: {quantity}</span>
        )}

        {/* Mobile item total */}
        <div className="sm:hidden text-right">
          <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
};
