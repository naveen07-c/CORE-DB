import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-brand-500`} />
      {text && <p className="mt-3 text-sm font-medium text-ink/50">{text}</p>}
    </div>
  );
};

export const Skeleton = ({ className = '' }) => {
  return <div className={`animate-pulse bg-ink/10 rounded-lg ${className}`} />;
};

export default Loader;
