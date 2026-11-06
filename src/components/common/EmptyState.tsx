import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center text-center px-6 py-14">
    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-500">
      {icon}
    </div>
    <h2 className="font-serif text-lg font-bold text-neutral-900">{title}</h2>
    <p className="text-sm text-neutral-600 max-w-sm mt-1">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);
