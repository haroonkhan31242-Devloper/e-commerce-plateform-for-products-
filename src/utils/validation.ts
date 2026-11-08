export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const isValidPhone = (value: string): boolean => value.replace(/\D/g, '').length >= 7;
