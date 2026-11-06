import React, { useEffect, useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Send,
  Calendar,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { submitPaymentReference } from '../../services/storeApi.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { OrderStatus } from '../../types/index.ts';

const TRACKING_STEPS: OrderStatus[] = [
  'Pending Confirmation',
  'Accepted',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export const OrderTrackingPage: React.FC = () => {
  const {
    orders,
    customerUser,
    submitBankTransferReference,
    formatPrice,
    lastPlacedOrder,
    trackingOrderId,
    storeSettings,
    showToast,
  } = useStore();

  const customerOrders = customerUser
    ? orders.filter((o) => o.customer.email.toLowerCase() === customerUser.email.toLowerCase())
    : [];
  const defaultOrderId = trackingOrderId ?? lastPlacedOrder?.id ?? customerOrders[0]?.id ?? null;

  const [activeOrderId, setActiveOrderId] = useState(defaultOrderId);
  const [searchOrderNumber, setSearchOrderNumber] = useState(
    orders.find((o) => o.id === defaultOrderId)?.orderNumber ?? ''
  );
  const activeOrder = orders.find((o) => o.id === activeOrderId) ?? null;
  const [wireRefInput, setWireRefInput] = useState('');
  const [isSubmittingWire, setIsSubmittingWire] = useState(false);

  useEffect(() => {
    if (trackingOrderId) setActiveOrderId(trackingOrderId);
  }, [trackingOrderId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchOrderNumber.trim().toUpperCase();
    const found = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === query ||
        o.id.toUpperCase() === query ||
        o.customer.email.toLowerCase() === query.toLowerCase()
    );

    if (found) {
      setActiveOrderId(found.id);
      showToast('success', `Found order ${found.orderNumber}`);
    } else {
      showToast('error', `No order found for "${searchOrderNumber}". Check the number and try again.`);
    }
  };

  const handleWireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !wireRefInput.trim()) return;
    setIsSubmittingWire(true);
    try {
      await submitPaymentReference();
      submitBankTransferReference(activeOrder.id, wireRefInput.trim());
      setWireRefInput('');
    } catch (error) {
      console.error('Payment reference submission failed', error);
      showToast('error', 'Your reference could not be submitted. Please try again.');
    } finally {
      setIsSubmittingWire(false);
    }
  };

  // Determine current step index
  const isRejected = activeOrder?.orderStatus === 'Rejected';
  const isCancelled = activeOrder?.orderStatus === 'Cancelled';
  const currentStepIdx = activeOrder
    ? TRACKING_STEPS.indexOf(activeOrder.orderStatus)
    : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs text-center space-y-4">
        <h1 className="font-serif text-3xl font-bold text-neutral-900">
          Track Your Order
        </h1>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Enter your order number or the email used at checkout.
        </p>

        <form onSubmit={handleSearch} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              aria-label="Order number or email"
              placeholder="e.g. ORD-2026-8941"
              value={searchOrderNumber}
              onChange={(e) => setSearchOrderNumber(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 font-mono uppercase tracking-wider"
            />
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors shrink-0"
          >
            Track Order
          </button>
        </form>

        {customerOrders.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-neutral-600">
          <span>Your orders:</span>
          {customerOrders.slice(0, 3).map((ord) => (
            <button
              key={ord.id}
              onClick={() => {
                setSearchOrderNumber(ord.orderNumber);
                setActiveOrderId(ord.id);
              }}
              className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md font-mono text-[11px]"
            >
              {ord.orderNumber}
            </button>
          ))}
        </div>
        )}
      </div>

      {/* Active Order Details */}
      {!activeOrder && (
        <p className="text-center text-sm text-neutral-600">
          Enter your order number above to see its progress.
        </p>
      )}

      {activeOrder && (
        <div key={activeOrder.id} className="space-y-6 animate-in fade-in">
          {/* Order Header Card */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-xl font-bold text-neutral-900">
                  {activeOrder.orderNumber}
                </h2>
                <StatusBadge status={activeOrder.orderStatus} />
              </div>
              <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>Placed on {new Date(activeOrder.date).toLocaleDateString()} at {new Date(activeOrder.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-neutral-500 block">Order Total</span>
              <span className="font-serif text-xl font-bold text-neutral-900">
                {formatPrice(activeOrder.grandTotal)}
              </span>
            </div>
          </div>

          {/* Stepper Timeline Tracker */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-8">
            <h3 className="font-serif text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex flex-wrap items-center justify-between gap-2">
              <span>Order Progress</span>
              {activeOrder.trackingNumber && (
                <span className="text-xs font-mono font-medium text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  Tracking: {activeOrder.trackingNumber} ({activeOrder.courierName})
                </span>
              )}
            </h3>

            {isRejected ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>This order was not accepted</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Reason provided:{' '}
                  <strong>{activeOrder.rejectionReason || 'Item unavailable or payment verification declined.'}</strong>
                </p>
                <p className="text-xs text-rose-600">
                  Please contact us at {storeSettings.contactEmail} for help or a refund.
                </p>
              </div>
            ) : isCancelled ? (
              <div className="p-6 bg-neutral-100 border border-neutral-300 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-neutral-800 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-neutral-600" />
                  <span>Order Cancelled</span>
                </div>
                <p className="text-xs text-neutral-600">This order was cancelled by the customer or administrator.</p>
              </div>
            ) : (
              /* Visual Timeline Progress Bar */
              <div className="relative">
                {/* Horizontal progress bar for desktop */}
                <div className="hidden md:grid grid-cols-6 gap-2 text-center relative z-10">
                  {TRACKING_STEPS.map((step, idx) => {
                    const isPassed = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;

                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                            isCurrent
                              ? 'bg-amber-500 text-neutral-950 ring-4 ring-amber-100 scale-110'
                              : isPassed
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-100 text-neutral-500 border border-neutral-300'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-5 h-5 text-amber-400" /> : idx + 1}
                        </div>
                        <span
                          className={`text-xs mt-2 font-semibold ${
                            isCurrent
                              ? 'text-amber-900 font-bold'
                              : isPassed
                              ? 'text-neutral-900'
                              : 'text-neutral-500'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile vertical progress list */}
                <div className="md:hidden space-y-4">
                  {TRACKING_STEPS.map((step, idx) => {
                    const isPassed = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;

                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? 'bg-amber-500 text-neutral-950 ring-2 ring-amber-200'
                              : isPassed
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {isPassed ? <CheckCircle2 className="w-4 h-4 text-amber-400" /> : idx + 1}
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            isCurrent ? 'text-amber-900 font-bold' : isPassed ? 'text-neutral-900' : 'text-neutral-500'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Event Audit History Log */}
            <div className="pt-4 border-t border-neutral-100 space-y-3">
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Order History
              </h4>
              <div className="space-y-2">
                {activeOrder.timeline.map((event, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                  >
                    <div>
                      <span className="font-bold text-neutral-900 uppercase tracking-wide mr-2">
                        {event.status}
                      </span>
                      <span className="text-neutral-600">{event.note}</span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-mono shrink-0">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bank Transfer Wire Reference Submission (If applicable) */}
          {activeOrder.paymentMethod === 'bank_transfer' && (
            <div className="bg-amber-50/70 rounded-3xl border border-amber-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-amber-700" />
                <span>Bank Transfer Status</span>
              </div>

              {activeOrder.bankTransferReference ? (
                <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1">
                  <p className="text-neutral-600">
                    Reference submitted:{' '}
                    <strong className="font-mono text-neutral-900 font-bold">
                      {activeOrder.bankTransferReference}
                    </strong>
                  </p>
                  <p className="text-xs text-amber-800">
                    Status:{' '}
                    <span className="font-semibold">{activeOrder.paymentStatus}</span> 
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWireSubmit} className="space-y-2">
                  <p className="text-xs text-neutral-700">
                    Completed your transfer? Enter the reference so our team can verify it.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      aria-label="Bank transfer reference"
                      placeholder="e.g. WIRE-CHASE-88910"
                      value={wireRefInput}
                      onChange={(e) => setWireRefInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-amber-300 rounded-xl focus:outline-none focus:border-neutral-900 bg-white font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingWire}
                      className="px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isSubmittingWire ? 'Submitting...' : 'Submit Reference'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Delivery Recipient & Ordered Items Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-3 text-xs">
              <h4 className="font-serif text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                Delivery Address
              </h4>
              <p className="font-bold text-neutral-900">{activeOrder.customer.name}</p>
              <p className="text-neutral-600">{activeOrder.delivery.address}, {activeOrder.delivery.city}</p>
              <p className="text-neutral-600">{activeOrder.delivery.postalCode}, {activeOrder.delivery.country}</p>
              <p className="text-neutral-500 font-mono text-xs">{activeOrder.customer.phone}</p>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-3 text-xs">
              <h4 className="font-serif text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-2">
                Items ({activeOrder.items.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {activeOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="truncate pr-2 font-medium text-neutral-800">
                      {item.quantity}× {item.productName}
                    </span>
                    <span className="font-bold text-neutral-900 shrink-0">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
