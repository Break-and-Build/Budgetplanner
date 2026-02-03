export function formatNumber(num: number): string {
  if (!num) return "";
  return num.toLocaleString();
}

export function parseNumber(str: string): number {
  const cleaned = str.replace(/,/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
