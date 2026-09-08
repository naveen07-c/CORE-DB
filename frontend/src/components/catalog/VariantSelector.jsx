import React, { useMemo } from 'react';
import { Check, XCircle, CheckCircle2, Shield } from 'lucide-react';
import { Badge } from '../common/Badge';

const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

export const VariantSelector = ({
  variants = [],
  selectedVariant,
  onSelectVariant,
}) => {
  // Extract unique attribute lists (hooks must run before any early return)
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

  if (!variants || variants.length === 0) {
    return null;
  }

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

  const stock = selectedVariant?.stockQuantity ?? 0;
  const isOutOfStock = stock === 0;

  const attributeGroup = (label, options, attrKey) => {
    if (options.length === 0) return null;
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-ink uppercase tracking-wider">
            {label}:{' '}
            <span className="text-ink/60 font-semibold normal-case ml-1">
              {selectedVariant?.[attrKey] || 'Select'}
            </span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {options.map((value) => {
            const isSelected = selectedVariant?.[attrKey] === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleAttributeChange(attrKey, value)}
                className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-ink border-ink text-white shadow-md'
                    : 'bg-white border-ink/10 text-ink/70 hover:border-brand-400 hover:text-brand-600'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-lemon-400" />}
                {value}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Color Selection */}
      {attributeGroup('Color', colors, 'color')}

      {/* 2. Size Selection */}
      {attributeGroup('Size', sizes, 'size')}

      {/* 3. Storage / Configuration Selection */}
      {attributeGroup('Storage', storages, 'storage')}

      {/* Direct Variant Card Selector */}
      {variants.length > 1 && (
        <div className="pt-2">
          <p className="text-xs font-bold text-ink uppercase tracking-wider mb-2">Available variations</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {variants.map((v) => {
              const isSelected = v.variantId === selectedVariant?.variantId;
              const label = [v.color, v.size, v.storage].filter(Boolean).join(' / ') || v.sku;
              const vStock = v.stockQuantity ?? 0;

              return (
                <button
                  key={v.variantId || v.sku}
                  type="button"
                  onClick={() => onSelectVariant(v)}
                  className={`p-3.5 rounded-2xl text-left border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-peach/60 border-ink shadow-md'
                      : 'bg-white border-ink/10 hover:border-brand-300 hover:bg-peach/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-ink line-clamp-1">{label}</span>
                    <span className="text-xs font-black text-ink font-mono ml-2">
                      {formatPrice(v.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink/5 text-[10px]">
                    <span className="font-mono text-ink/40">SKU: {v.sku}</span>
                    <span className={vStock > 0 ? 'text-mint-600 font-bold' : 'text-red-600 font-bold'}>
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
        <div className="p-4 rounded-2xl bg-cream border-2 border-ink/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-ink/50">
                SKU: <strong className="text-ink font-bold">{selectedVariant.sku}</strong>
              </span>
            </div>

            {/* Inventory Status Pill */}
            {stock > 5 ? (
              <Badge variant="success" size="md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                In Stock ({stock} available)
              </Badge>
            ) : stock > 0 ? (
              <Badge variant="warning" size="md">
                <Check className="w-3.5 h-3.5" />
                Hurry! Only {stock} left
              </Badge>
            ) : (
              <Badge variant="danger" size="md">
                <XCircle className="w-3.5 h-3.5" />
                Out of Stock
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-ink/50">
            <Shield className="w-3.5 h-3.5 text-mint-600" />
            <span>Price locked in at the moment you place your order.</span>
          </div>
        </div>
      )}

      {isOutOfStock && (
        <p className="text-xs font-semibold text-red-600">
          This variation is sold out — pick another one above.
        </p>
      )}
    </div>
  );
};

export default VariantSelector;
