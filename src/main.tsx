import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { migrateStoredBranding } from './utils/migrateStoredBranding.ts';
import { migrateStoredToPkr } from './utils/migrateStoredToPkr.ts';
import { removeStoredCoupons } from './utils/removeStoredCoupons.ts';
import { removeStoredCardPayments } from './utils/removeStoredCardPayments.ts';

migrateStoredBranding();
migrateStoredToPkr();
removeStoredCoupons();
removeStoredCardPayments();

const IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23f3f1ed'/%3E%3Ctext x='200' y='255' font-family='serif' font-size='22' fill='%23a8a198' text-anchor='middle'%3ESTEROSE%3C/text%3E%3C/svg%3E";

// A broken image URL (for example one pasted into the admin) falls back to a branded placeholder.
// Images marked data-no-fallback handle their own failures.
document.addEventListener(
  'error',
  (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement && target.src !== IMAGE_FALLBACK && !('noFallback' in target.dataset)) {
      target.src = IMAGE_FALLBACK;
    }
  },
  true
);

createRoot(document.getElementById('root')!).render(<App />);
