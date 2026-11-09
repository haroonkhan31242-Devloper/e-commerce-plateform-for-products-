// Central Admin Panel access rules. Every place that shows, routes to or acts on an Admin
// Panel section asks these helpers rather than checking roles itself.
//
// These checks only shape the interface of a frontend prototype; they are not a security
// boundary. Real authorization must be enforced by the server once one exists.

import { AdminTab, StaffSection } from '../types/index.ts';

export interface AdminSectionInfo {
  tab: StaffSection;
  label: string;
  description: string;
}

// Sections that can be assigned to staff, in sidebar order. Assigning a section grants full
// access to everything inside it.
export const STAFF_SECTIONS: AdminSectionInfo[] = [
  { tab: 'overview', label: 'Dashboard', description: 'Sales figures and recent orders' },
  { tab: 'orders', label: 'Orders', description: 'Confirm, update, label and ship orders' },
  { tab: 'products', label: 'Products', description: 'Add, edit and remove products' },
  { tab: 'categories', label: 'Categories', description: 'Store categories and subcategories' },
  { tab: 'hero-slider', label: 'Hero Slider', description: 'Home page banner slides' },
  { tab: 'inventory', label: 'Inventory', description: 'Stock levels and adjustments' },
  { tab: 'customers', label: 'Customers', description: 'Customer list and order history' },
  { tab: 'payments', label: 'Payments', description: 'Verify bank transfers and payment status' },
  { tab: 'shipping', label: 'Shipping', description: 'Delivery rates and options' },
  { tab: 'reviews', label: 'Reviews', description: 'Approve, hide and delete reviews' },
  { tab: 'settings', label: 'Store Settings', description: 'Store details and payment settings' },
];

// Only the Main Admin can open these
export const MAIN_ADMIN_ONLY_TABS: AdminTab[] = ['staff'];

export const ALL_ADMIN_TABS: AdminTab[] = [...STAFF_SECTIONS.map((section) => section.tab), 'staff'];

export const ADMIN_TAB_LABELS: Record<AdminTab, string> = {
  ...(Object.fromEntries(STAFF_SECTIONS.map((section) => [section.tab, section.label])) as Record<StaffSection, string>),
  overview: 'Overview',
  staff: 'Staff Management',
};

const STAFF_SECTION_SET = new Set<AdminTab>(STAFF_SECTIONS.map((section) => section.tab));

export const isStaffSection = (value: unknown): value is StaffSection =>
  typeof value === 'string' && STAFF_SECTION_SET.has(value as AdminTab);

// What the current Admin Panel user may open: null when nobody is signed in
export type AdminAccess = { role: 'admin' } | { role: 'staff'; sections: readonly StaffSection[] };

export const canAccessTab = (access: AdminAccess | null, tab: AdminTab): boolean => {
  if (!access) return false;
  if (access.role === 'admin') return true;
  return !MAIN_ADMIN_ONLY_TABS.includes(tab) && access.sections.includes(tab as StaffSection);
};

export const getAccessibleTabs = (access: AdminAccess | null): AdminTab[] =>
  ALL_ADMIN_TABS.filter((tab) => canAccessTab(access, tab));
