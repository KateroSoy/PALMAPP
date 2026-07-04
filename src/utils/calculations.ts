/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Formats a number into Indonesian Rupiah (Rp)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formats a weight in kg with thousand separator (e.g. 12.450 kg)
 */
export function formatKg(weight: number): string {
  return `${new Intl.NumberFormat('id-ID').format(weight)} kg`;
}

/**
 * Formats a weight in tons with decimal separator (e.g. 12,45 ton)
 */
export function formatTon(weight: number): string {
  const tons = weight / 1000;
  return `${new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(tons)} ton`;
}

/**
 * Net Weight = Gross Weight - Tare Weight
 */
export function calculateNetWeight(gross: number, tare: number): number {
  if (gross <= 0 || tare <= 0) return 0;
  return Math.max(0, gross - tare);
}

/**
 * Gross Amount = Net Weight * Purchase Price per Kg
 */
export function calculateGrossAmount(netWeight: number, pricePerKg: number): number {
  if (netWeight <= 0 || pricePerKg <= 0) return 0;
  return netWeight * pricePerKg;
}

/**
 * Deduction Amount = Gross Amount * Deduction Percentage
 */
export function calculateDeductionAmount(grossAmount: number, deductionPercentage: number): number {
  if (grossAmount <= 0 || deductionPercentage <= 0) return 0;
  return Math.round((grossAmount * deductionPercentage) / 100);
}

/**
 * Final Amount = Gross Amount - Deduction Amount - Other Deductions
 */
export function calculateFinalAmount(
  grossAmount: number,
  deductionAmount: number,
  otherDeductions: number
): number {
  return Math.max(0, grossAmount - deductionAmount - otherDeductions);
}
