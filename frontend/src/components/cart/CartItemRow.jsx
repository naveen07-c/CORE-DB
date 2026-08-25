import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { getProductImage } from '../../utils/productImages';

export const CartItemRow = ({ item, onUpdateQuantity, onRemove, readOnly = false }) => {
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const id = item.cartItemId || item.cart_item_id;
  const name = item.productName || item.name || 'Product';
  const variantDetails = item.variantDetails || item.sku || 'Standard';
  const unitPrice = Number(item.unitPrice || item.price || 0);
  const quantity = Number(item.quantity || 1);
  const totalPrice = Number(item.totalPrice || unitPrice * quantity);
  const stockAvailable = item.stockAvailable ?? item.stock_quantity ?? 99;
  const variantId = item.variantId;
  const productId = item.productId;
  const imageUrl = getProductImage(productId, variantId);

  return (
    <div className="py-3.5 border-b border-gray-100 last:border-0">
      <div className="flex gap-3 items-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-100 p-2 flex-shrink-0 flex items-center justify-center border border-gray-200">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&q=80';
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-gray-900 truncate">{name}</h4>
          <p className="text-[10px] sm:text-[11px] font-mono font-medium text-gray-500 truncate mt-0.5">{variantDetails}</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xs font-bold text-gray-700 font-mono">{formatPrice(unitPrice)}</span>
            <span className="text-[10px] text-gray-400">each</span>
          </div>
        </div>

        <div className="hidden sm:block text-right min-w-[70px]">
          <span className="text-xs font-black text-gray-900 font-mono">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 sm:border-0 sm:mt-0 sm:pt-0 sm:justify-end sm:gap-4">
        {!readOnly ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
              <button
                type="button"
                onClick={() => onUpdateQuantity(id, quantity - 1)}
                className="p-1 sm:p-1.5 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 sm:w-7 text-center text-xs font-bold text-gray-800">{quantity}</span>
              <button
                type="button"
                disabled={quantity >= stockAvailable}
                onClick={() => onUpdateQuantity(id, quantity + 1)}
                className="p-1 sm:p-1.5 text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onRemove(id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-500">Qty: {quantity}</span>
        )}

        <div className="sm:hidden text-right">
          <span className="text-xs font-black text-gray-900 font-mono">{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
};