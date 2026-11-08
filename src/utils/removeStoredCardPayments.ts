const CARD_ORDER_NOTE = 'Order placed and online card authorization approved.';

// Browsers that visited while card payment existed may hold orders paid by card, a method the
// store no longer offers. They are kept as bank transfers so their totals and status stay intact.
// Safe to run on every load.
export const removeStoredCardPayments = () => {
  try {
    const saved = localStorage.getItem('aura_orders');
    if (!saved?.includes('"online_card"')) return;

    const orders = JSON.parse(saved) as Record<string, unknown>[];
    const updated = orders.map((order) =>
      order.paymentMethod === 'online_card' ? { ...order, paymentMethod: 'bank_transfer' } : order
    );
    localStorage.setItem(
      'aura_orders',
      JSON.stringify(updated).split(CARD_ORDER_NOTE).join('Order placed and bank transfer verified.')
    );
  } catch (error) {
    console.warn('Could not update saved card orders', error);
  }
};
