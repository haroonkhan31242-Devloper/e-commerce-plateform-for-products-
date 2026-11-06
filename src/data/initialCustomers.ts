import { CustomerProfile, DeliveryInfo } from '../types/index.ts';

const demoSavedAddress: DeliveryInfo = {
  country: 'United States',
  city: 'New York',
  address: '742 Evergreen Terrace, Apt 14B',
  postalCode: '10021',
  shippingOption: 'express',
  shippingCost: 15,
};

export const initialCustomerProfile: CustomerProfile = {
  id: 'cust-1',
  name: 'Victoria Vance',
  email: 'victoria.vance@example.com',
  phone: '+1 (555) 349-8821',
  savedAddresses: [demoSavedAddress],
  totalOrders: 3,
  totalSpent: 840,
  createdAt: '2026-03-15',
};

export const createDemoCustomerProfile = (email: string, name?: string): CustomerProfile => ({
  id: `cust-${Date.now()}`,
  name: name || email.split('@')[0],
  email,
  phone: '',
  savedAddresses: [],
  totalOrders: 0,
  totalSpent: 0,
  createdAt: new Date().toISOString().split('T')[0],
});
