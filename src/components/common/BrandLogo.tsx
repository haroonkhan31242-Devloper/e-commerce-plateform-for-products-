import React from 'react';

export const BrandLogo: React.FC<{ className?: string }> = ({ className = 'h-8' }) => (
  <span className={`inline-flex shrink-0 ${className}`}>
    <img src="/logo.png" alt="" width={268} height={349} className="h-full w-auto" />
  </span>
);
