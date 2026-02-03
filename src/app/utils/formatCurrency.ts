export function formatCurrency(amount: number): string {
  // Format with commas and preserve up to 2 decimal places
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return formatted;
}
