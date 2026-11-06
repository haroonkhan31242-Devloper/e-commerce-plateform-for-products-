import React from 'react';

interface BrandLogoProps {
  className?: string;
  onDark?: boolean;
}

// The logo has dark shapes, so dark surfaces need the white tile to keep it visible
export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'w-8 h-8', onDark = false }) => (
  <span className={`inline-flex shrink-0 ${onDark ? 'bg-white rounded-[22%] p-1' : ''} ${className}`}>
    <img src="/logo.webp" alt="" width={64} height={64} className="w-full h-full object-contain" />
  </span>
);
