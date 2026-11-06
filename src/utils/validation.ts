export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const isValidPhone = (value: string): boolean => value.replace(/\D/g, '').length >= 7;

export const isValidCardNumber = (value: string): boolean => {
  const digits = value.replace(/\s/g, '');
  return /^\d{13,19}$/.test(digits);
};

export const isValidCardExpiry = (value: string, now = new Date()): boolean => {
  const match = value.trim().match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return false;
  const expiry = new Date(2000 + Number(match[2]), Number(match[1]), 1);
  return expiry > now;
};

export const isValidCardCvc = (value: string): boolean => /^\d{3,4}$/.test(value.trim());
