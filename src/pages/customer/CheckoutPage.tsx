import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Truck,
  CreditCard,
  Building2,
  DollarSign,
  Lock,
  Loader2,
} from 'lucide-react';
import { STORE_COUNTRY } from '../../data/storeSettings.ts';
import { useStore } from '../../context/StoreContext.tsx';
import { PaymentMethod, DeliveryInfo, CustomerInfo } from '../../types/index.ts';
import { submitOrder } from '../../services/storeApi.ts';
import { getAvailableStock } from '../../utils/product.ts';
import {
  isValidCardCvc,
  isValidCardExpiry,
  isValidCardNumber,
  isValidEmail,
  isValidPhone,
} from '../../utils/validation.ts';

type CheckoutStep = 1 | 2 | 3 | 4;

const selectable = (isSelected: boolean, onSelect: () => void) => ({
  role: 'radio',
  'aria-checked': isSelected,
  tabIndex: 0,
  onClick: onSelect,
  onKeyDown: (e: React.KeyboardEvent) => {
    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSelect();
    }
  },
});

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    getShippingCost,
    formatPrice,
    storeSettings,
    appliedCoupon,
    customerUser,
    placeOrder,
    browseAllProducts,
  } = useStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);

  // Step 1: Customer Info
  const [customerName, setCustomerName] = useState(customerUser?.name ?? '');
  const [customerEmail, setCustomerEmail] = useState(customerUser?.email ?? '');
  const [customerPhone, setCustomerPhone] = useState(customerUser?.phone ?? '');

  // Step 2: Delivery Info
  const savedAddress = customerUser?.savedAddresses[0];
  const [city, setCity] = useState(savedAddress?.city ?? '');
  const [address, setAddress] = useState(savedAddress?.address ?? '');
  const [postalCode, setPostalCode] = useState(savedAddress?.postalCode ?? '');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [shippingOption, setShippingOption] = useState<'standard' | 'express'>('standard');

  // Step 4: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [bankWireReference, setBankWireReference] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [isPlacing, setIsPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-neutral-900">Your bag is empty</h2>
        <p className="text-xs text-neutral-500">Add products to your cart before proceeding to checkout.</p>
        <button
          onClick={browseAllProducts}
          className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const effectiveShipping = getShippingCost(shippingOption);

  const finalGrandTotal = Math.max(0, cartSubtotal - cartDiscount + effectiveShipping);

  const showErrors = (errs: Record<string, string>) => {
    setErrors(errs);
    const hasErrors = Object.keys(errs).length > 0;
    if (hasErrors) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    }
    return !hasErrors;
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) errs.name = 'Enter your full name.';
    if (!isValidEmail(customerEmail)) errs.email = 'Enter a valid email address, for example name@example.com.';
    if (!isValidPhone(customerPhone)) errs.phone = 'Enter a phone number with at least 7 digits so the courier can reach you.';
    return showErrors(errs);
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!address.trim()) errs.address = 'Enter your street address.';
    if (!city.trim()) errs.city = 'Enter your city.';
    if (!postalCode.trim()) errs.postalCode = 'Enter your postal code.';
    return showErrors(errs);
  };

  const validatePayment = () => {
    const errs: Record<string, string> = {};
    if (paymentMethod === 'bank_transfer' && !bankWireReference.trim()) {
      errs.bankRef = 'Enter your bank transfer reference or transaction ID.';
    }
    if (paymentMethod === 'online_card') {
      if (!isValidCardNumber(cardNumber)) errs.cardNumber = 'Enter a card number of 13 to 19 digits.';
      if (!isValidCardExpiry(cardExpiry)) errs.cardExpiry = 'Enter a future expiry date as MM/YY.';
      if (!isValidCardCvc(cardCvc)) errs.cardCvc = 'Enter the 3 or 4 digit security code.';
    }
    return showErrors(errs);
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else {
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalOrderSubmit = async () => {
    if (!validatePayment()) return;

    const unavailableItem = cart.find(
      (item) => item.quantity > getAvailableStock(item.product, item.selectedVariations)
    );
    if (unavailableItem) {
      setErrors({ stock: `Only ${getAvailableStock(unavailableItem.product, unavailableItem.selectedVariations)} of "${unavailableItem.product.name}" remain. Update your bag to continue.` });
      return;
    }

    setIsPlacing(true);

    const customerInfo: CustomerInfo = {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      isGuest: !customerUser,
    };

    const deliveryInfo: DeliveryInfo = {
      country: STORE_COUNTRY,
      city,
      address,
      postalCode,
      deliveryInstructions,
      shippingOption,
      shippingCost: effectiveShipping,
    };

    const orderItems = cart.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku,
      image: item.product.thumbnail || item.product.images[0],
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
      selectedVariations: item.selectedVariations,
    }));

    try {
      await submitOrder();
      placeOrder({
        customer: customerInfo,
        delivery: deliveryInfo,
        items: orderItems,
        subtotal: cartSubtotal,
        discountAmount: cartDiscount,
        appliedCouponCode: appliedCoupon?.code,
        shippingCharge: effectiveShipping,
        grandTotal: finalGrandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'online_card' ? 'Paid' : 'Pending',
        bankTransferReference: paymentMethod === 'bank_transfer' ? bankWireReference : undefined,
      });
    } catch (error) {
      console.error('Order submission failed', error);
      setErrors({ stock: 'Your order could not be placed. You have not been charged. Please try again.' });
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="border-b border-neutral-200 pb-6">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 mb-6">Secure Checkout</h1>

        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            { num: 1, label: 'Customer Details' },
            { num: 2, label: 'Delivery Address' },
            { num: 3, label: 'Order Summary' },
            { num: 4, label: 'Payment Method' },
          ].map((step) => (
            <button
              key={step.num}
              disabled={step.num >= currentStep}
              aria-current={currentStep === step.num ? 'step' : undefined}
              aria-label={`Step ${step.num}: ${step.label}`}
              onClick={() => setCurrentStep(step.num as CheckoutStep)}
              className={`flex items-center gap-2 p-2 rounded-xl transition-all text-left ${
                currentStep === step.num
                  ? 'bg-neutral-900 text-white font-bold shadow-xs'
                  : currentStep > step.num
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'bg-neutral-100 text-neutral-500 font-medium'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  currentStep > step.num
                    ? 'bg-emerald-600 text-white'
                    : currentStep === step.num
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {currentStep > step.num ? <Check className="w-3.5 h-3.5" /> : step.num}
              </span>
              <span className="truncate hidden sm:inline">{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Wizard Form Steps */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-8 shadow-xs">
          {/* STEP 1: Customer Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="font-serif text-xl font-bold text-neutral-900">
                  Step 1: Customer Information
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  We use these details to send order and delivery updates.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="checkout-page-field-1" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    id="checkout-page-field-1"
                    type="text"
                    value={customerName}
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Victoria Vance"
                    className="w-full px-4 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                  />
                  {errors.name && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-page-field-2" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      id="checkout-page-field-2"
                      type="email"
                      value={customerEmail}
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. victoria@example.com"
                      className="w-full px-4 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                    />
                    {errors.email && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="checkout-page-field-3" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <input
                      id="checkout-page-field-3"
                      type="tel"
                      value={customerPhone}
                      autoComplete="tel"
                      aria-invalid={!!errors.phone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. +92 300 1234567"
                      className="w-full px-4 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                    />
                    {errors.phone && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    No account needed. You can sign in later to save addresses and see your order history.
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 flex items-center justify-center gap-2"
                >
                  <span>Continue to Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Information */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="font-serif text-xl font-bold text-neutral-900">
                  Step 2: Delivery & Shipping Address
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Tell us where to send your order.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-page-field-4" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Country
                    </label>
                    <input
                      id="checkout-page-field-4"
                      type="text"
                      value={STORE_COUNTRY}
                      readOnly
                      autoComplete="country-name"
                      className="w-full px-4 py-2.5 text-xs border border-neutral-200 rounded-xl bg-neutral-100 text-neutral-700 focus:outline-none cursor-default"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkout-page-field-5" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      City *
                    </label>
                    <input
                      id="checkout-page-field-5"
                      type="text"
                      value={city}
                      autoComplete="address-level2"
                      aria-invalid={!!errors.city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Karachi"
                      className="w-full px-4 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                    />
                    {errors.city && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.city}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="checkout-page-field-6" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Street Address & Apartment/Suite *
                  </label>
                  <input
                    id="checkout-page-field-6"
                    type="text"
                    value={address}
                    autoComplete="street-address"
                    aria-invalid={!!errors.address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. House 14-B, Street 7, DHA Phase 6"
                    className="w-full px-4 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                  />
                  {errors.address && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-page-field-7" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Postal / ZIP Code *
                    </label>
                    <input
                      id="checkout-page-field-7"
                      type="text"
                      value={postalCode}
                      autoComplete="postal-code"
                      aria-invalid={!!errors.postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 75500"
                      className="w-full px-4 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                    />
                    {errors.postalCode && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.postalCode}</p>}
                  </div>

                  <div>
                    <label htmlFor="checkout-page-field-8" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Special Delivery Instructions (Optional)
                    </label>
                    <input
                      id="checkout-page-field-8"
                      type="text"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="e.g. Leave with building doorman"
                      className="w-full px-4 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                {/* Shipping Speed Options */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                    Shipping Method
                  </p>
                  <div role="radiogroup" aria-label="Shipping method" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      {...selectable(shippingOption === 'standard', () => setShippingOption('standard'))}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        shippingOption === 'standard'
                          ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-neutral-900">Standard Delivery</span>
                        <span className="text-xs font-bold text-neutral-900">
                          {getShippingCost('standard') === 0 ? 'Free' : formatPrice(getShippingCost('standard'))}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        Estimated arrival: 3-5 business days via insured ground transport.
                      </p>
                    </div>

                    <div
                      {...selectable(shippingOption === 'express', () => setShippingOption('express'))}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        shippingOption === 'express'
                          ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-neutral-900">Priority Air Express</span>
                        <span className="text-xs font-bold text-neutral-900">
                          {getShippingCost('express') === 0 ? 'Free' : formatPrice(getShippingCost('express'))}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        Estimated arrival: 1-2 business days with priority handler signature.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-3 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-100 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 flex items-center justify-center gap-2"
                >
                  <span>Review Order Summary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Order Summary Review */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="font-serif text-xl font-bold text-neutral-900">
                  Step 3: Review Order Summary
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Check your items, options, and delivery details.
                </p>
              </div>

              {/* Items Summary list */}
              <div className="space-y-3 divide-y divide-neutral-100">
                {cart.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img loading="lazy" decoding="async"
                        src={item.product.thumbnail || item.product.images[0]}
                        alt=""
                        className="w-12 h-14 rounded-lg object-cover bg-neutral-100"
                      />
                      <div>
                        <p className="font-serif font-bold text-neutral-900">{item.product.name}</p>
                        <p className="text-xs text-neutral-500">
                          Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                        {item.selectedVariations.length > 0 && (
                          <p className="text-[11px] text-amber-900 font-medium">
                            {item.selectedVariations.map((v) => `${v.variationName}: ${v.chosenLabel}`).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery recipient review */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 text-xs space-y-1">
                <p className="font-bold text-neutral-900">Delivering to:</p>
                <p className="text-neutral-700">{customerName} ({customerPhone})</p>
                <p className="text-neutral-600">{address}, {city}, {postalCode}, {STORE_COUNTRY}</p>
                <p className="text-neutral-500 text-xs">
                  Shipping: {shippingOption === 'express' ? 'Priority Air Express (1-2 Days)' : 'Standard Ground (3-5 Days)'}
                </p>
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-3 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-100 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 flex items-center justify-center gap-2"
                >
                  <span>Select Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment Method */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="font-serif text-xl font-bold text-neutral-900">
                  Step 4: Payment Method
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Choose how you would like to pay. Every payment is verified by our team.
                </p>
              </div>

              {/* Payment Method Selector Cards */}
              <div role="radiogroup" aria-label="Payment method" className="space-y-3">
                {/* 1. Bank Transfer */}
                <div
                  {...selectable(paymentMethod === 'bank_transfer', () => setPaymentMethod('bank_transfer'))}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-5 h-5 text-amber-700" />
                      <div>
                        <h4 className="font-bold text-xs text-neutral-900">Direct Bank Wire Transfer</h4>
                        <p className="text-xs text-neutral-500">Official corporate bank account with admin review</p>
                      </div>
                    </div>
                    <span className="w-4 h-4 rounded-full border-2 border-neutral-900 flex items-center justify-center p-0.5">
                      {paymentMethod === 'bank_transfer' && <span className="w-full h-full bg-neutral-900 rounded-full" />}
                    </span>
                  </div>

                  {paymentMethod === 'bank_transfer' && (
                    <div className="mt-4 pt-3 border-t border-neutral-200/80 space-y-3 text-xs bg-white p-4 rounded-xl border">
                      <p className="font-bold text-neutral-800">Bank Transfer Instructions:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg break-words">
                        <div>
                          <span className="text-neutral-500 block font-sans">Bank:</span>
                          <span className="font-bold text-neutral-900">{storeSettings.bankDetails.bankName}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block font-sans">Account Title:</span>
                          <span className="font-bold text-neutral-900">{storeSettings.bankDetails.accountTitle}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block font-sans">IBAN / Account:</span>
                          <span className="font-bold text-neutral-900">{storeSettings.bankDetails.iban}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block font-sans">SWIFT:</span>
                          <span className="font-bold text-neutral-900">{storeSettings.bankDetails.swiftCode}</span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {storeSettings.bankDetails.instructions}
                      </p>

                      <div>
                        <label htmlFor="checkout-page-field-9" className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                          Bank Wire Transaction Reference / Code *
                        </label>
                        <input
                          id="checkout-page-field-9"
                          type="text"
                          value={bankWireReference}
                          aria-invalid={!!errors.bankRef}
                          onChange={(e) => setBankWireReference(e.target.value)}
                          placeholder="e.g. WIRE-9988231 or Bank Slip Reference"
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 font-mono"
                        />
                        {errors.bankRef && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.bankRef}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Cash on Delivery */}
                <div
                  {...selectable(paymentMethod === 'cod', () => setPaymentMethod('cod'))}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <DollarSign className="w-5 h-5 text-emerald-700" />
                      <div>
                        <h4 className="font-bold text-xs text-neutral-900">Cash on Delivery (COD)</h4>
                        <p className="text-xs text-neutral-500">
                          Pay cash to the courier upon inspection and physical handover
                        </p>
                      </div>
                    </div>
                    <span className="w-4 h-4 rounded-full border-2 border-neutral-900 flex items-center justify-center p-0.5">
                      {paymentMethod === 'cod' && <span className="w-full h-full bg-neutral-900 rounded-full" />}
                    </span>
                  </div>
                </div>

                {/* 3. Online Card Simulation */}
                <div
                  {...selectable(paymentMethod === 'online_card', () => setPaymentMethod('online_card'))}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'online_card'
                      ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-5 h-5 text-indigo-700" />
                      <div>
                        <h4 className="font-bold text-xs text-neutral-900">Online Card Payment</h4>
                        <p className="text-xs text-neutral-500">Demo only. No real payment is taken.</p>
                      </div>
                    </div>
                    <span className="w-4 h-4 rounded-full border-2 border-neutral-900 flex items-center justify-center p-0.5">
                      {paymentMethod === 'online_card' && <span className="w-full h-full bg-neutral-900 rounded-full" />}
                    </span>
                  </div>

                  {paymentMethod === 'online_card' && (
                    <div className="mt-3 pt-3 border-t border-neutral-200 space-y-3 text-xs bg-white p-4 rounded-xl border">
                      <div>
                        <label htmlFor="checkout-page-field-10" className="block text-xs font-semibold text-neutral-600 mb-1">
                          Card Number
                        </label>
                        <input
                          id="checkout-page-field-10"
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          aria-invalid={!!errors.cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs border border-neutral-300 rounded-xl font-mono"
                        />
                        {errors.cardNumber && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.cardNumber}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="checkout-page-field-11" className="block text-xs font-semibold text-neutral-600 mb-1">
                            Expiry
                          </label>
                          <input
                            id="checkout-page-field-11"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            aria-invalid={!!errors.cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs border border-neutral-300 rounded-xl font-mono"
                          />
                          {errors.cardExpiry && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.cardExpiry}</p>}
                        </div>
                        <div>
                          <label htmlFor="checkout-page-field-12" className="block text-xs font-semibold text-neutral-600 mb-1">
                            CVV
                          </label>
                          <input
                            id="checkout-page-field-12"
                            type="password"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="123"
                            value={cardCvc}
                            aria-invalid={!!errors.cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs border border-neutral-300 rounded-xl font-mono"
                          />
                          {errors.cardCvc && <p role="alert" className="text-xs text-rose-700 mt-1">{errors.cardCvc}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {errors.stock && (
                <p role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  {errors.stock}
                </p>
              )}

              {/* Order Placement Action */}
              <div className="pt-6 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-3 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-100 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalOrderSubmit}
                  disabled={isPlacing}
                  className="px-6 sm:px-8 py-4 bg-neutral-900 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isPlacing ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  )}
                  <span>{isPlacing ? 'Placing Order...' : `Place Order (${formatPrice(finalGrandTotal)})`}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary Card */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4 lg:sticky lg:top-32">
          <h3 className="font-serif text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
            Order Summary
          </h3>

          <div className="space-y-2 text-xs text-neutral-600">
            <div className="flex justify-between">
              <span>Items Total ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
              <span className="font-semibold text-neutral-900">{formatPrice(cartSubtotal)}</span>
            </div>

            {cartDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon Applied</span>
                <span className="font-semibold">-{formatPrice(cartDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping Charge</span>
              <span className="font-semibold text-neutral-900">
                {effectiveShipping === 0 ? 'Free' : formatPrice(effectiveShipping)}
              </span>
            </div>

            <div className="flex justify-between text-base font-bold text-neutral-900 pt-3 border-t border-neutral-100">
              <span>Total Payable</span>
              <span className="text-amber-900">{formatPrice(finalGrandTotal)}</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-neutral-500 space-y-2 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-600" />
              <span>Every order is reviewed before dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-neutral-600" />
              <span>Track your delivery from your account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
