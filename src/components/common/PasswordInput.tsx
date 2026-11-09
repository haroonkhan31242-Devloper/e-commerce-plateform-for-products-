import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

// Password field with a show/hide toggle. Styling comes from the caller's className so it
// fits both the storefront and the Admin Panel.
export const PasswordInput: React.FC<PasswordInputProps> = ({ className = '', ...props }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={isVisible ? 'text' : 'password'} className={`${className} pr-12`} />
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        {isVisible ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
      </button>
    </div>
  );
};
