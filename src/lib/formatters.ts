/**
 * Currency & Text Formatters
 * Uses Nigerian Naira (₦) currency formatting.
 */

export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return '₦0';
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(num)) return '₦0';
  return (
    '₦' +
    num.toLocaleString('en-NG', {
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

export const CURRENCY_SYMBOL = '₦';
export const CURRENCY_CODE = 'NGN';
