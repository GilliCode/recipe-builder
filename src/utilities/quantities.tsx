/**
 * Parses a string like "10k", "1.5m", "2.75b", or a normal number into a numeric value.
 * Accepts upper or lower case (k, K, m, M, b, B).
 * Returns 0 if it cannot parse.
 */
export function parseKMB(value: string): number {
  const lower = value.trim().toLowerCase();

  // If it ends with k/m/b, parse the float part and multiply
  if (lower.endsWith('k')) {
    const numStr = lower.slice(0, -1);
    const num = parseFloat(numStr);
    return isNaN(num) ? 0 : num * 1_000;
  } else if (lower.endsWith('m')) {
    const numStr = lower.slice(0, -1);
    const num = parseFloat(numStr);
    return isNaN(num) ? 0 : num * 1_000_000;
  } else if (lower.endsWith('b')) {
    const numStr = lower.slice(0, -1);
    const num = parseFloat(numStr);
    return isNaN(num) ? 0 : num * 1_000_000_000;
  }

  // Otherwise parse as normal float (remove commas)
  const normal = parseFloat(lower.replace(/,/g, ''));
  return isNaN(normal) ? 0 : normal;
}

/**
 * Formats a number into K, M, or B with up to 2 decimal places.
 * e.g. 1500 => "1.5K", 1000000 => "1M", 250000000 => "250M", 123 => "123"
 */
export function formatKMB(value: number): string {
  if (value >= 1_000_000_000) {
    // billions
    const billions = value / 1_000_000_000;
    return formatWithDecimals(billions) + 'B';
  } else if (value >= 1_000_000) {
    // millions
    const millions = value / 1_000_000;
    return formatWithDecimals(millions) + 'M';
  } else if (value >= 1_000) {
    // thousands
    const thousands = value / 1_000;
    return formatWithDecimals(thousands) + 'K';
  } else {
    return formatWithDecimals(value);
  }
}

/**
 * Formats a number with up to 2 decimals, removing trailing zeros.
 */
function formatWithDecimals(num: number): string {
  const fixed = num.toFixed(2);
  const finalNum = parseFloat(fixed);
  return finalNum.toString();
}
