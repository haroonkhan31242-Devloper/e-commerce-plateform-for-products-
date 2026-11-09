import React, { useEffect, useState } from 'react';
import { ShoppingBag, MapPin, LogOut, ArrowRight, Trash2, Plus } from 'lucide-react';
import { STORE_COUNTRY } from '../../data/storeSettings.ts';
import { useStore } from '../../context/StoreContext.tsx';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { EmptyState } from '../../components/common/EmptyState.tsx';
import { DeliveryInfo } from '../../types/index.ts';
import { isRevenueOrder, PAYMENT_METHOD_LABELS } from '../../utils/orders.ts';
import { isValidPhone } from '../../utils/validation.ts';
import { CustomerAuthPage, CustomerAuthMode } from './CustomerAuthPage.tsx';

type AccountTab = 'orders' | 'profile' | 'addresses';

const inputClasses =
  'w-full px-3 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 bg-white';
const labelClasses = 'block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1';

const EMPTY_ADDRESS = { country: STORE_COUNTRY, city: '', address: '', postalCode: '' };

export const CustomerAccountPage: React.FC = () => {
  const {
    customerUser,
    customerLogout,
    updateCustomerProfile,
    orders,
    formatPrice,
    browseAllProducts,
    trackOrder,
    showToast,
  } = useStore();

  const [authMode, setAuthMode] = useState<CustomerAuthMode>('login');
  const [activeTab, setActiveTab] = useState<AccountTab>('orders');

  const [profileName, setProfileName] = useState(customerUser?.name ?? '');
  const [profilePhone, setProfilePhone] = useState(customerUser?.phone ?? '');
  const [profileErrors, setProfileErrors] = useState<{ name?: string; phone?: string }>({});

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS);
  const [addressError, setAddressError] = useState<string | null>(null);

  // A customer who signs in on this page sees their own details in the forms
  useEffect(() => {
    setProfileName(customerUser?.name ?? '');
    setProfilePhone(customerUser?.phone ?? '');
    setProfileErrors({});
    // Only a different account needs a reset; edits to the same profile keep the form as typed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerUser?.id]);

  if (!customerUser) {
    return <CustomerAuthPage mode={authMode} embedded onModeChange={setAuthMode} />;
  }

  const customerOrders = orders.filter((o) => o.customer.email.toLowerCase() === customerUser.email.toLowerCase());
  const totalSpent = customerOrders.filter(isRevenueOrder).reduce((sum, o) => sum + o.grandTotal, 0);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof profileErrors = {};
    if (!profileName.trim()) errors.name = 'Enter your full name.';
    if (profilePhone.trim() && !isValidPhone(profilePhone)) errors.phone = 'Enter a phone number with at least 7 digits.';
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    updateCustomerProfile({ name: profileName.trim(), phone: profilePhone.trim() });
    showToast('success', 'Your details have been updated.');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.address.trim() || !newAddress.city.trim() || !newAddress.postalCode.trim()) {
      setAddressError('Enter the street address, city, and postal code.');
      return;
    }

    const address: DeliveryInfo = { ...newAddress, shippingOption: 'standard', shippingCost: 0 };
    updateCustomerProfile({ savedAddresses: [...customerUser.savedAddresses, address] });
    setNewAddress(EMPTY_ADDRESS);
    setAddressError(null);
    setIsAddingAddress(false);
    showToast('success', 'Address saved.');
  };

  const handleRemoveAddress = (index: number) => {
    updateCustomerProfile({ savedAddresses: customerUser.savedAddresses.filter((_, i) => i !== index) });
    showToast('info', 'Address removed.');
  };

  const tabs: { id: AccountTab; label: string }[] = [
    { id: 'orders', label: `My Orders (${customerOrders.length})` },
    { id: 'profile', label: 'Account Details' },
    { id: 'addresses', label: `Addresses (${customerUser.savedAddresses.length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      <div className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-amber-400 font-serif font-bold text-2xl flex items-center justify-center shrink-0">
            {customerUser.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold text-neutral-900 truncate">{customerUser.name}</h1>
            <p className="text-sm text-neutral-600 truncate">{customerUser.email}</p>
            <p className="text-xs text-neutral-500 mt-0.5">Lifetime spend: {formatPrice(totalSpent)}</p>
          </div>
        </div>

        <button
          onClick={customerLogout}
          className="px-4 py-2.5 border border-neutral-300 text-rose-700 text-xs font-semibold rounded-xl hover:bg-rose-50 flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>

      <div role="tablist" aria-label="Account sections" className="flex gap-2 overflow-x-auto no-scrollbar border-b border-neutral-200 pb-2 text-xs font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap ${
              activeTab === tab.id ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in">
          {customerOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200">
              <EmptyState
                icon={<ShoppingBag className="w-7 h-7" aria-hidden="true" />}
                title="No orders yet"
                description="When you place an order, you can follow its progress here."
                action={
                  <button
                    onClick={browseAllProducts}
                    className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800"
                  >
                    Start Shopping
                  </button>
                }
              />
            </div>
          ) : (
            customerOrders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                  <div>
                    <h2 className="font-mono text-sm font-bold text-neutral-900">{ord.orderNumber}</h2>
                    <span className="text-xs text-neutral-500">{new Date(ord.date).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={ord.orderStatus} />
                    <button
                      onClick={() => trackOrder(ord.id)}
                      className="px-3 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 flex items-center gap-1"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {ord.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2 bg-neutral-50 rounded-xl border border-neutral-100 min-w-0">
                      <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-10 h-12 object-cover rounded-lg bg-neutral-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900 truncate">{item.productName}</p>
                        <p className="text-neutral-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-sm">
                  <span className="text-neutral-600">{PAYMENT_METHOD_LABELS[ord.paymentMethod]}</span>
                  <span className="font-bold text-neutral-900">Total: {formatPrice(ord.grandTotal)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <form
          onSubmit={handleProfileSave}
          noValidate
          className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-8 max-w-xl space-y-4 animate-in fade-in"
        >
          <h2 className="font-serif text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">
            Personal Information
          </h2>

          <div>
            <label htmlFor="profile-name" className={labelClasses}>
              Full name *
            </label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              value={profileName}
              aria-invalid={!!profileErrors.name}
              onChange={(e) => setProfileName(e.target.value)}
              className={inputClasses}
            />
            {profileErrors.name && (
              <p role="alert" className="text-xs text-rose-700 mt-1">
                {profileErrors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="profile-email" className={labelClasses}>
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={customerUser.email}
              readOnly
              className={`${inputClasses} bg-neutral-50 text-neutral-600`}
            />
          </div>

          <div>
            <label htmlFor="profile-phone" className={labelClasses}>
              Phone
            </label>
            <input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              value={profilePhone}
              aria-invalid={!!profileErrors.phone}
              onChange={(e) => setProfilePhone(e.target.value)}
              className={inputClasses}
            />
            {profileErrors.phone && (
              <p role="alert" className="text-xs text-rose-700 mt-1">
                {profileErrors.phone}
              </p>
            )}
          </div>

          <p className="text-xs text-neutral-500">Customer since {customerUser.createdAt}</p>

          <button
            type="submit"
            className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800"
          >
            Save Changes
          </button>
        </form>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerUser.savedAddresses.map((addr, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-6 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-amber-800 text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    {idx === 0 ? 'Default address' : 'Saved address'}
                  </span>
                  <button
                    onClick={() => handleRemoveAddress(idx)}
                    aria-label={`Remove address ${addr.address}`}
                    className="p-1.5 text-neutral-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="font-semibold text-neutral-900">{addr.address}</p>
                <p className="text-neutral-600">
                  {addr.city}, {addr.postalCode}
                </p>
                <p className="text-neutral-600">{addr.country}</p>
              </div>
            ))}
          </div>

          {isAddingAddress ? (
            <form
              onSubmit={handleAddAddress}
              noValidate
              className="bg-white rounded-3xl border border-neutral-200 p-5 sm:p-6 max-w-xl space-y-3 animate-in fade-in"
            >
              <div>
                <label htmlFor="address-line" className={labelClasses}>
                  Street address *
                </label>
                <input
                  id="address-line"
                  type="text"
                  autoComplete="street-address"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="address-city" className={labelClasses}>
                    City *
                  </label>
                  <input
                    id="address-city"
                    type="text"
                    autoComplete="address-level2"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="address-postal" className={labelClasses}>
                    Postal code *
                  </label>
                  <input
                    id="address-postal"
                    type="text"
                    autoComplete="postal-code"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    className={inputClasses}
                  />
                </div>
              </div>
              {addressError && (
                <p role="alert" className="text-xs text-rose-700">
                  {addressError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingAddress(false);
                    setAddressError(null);
                  }}
                  className="px-5 py-2.5 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingAddress(true)}
              className="px-4 py-2.5 border border-neutral-300 text-neutral-800 text-xs font-semibold rounded-xl hover:bg-neutral-100 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add Address</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
