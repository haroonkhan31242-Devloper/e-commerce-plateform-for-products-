import React from 'react';
import { Search } from 'lucide-react';

interface AdminPanelProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  title,
  description,
  actions,
  className = '',
  children,
}) => (
  <div
    className={`bg-white rounded-3xl border border-neutral-200/80 p-4 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200 ${className}`}
  >
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
      <div>
        <h2 className="font-serif text-xl font-bold text-neutral-900">{title}</h2>
        <p className="text-xs text-neutral-500 mt-1">{description}</p>
      </div>
      {actions}
    </div>
    {children}
  </div>
);

interface AdminSearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
}

export const AdminSearchInput: React.FC<AdminSearchInputProps> = ({
  placeholder,
  value,
  onChange,
  className,
}) => (
  <div className={`relative ${className}`}>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
    />
    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
  </div>
);
