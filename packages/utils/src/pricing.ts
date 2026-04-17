/**
 * Pricing Utilities
 *
 * Shared pricing logic for the Speedcut MaaS platform.
 * Used by both customer-facing quotes and partner-facing cost breakdowns.
 */

/** Standard UK VAT rate */
export const VAT_RATE = 0.2

/** Calculate net amount from gross */
export function netFromGross(gross: number): number {
  return gross / (1 + VAT_RATE)
}

/** Calculate VAT amount from net */
export function vatFromNet(net: number): number {
  return net * VAT_RATE
}

/** Calculate gross from net */
export function grossFromNet(net: number): number {
  return net * (1 + VAT_RATE)
}

/** Format currency (GBP) */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount)
}
