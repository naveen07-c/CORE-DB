import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500">
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-brand-600`} />
      {text && <p className="mt-3 text-sm font-medium text-slate-600">{text}</p>}
    </div>
  );
};

export const Skeleton = ({ className = '' }) => {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col">
      <Skeleton className="w-full aspect-square rounded-xl mb-4" />
      <Skeleton className="h-4 w-1/3 mb-2" />
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-50">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>
  );
};
