import React, { useMemo } from 'react';
import { Check, AlertTriangle, XCircle, CheckCircle2, Shield } from 'lucide-react';
import { Badge } from '../common/Badge';

export const VariantSelector = ({
  variants = [],
  selectedVariant,
  onSelectVariant,
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  // Extract unique attribute lists
  const colors = useMemo(() => {
    const set = new Set();
    variants.forEach((v) => {
      if (v.color) set.add(v.color);
    });
    return Array.from(set);
  }, [variants]);

  const sizes = useMemo(() => {
    const set = new Set();
    variants.forEach((v) => {
      if (v.size) set.add(v.size);
    });
    return Array.from(set);
  }, [variants]);

  const storages = useMemo(() => {
    const set = new Set();
    variants.forEach((v) => {
      if (v.storage) set.add(v.storage);
    });
    return Array.from(set);
  }, [variants]);

  // Handler to pick variant when an attribute changes
  const handleAttributeChange = (attributeType, value) => {
    const currentColor = attributeType === 'color' ? value : selectedVariant?.color;
    const currentSize = attributeType === 'size' ? value : selectedVariant?.size;
    const currentStorage = attributeType === 'storage' ? value : selectedVariant?.storage;

    let matched = variants.find((v) => {
      const matchColor = currentColor ? v.color === currentColor : true;
      const matchSize = currentSize ? v.size === currentSize : true;
      const matchStorage = currentStorage ? v.storage === currentStorage : true;
      return matchColor && matchSize && matchStorage;
    });

    if (!matched) {
      matched = variants.find((v) => v[attributeType] === value);
    }

    if (matched) {
      onSelectVariant(matched);
    }
  };

  const stock = selectedVariant?.stockQuantity ?? selectedVariant?.stock_quantity ?? 0;
  const isOutOfStock = stock === 0;

  return (
    <div className="space-y-6">
      {/* 1. Color Selection */}
      {colors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Color: <span className="text-slate-600 font-semibold normal-case ml-1">{selectedVariant?.color || 'Select'}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isSelected = selectedVariant?.color === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleAttributeChange('color', color)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Size Selection */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Size / Display: <span className="text-slate-600 font-semibold normal-case ml-1">{selectedVariant?.size || 'Select'}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = selectedVariant?.size === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleAttributeChange('size', size)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Storage / Configuration Selection */}
      {storages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Storage / Specs: <span className="text-slate-600 font-semibold normal-case ml-1">{selectedVariant?.storage || 'Select'}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {storages.map((storage) => {
              const isSelected = selectedVariant?.storage === storage;
              return (
                <button
                  key={storage}
                  type="button"
                  onClick={() => handleAttributeChange('storage', storage)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  {storage}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Direct Variant Card Selector */}
      {variants.length > 1 && (
        <div className="pt-2">
          <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Available SKU Variations</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {variants.map((v) => {
              const isSelected = (v.variantId || v.variant_id) === (selectedVariant?.variantId || selectedVariant?.variant_id);
              const label = [v.color, v.size, v.storage].filter(Boolean).join(' / ') || v.sku;
              const vStock = v.stockQuantity ?? v.stock_quantity ?? 0;
              const vPrice = v.price;

              return (
                <button
                  key={v.variantId || v.variant_id || v.sku}
                  type="button"
                  onClick={() => onSelectVariant(v)}
                  className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-50 border-slate-900 shadow-sm ring-1 ring-slate-900'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{label}</span>
                    <span className="text-xs font-black text-slate-900 font-mono ml-2">
                      ${Number(vPrice).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
                    <span className="font-mono text-slate-500">SKU: {v.sku}</span>
                    <span className={vStock > 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                      {vStock > 0 ? `${vStock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected SKU & Inventory Status Card */}
      {selectedVariant && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">
                SKU: <strong className="text-slate-900 font-bold">{selectedVariant.sku}</strong>
              </span>
            </div>

            {/* Inventory Status Pill */}
            {stock > 5 ? (
              <Badge variant="success" size="md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                In Stock ({stock} available)
              </Badge>
            ) : stock > 0 ? (
              <Badge variant="warning" size="md">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Hurry! Only {stock} left
              </Badge>
            ) : (
              <Badge variant="danger" size="md">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                Out of Stock
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Price Snapshot Guaranteed on Order Placement</span>
          </div>
        </div>
      )}
    </div>
  );
};
