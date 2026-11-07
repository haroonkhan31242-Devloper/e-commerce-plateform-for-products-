import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  Clock,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.ts';
import { useStore } from '../../context/StoreContext.tsx';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { Modal } from '../common/Overlay.tsx';
import { ParcelLabelPanel } from './ParcelLabelPanel.tsx';
import { FINAL_ORDER_STATUSES, PAYMENT_METHOD_LABELS } from '../../utils/orders.ts';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order: liveOrder, onClose }) => {
  // Keeps the last order on screen while the closing animation plays
  const lastOrder = useRef<Order | null>(null);
  if (liveOrder) lastOrder.current = liveOrder;
  const order = lastOrder.current;

  const {
    acceptOrder,
    rejectOrder,
    updateOrderStatus,
    updatePaymentStatus,
    formatPrice,
    showToast,
  } = useStore();

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [courierNameInput, setCourierNameInput] = useState(order?.courierName || 'TCS Express');
  const [trackingNumberInput, setTrackingNumberInput] = useState(order?.trackingNumber || '');
  const [statusNoteInput, setStatusNoteInput] = useState('');

  useEffect(() => {
    if (!liveOrder) return;
    setCourierNameInput(liveOrder.courierName || 'TCS Express');
    setTrackingNumberInput(liveOrder.trackingNumber || '');
    setStatusNoteInput('');
    setRejectReason('');
    setIsRejectDialogOpen(false);
    // Only reset the form when a different order is opened
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveOrder?.id]);

  if (!order) return null;

  const isFinalStatus = FINAL_ORDER_STATUSES.includes(order.orderStatus);

  const handleAccept = () => {
    acceptOrder(order.id);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      showToast('error', 'Please provide a reason for order rejection.');
      return;
    }
    rejectOrder(order.id, rejectReason.trim());
    setIsRejectDialogOpen(false);
    setRejectReason('');
  };

  const handleUpdateStatus = (newStatus: OrderStatus) => {
    updateOrderStatus(
      order.id,
      newStatus,
      statusNoteInput.trim() || undefined,
      courierNameInput.trim() || undefined,
      trackingNumberInput.trim() || undefined
    );
    setStatusNoteInput('');
  };

  const handleVerifyBankWire = () => {
    updatePaymentStatus(order.id, 'Paid');
  };

  return (
    <Modal isOpen={!!liveOrder} onClose={onClose} label={`Order ${order.orderNumber}`} className="max-w-3xl max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 bg-neutral-50/70 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-neutral-900">
                Order {order.orderNumber}
              </h2>
              <StatusBadge status={order.orderStatus} />
              <StatusBadge status={order.paymentStatus} size="sm" />
            </div>
            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Registered on {new Date(order.date).toLocaleString()}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close order details"
            className="p-2 text-neutral-600 hover:text-neutral-900 rounded-full shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          {/* Critical Workflow: Manual Acceptance / Rejection Action Bar */}
          {order.orderStatus === 'Pending Confirmation' && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-800" />
                    <span>Approval required</span>
                  </h4>
                  <p className="text-amber-800 text-xs mt-0.5">
                    Review items and payment status before confirming into processing.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsRejectDialogOpen(true)}
                    className="px-4 py-2 bg-white border border-rose-300 text-rose-700 font-bold rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Reject Order</span>
                  </button>

                  <button
                    onClick={handleAccept}
                    className="px-5 py-2 bg-neutral-900 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Accept Order</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Dialog Prompt */}
          {isRejectDialogOpen && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl space-y-3 animate-in fade-in">
              <h5 className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Specify Reason for Rejecting Order {order.orderNumber}</span>
              </h5>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Item out of stock or wire reference not found in bank statement..."
                className="w-full p-2.5 text-xs bg-white border border-rose-300 rounded-xl focus:outline-none focus:border-rose-700 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejectDialogOpen(false)}
                  className="px-3 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {/* Customer & Delivery Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-neutral-500 text-[11px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Customer Contact Details</span>
              </h4>
              <p className="font-bold text-neutral-900 text-sm">{order.customer.name}</p>
              <p className="text-neutral-600">Email: {order.customer.email}</p>
              <p className="text-neutral-600">Phone: {order.customer.phone}</p>
              <p className="text-xs text-neutral-500">
                Account: {order.customer.isGuest ? 'Guest checkout' : 'Registered customer'}
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-neutral-500 text-[11px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Delivery Address</span>
              </h4>
              <p className="font-semibold text-neutral-800">{order.delivery.address}</p>
              <p className="text-neutral-600">
                {order.delivery.city}, {order.delivery.postalCode}, {order.delivery.country}
              </p>
              <p className="text-neutral-500">
                Speed: <span className="font-semibold capitalize">{order.delivery.shippingOption}</span>
              </p>
              {order.delivery.deliveryInstructions && (
                <p className="text-xs italic text-neutral-500">
                  Instructions: &quot;{order.delivery.deliveryInstructions}&quot;
                </p>
              )}
            </div>
          </div>

          {/* Payment Status & Wire Reference Verification */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-700" />
                <span className="font-bold uppercase tracking-wider text-neutral-700 text-xs">
                  Payment Channel & Settlement
                </span>
              </div>
              <StatusBadge status={order.paymentStatus} size="sm" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-neutral-800 font-semibold uppercase">
                  {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                </p>
                {order.bankTransferReference && (
                  <p className="text-xs font-mono text-neutral-700 mt-0.5">
                    Wire Reference: <strong className="font-bold">{order.bankTransferReference}</strong>
                  </p>
                )}
              </div>

              {/* Verify Wire Button if Pending or Awaiting Verification */}
              {order.paymentStatus !== 'Paid' && (
                <button
                  type="button"
                  onClick={handleVerifyBankWire}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Paid</span>
                </button>
              )}
            </div>
          </div>

          {/* Ordered Products Table */}
          <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white">
            <div className="p-3 bg-neutral-100/60 font-bold uppercase tracking-wider text-[11px] text-neutral-600 flex justify-between">
              <span>Ordered Products ({order.items.length})</span>
              <span>Subtotal: {formatPrice(order.subtotal)}</span>
            </div>
            <div className="divide-y divide-neutral-100">
              {order.items.map((item, i) => (
                <div key={i} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="w-12 h-14 rounded-lg object-cover bg-neutral-100 shrink-0"
                    />
                    <div>
                      <p className="font-serif font-bold text-neutral-900">{item.productName}</p>
                      <p className="text-xs text-neutral-500 font-mono">SKU: {item.sku}</p>
                      {item.selectedVariations.length > 0 && (
                        <p className="text-[11px] text-amber-900 font-medium">
                          {item.selectedVariations.map((v) => `${v.variationName}: ${v.chosenLabel}`).join(' | ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-neutral-900">{formatPrice(item.totalPrice)}</span>
                    <p className="text-[11px] text-neutral-500">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-neutral-50 border-t border-neutral-200 text-right space-y-1">
              {order.discountAmount > 0 && (
                <p className="text-emerald-700">
                  Discount: -{formatPrice(order.discountAmount)}
                </p>
              )}
              <p className="text-neutral-500">Shipping: {order.shippingCharge === 0 ? 'Free' : formatPrice(order.shippingCharge)}</p>
              <p className="text-sm font-bold text-neutral-900">
                Grand Total: {formatPrice(order.grandTotal)}
              </p>
            </div>
          </div>

          <ParcelLabelPanel key={order.id} order={order} />

          {/* Status Progression & Logistics Management */}
          <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
            <h4 className="font-bold uppercase tracking-wider text-neutral-700 text-xs flex items-center gap-2">
              <Truck className="w-4 h-4 text-neutral-800" />
              <span>Fulfillment</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="order-detail-modal-field-1" className="block font-bold text-neutral-700 text-xs uppercase mb-1">
                  Courier Carrier
                </label>
                <input
                  id="order-detail-modal-field-1"
                  type="text"
                  value={courierNameInput}
                  onChange={(e) => setCourierNameInput(e.target.value)}
                  placeholder="e.g. TCS Overnight"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <label htmlFor="order-detail-modal-field-2" className="block font-bold text-neutral-700 text-xs uppercase mb-1">
                  Tracking Code / Waybill
                </label>
                <input
                  id="order-detail-modal-field-2"
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. TCS-994827103"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl bg-white font-mono"
                />
              </div>
            </div>

            {/* Quick Status Buttons */}
            <div>
              <p className="block font-bold text-neutral-700 text-xs uppercase mb-1.5">Update status</p>
              {isFinalStatus ? (
                <p className="text-neutral-600">This order is {order.orderStatus.toLowerCase()} and can no longer change.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(['Accepted', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'] as OrderStatus[]).map((st) => (
                    <button
                  key={st}
                  type="button"
                  onClick={() => handleUpdateStatus(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    order.orderStatus === st
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  Mark as {st}
                </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800"
          >
            Close Details
          </button>
        </div>
    </Modal>
  );
};
