// Client-side contract for the future REST backend. Each function resolves against mock
// behaviour today; replacing a body with a `fetch` call leaves every caller unchanged.

const DEMO_ADMIN = { email: 'admin@sterose.store', password: 'admin123' };

const simulateLatency = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// POST /api/auth/admin/login
export const loginAdmin = async (email: string, password: string): Promise<boolean> => {
  await simulateLatency();
  return email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
};

// POST /api/orders (the mock only waits; the store context records the order)
export const submitOrder = async (): Promise<void> => {
  await simulateLatency(700);
};

// POST /api/orders/:id/payment-reference
export const submitPaymentReference = async (): Promise<void> => {
  await simulateLatency(400);
};

// POST /api/newsletter
export const subscribeToNewsletter = async (): Promise<void> => {
  await simulateLatency(400);
};
