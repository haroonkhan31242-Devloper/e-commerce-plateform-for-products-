import React from 'react';

interface BrandLogoProps {
  className?: string;
  onDark?: boolean;
}

// logo.png has a white background, so dark surfaces show it on a matching white tile
export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'h-8', onDark = false }) => (
  <span className={`inline-flex shrink-0 ${onDark ? 'bg-white rounded-lg p-1' : ''} ${className}`}>
    <img src="/logo.png" alt="" width={268} height={349} className="h-full w-auto" />
  </span>
);
