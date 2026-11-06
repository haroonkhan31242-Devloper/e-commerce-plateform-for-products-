import React from 'react';

// logo.webp stacks the bag above the name. The name is set as text beside the logo so it
// stays readable at small sizes, so only the bag area of the file is shown here.
export const BrandLogo: React.FC<{ className?: string }> = ({ className = 'h-8' }) => (
  <span className={`relative inline-block shrink-0 overflow-hidden aspect-[763/1017] ${className}`}>
    <img
      src="/logo.webp"
      alt=""
      width={2000}
      height={1994}
      className="absolute max-w-none h-auto w-[262.1%] left-[-80.9%] top-[-5.5%]"
    />
  </span>
);
