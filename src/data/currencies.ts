import { Currency } from '../types/index.ts';

export interface CurrencyInfo {
  code: Currency;
  name: string;
  symbol: string;
  // Prices use this instead of `symbol` when the symbol is right-to-left script,
  // which would otherwise reorder around the digits
  priceSymbol?: string;
  decimals: number;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs', decimals: 2 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', priceSymbol: 'AED', decimals: 2 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', priceSymbol: 'SAR', decimals: 2 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: 'CN¥', decimals: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', decimals: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2 },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimals: 2 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimals: 2 },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', priceSymbol: 'KWD', decimals: 3 },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', priceSymbol: 'QAR', decimals: 2 },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', priceSymbol: 'OMR', decimals: 3 },
];

export const getCurrencyInfo = (code: Currency): CurrencyInfo =>
  CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0];
