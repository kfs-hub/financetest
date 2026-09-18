export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    flag: '🇮🇳',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    flag: '🇺🇸',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    flag: '🇪🇺',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    flag: '🇬🇧',
  },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'INR';

/**
 * Formats a monetary amount into localized currency format.
 * For INR, uses the Indian Numbering System (Lakhs and Crores e.g. ₹1,50,000.00).
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = DEFAULT_CURRENCY,
  options: { hideDecimals?: boolean; compact?: boolean } = {}
): string {
  const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.INR;
  const { hideDecimals = false, compact = false } = options;

  if (compact) {
    if (currencyCode === 'INR') {
      if (Math.abs(amount) >= 10000000) {
        return `${config.symbol}${(amount / 10000000).toFixed(2)} Cr`;
      }
      if (Math.abs(amount) >= 100000) {
        return `${config.symbol}${(amount / 100000).toFixed(2)} L`;
      }
      if (Math.abs(amount) >= 1000) {
        return `${config.symbol}${(amount / 1000).toFixed(1)}k`;
      }
    } else {
      if (Math.abs(amount) >= 1000000) {
        return `${config.symbol}${(amount / 1000000).toFixed(1)}M`;
      }
      if (Math.abs(amount) >= 1000) {
        return `${config.symbol}${(amount / 1000).toFixed(1)}k`;
      }
    }
  }

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: hideDecimals ? 0 : 2,
      maximumFractionDigits: hideDecimals ? 0 : 2,
    }).format(amount);
  } catch {
    const formatted = Math.abs(amount).toLocaleString(config.locale, {
      minimumFractionDigits: hideDecimals ? 0 : 2,
      maximumFractionDigits: hideDecimals ? 0 : 2,
    });
    return `${config.symbol}${formatted}`;
  }
}
