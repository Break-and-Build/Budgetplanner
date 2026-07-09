/**
 * Category colour helpers.
 *
 * Categories now store an arbitrary hex `color` (chosen from the palette), so
 * we derive the light "tint" (bar track / chip fill) from that hex instead of
 * looking it up in a fixed token map. Mixing the accent toward white at 0.14
 * reproduces the original hand-tuned token tints closely.
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function channel(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

/** Mix `hex` with `bg`, `weight` = how much of `hex` to keep (0..1). */
function mixHex(hex: string, bg: string, weight: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(bg);
  return `#${channel(a.r * weight + b.r * (1 - weight))}${channel(
    a.g * weight + b.g * (1 - weight),
  )}${channel(a.b * weight + b.b * (1 - weight))}`;
}

/** Light background tint for a category accent (bar track, chip fill). */
export function categoryTint(hex: string): string {
  return mixHex(hex, '#FFFFFF', 0.14);
}

/** Base + derived tint for a category accent. */
export function categoryColors(hex: string): { base: string; tint: string } {
  return { base: hex, tint: categoryTint(hex) };
}
