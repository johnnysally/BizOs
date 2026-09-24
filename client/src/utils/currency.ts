export const formatCurrency = (
  amount: number,
  currencyCode = 'KES',
  locale = 'en-KE'
) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export const parseCurrency = (str: string) => {
  const cleaned = String(str).replace(/[^\d.-]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

export const roundMoney = (n: number) =>
  Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export const sumMoney = (arr: number[]) =>
  roundMoney(arr.reduce((sum, n) => sum + (Number(n) || 0), 0));

export const currency = formatCurrency;