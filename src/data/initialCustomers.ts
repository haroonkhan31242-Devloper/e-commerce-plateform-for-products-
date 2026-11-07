import { STORE_COUNTRY } from './storeSettings.ts';
import { CustomerProfile, DeliveryInfo } from '../types/index.ts';

const demoSavedAddress: DeliveryInfo = {
  country: STORE_COUNTRY,
  city: 'Karachi',
  address: 'House 14-B, Street 7, DHA Phase 6',
  postalCode: '75500',
  shippingOption: 'express',
  shippingCost: 4170,
};

export const initialCustomerProfile: CustomerProfile = {
  id: 'cust-1',
  name: 'Victoria Vance',
  email: 'victoria.vance@example.com',
  phone: '+92 300 3498821',
  savedAddresses: [demoSavedAddress],
  totalOrders: 3,
  totalSpent: 233520,
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
