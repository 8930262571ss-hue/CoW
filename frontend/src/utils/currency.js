/**
 * Format amounts in Indian Rupees (₹) with proper Indian digit grouping (e.g., ₹1,49,000)
 * @param {number|string} amount
 * @param {boolean} showDecimals
 * @returns {string}
 */
export function formatCurrencyINR(amount, showDecimals = false) {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(numericAmount);
}
