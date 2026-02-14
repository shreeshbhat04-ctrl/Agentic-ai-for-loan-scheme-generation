import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a random CAPTCHA string
 * @param length - Length of the CAPTCHA (default: 6)
 * @returns Random alphanumeric string
 */
export function generateCaptcha(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random OTP
 * @param length - Length of the OTP (default: 6)
 * @returns Random numeric string
 */
export function generateOTP(length: number = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

/**
 * Calculate EMI (Equated Monthly Installment)
 * @param principal - Loan amount
 * @param annualRate - Annual interest rate (percentage)
 * @param tenureMonths - Loan tenure in months
 * @returns Object containing EMI, total interest, and total payable
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): { emi: number; totalInterest: number; totalPayable: number } {
  if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) {
    return { emi: 0, totalInterest: 0, totalPayable: 0 };
  }

  const monthlyRate = annualRate / 12 / 100;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - principal;

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayable: Math.round(totalPayable),
  };
}

/**
 * Format number as Indian currency
 * @param amount - Number to format
 * @returns Formatted string with ₹ symbol
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with Indian number system (lakhs, crores)
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Mask a string showing only last few characters
 * @param str - String to mask
 * @param visibleChars - Number of characters to show at the end
 * @returns Masked string
 */
export function maskString(str: string, visibleChars: number = 4): string {
  if (str.length <= visibleChars) return str;
  return '*'.repeat(str.length - visibleChars) + str.slice(-visibleChars);
}

/**
 * Validate Indian mobile number
 * @param phone - Phone number to validate
 * @returns Boolean indicating if valid
 */
export function isValidIndianMobile(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleanPhone);
}

/**
 * Validate Customer ID format
 * @param id - Customer ID to validate
 * @returns Boolean indicating if valid
 */
export function isValidCustomerId(id: string): boolean {
  return /^FT[A-Z0-9]{8,12}$/i.test(id);
}
