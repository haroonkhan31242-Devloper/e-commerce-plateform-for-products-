import { getCurrencyInfo } from '../data/currencies.ts';
import { Currency } from '../types/index.ts';

export interface ExchangeRates {
  // Units of each currency per 1 unit of `base`
  base: Currency;
  rates: Record<Currency, number>;
  source: 'mock' | 'live';
  asOf: string;
}

// Fixed demo values, not market data. Replace getExchangeRates with a call to a
// rates API (GET /api/exchange-rates?base=USD) to make them live.
const MOCK_RATES_PER_USD: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  PKR: 278,
  INR: 84,
  AED: 3.6725,
  SAR: 3.75,
  CNY: 7.2,
  JPY: 150,
  CAD: 1.37,
  AUD: 1.52,
  CHF: 0.88,
  TRY: 34,
  BDT: 120,
  MYR: 4.4,
  KWD: 0.307,
  QAR: 3.64,
  OMR: 0.385,
};

export const getMockExchangeRates = (base: Currency): ExchangeRates => {
  const baseRate = MOCK_RATES_PER_USD[base];
  const rates = Object.fromEntries(
    Object.entries(MOCK_RATES_PER_USD).map(([code, rate]) => [code, rate / baseRate])
  ) as Record<Currency, number>;

  return { base, rates, source: 'mock', asOf: '2026-11-01' };
};

export const getExchangeRates = async (base: Currency): Promise<ExchangeRates> => getMockExchangeRates(base);

export const convertAmount = (amount: number, to: Currency, exchangeRates: ExchangeRates): number =>
  amount * (exchangeRates.rates[to] ?? 1);

export const formatMoney = (amount: number, code: Currency): string => {
  const { symbol, priceSymbol, decimals } = getCurrencyInfo(code);
  const prefix = priceSymbol ?? symbol;
  const separator = /[A-Za-z]$/.test(prefix) ? ' ' : '';
  const value = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${prefix}${separator}${value}`;
};
