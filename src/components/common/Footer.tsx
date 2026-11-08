import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Phone,
  Mail,
  MapPin,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { BrandLogo } from './BrandLogo.tsx';
import { getFreeShippingLabel } from '../../utils/orders.ts';
import { subscribeToNewsletter } from '../../services/storeApi.ts';
import { isValidEmail } from '../../utils/validation.ts';

export const Footer: React.FC = () => {
  const { categories, navigateToCategory, setCurrentView, storeSettings, showToast, formatPrice } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(newsletterEmail)) {
      showToast('error', 'Enter a valid email address.');
      return;
    }
    setIsSubscribing(true);
    try {
      await subscribeToNewsletter();
      setIsSubscribed(true);
      showToast('success', 'Thank you! You are now subscribed.');
      setNewsletterEmail('');
    } catch (error) {
      console.error('Newsletter subscription failed', error);
      showToast('error', 'We could not subscribe you. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-neutral-950 text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
      {/* Value Badges Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-neutral-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Authenticity Guaranteed</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Every product is checked by our own artisans and certified pharmacists.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-amber-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">{getFreeShippingLabel(storeSettings)}</h4>
              <p className="text-xs text-neutral-400 mt-1">
                On orders over {formatPrice(storeSettings.freeShippingThreshold)}, with insured delivery.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-amber-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">30-Day Returns</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Easy exchanges and returns on apparel, jewelry, and non-perishables.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Flexible Payments</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Pay by cash on delivery or bank transfer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-12" />
              <span className="font-serif text-2xl font-bold tracking-widest text-white">
                {storeSettings.storeName || 'STEROSE'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Healthcare essentials, ladies and gents fashion, organic baby wear, botanical cosmetics, and handcrafted jewelry, all from one trusted store.
            </p>
            <div className="space-y-2 pt-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{storeSettings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${storeSettings.contactPhone}`} className="inline-block py-1 hover:text-amber-400">{storeSettings.contactPhone}</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${storeSettings.contactEmail}`} className="inline-block py-1 hover:text-amber-400">{storeSettings.contactEmail}</a>
              </div>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h5 className="text-xs uppercase tracking-wider font-bold text-white mb-4">
              Shop
            </h5>
            <ul className="space-y-1 text-xs">
              {categories.filter((c) => c.isActive).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigateToCategory(cat.slug)}
                    className="py-1 text-neutral-400 hover:text-amber-400 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-xs uppercase tracking-wider font-bold text-white mb-4">
              Customer Care
            </h5>
            <ul className="space-y-1 text-xs text-neutral-400">
              <li>
                <button
                  onClick={() => setCurrentView('order-tracking')}
                  className="py-1 hover:text-amber-400 transition-colors"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('account')}
                  className="py-1 hover:text-amber-400 transition-colors"
                >
                  My Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('cart')}
                  className="py-1 hover:text-amber-400 transition-colors"
                >
                  Shopping Bag
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('admin')}
                  className="py-1 hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h5 className="text-xs uppercase tracking-wider font-bold text-white mb-4">
              Stay in Touch
            </h5>
            <p className="text-xs text-neutral-400 mb-3">
              Be first to hear about new arrivals and seasonal offers.
            </p>
            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    aria-label="Email address"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-3 pr-11 py-2.5 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    aria-label="Subscribe"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-amber-400 text-neutral-950 rounded hover:bg-amber-300 disabled:opacity-60"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <p>© {new Date().getFullYear()} {storeSettings.storeName || 'STEROSE'}. All rights reserved.</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-neutral-400">We accept:</span>
          <span className="px-2 py-0.5 bg-neutral-900 rounded border border-neutral-800 text-xs text-neutral-300">
            Cash on Delivery
          </span>
          <span className="px-2 py-0.5 bg-neutral-900 rounded border border-neutral-800 text-xs text-neutral-300">
            Bank Transfer
          </span>
        </div>
      </div>
    </footer>
  );
};
