const COUPON_ANNOUNCEMENT = ' | Use code STEROSE20 for 20% off';

// Browsers that visited while coupons existed still hold the coupon list and the
// announcement that advertised a code. Safe to run on every load.
export const removeStoredCoupons = () => {
  try {
    localStorage.removeItem('aura_coupons');

    const settings = localStorage.getItem('aura_settings');
    if (settings?.includes(COUPON_ANNOUNCEMENT)) {
      localStorage.setItem('aura_settings', settings.split(COUPON_ANNOUNCEMENT).join(''));
    }
  } catch (error) {
    console.warn('Could not remove saved coupon data', error);
  }
};
