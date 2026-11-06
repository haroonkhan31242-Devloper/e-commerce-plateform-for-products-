import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Boxes,
  Users,
  CreditCard,
  Tag,
  Truck,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { AdminTab } from '../../types/index.ts';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onCloseMobile,
}) => {
  const { orders, products, setCurrentView, adminLogout } = useStore();

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending Confirmation').length;
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  const navItems: { tab: AdminTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { tab: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      tab: 'orders',
      label: 'Orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-amber-500 text-neutral-950',
    },
    { tab: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { tab: 'categories', label: 'Categories', icon: <Layers className="w-4 h-4" /> },
    {
      tab: 'inventory',
      label: 'Inventory',
      icon: <Boxes className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { tab: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { tab: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { tab: 'coupons', label: 'Coupons', icon: <Tag className="w-4 h-4" /> },
    { tab: 'shipping', label: 'Shipping', icon: <Truck className="w-4 h-4" /> },
    { tab: 'reviews', label: 'Reviews', icon: <MessageSquare className="w-4 h-4" /> },
    { tab: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-950/60 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-neutral-950 text-neutral-300 border-r border-neutral-800 flex flex-col justify-between transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Admin navigation"
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="h-11" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-base font-bold text-white tracking-wider">
                  STEROSE
                </span>
                <span className="text-[11px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">Store management</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  setActiveTab(item.tab);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-neutral-950' : 'text-neutral-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                      item.badgeColor || 'bg-neutral-800 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <button
            onClick={() => {
              setCurrentView('home');
            }}
            className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-between border border-neutral-800"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>View Store</span>
            </div>
          </button>

          <button
            onClick={adminLogout}
            className="w-full py-2 px-3 text-neutral-400 hover:text-rose-400 text-xs font-medium rounded-xl hover:bg-neutral-900 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
