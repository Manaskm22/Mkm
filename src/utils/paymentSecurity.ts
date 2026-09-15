// Payment security, Luhn algorithm, PCI-DSS simulated tokenization, and card helpers

export function checkLuhn(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function detectCardBrand(number: string): 'rupay' | 'visa' | 'mastercard' | 'amex' | 'discover' | 'generic' {
  const clean = number.replace(/\D/g, '');
  if (/^(60|6521|6522|508)/.test(clean)) return 'rupay';
  if (/^4/.test(clean)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
  if (/^3[47]/.test(clean)) return 'amex';
  if (/^(6011|65|64[4-9])/.test(clean)) return 'discover';
  return 'generic';
}

export function formatCardNumber(value: string): string {
  const clean = value.replace(/\D/g, '').substring(0, 16);
  const parts = [];
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.substring(i, i + 4));
  }
  return parts.join(' ');
}

export function formatExpiry(value: string): string {
  const clean = value.replace(/\D/g, '').substring(0, 4);
  if (clean.length >= 2) {
    return `${clean.substring(0, 2)}/${clean.substring(2)}`;
  }
  return clean;
}

export function validateExpiry(expiryStr: string): boolean {
  const parts = expiryStr.split('/');
  if (parts.length !== 2) return false;
  const month = parseInt(parts[0], 10);
  const year = parseInt('20' + parts[1], 10);
  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

export function generateToken(): string {
  const rand = Math.random().toString(36).substring(2, 10);
  const time = Date.now().toString(36);
  return `tok_pci_sec_${rand}${time}`;
}

export function generateTransactionId(): string {
  const hex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `txn_${hex.toUpperCase()}`;
}

export function generateAuthCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface TestCard {
  label: string;
  brand: 'rupay' | 'visa' | 'mastercard' | 'amex';
  number: string;
  exp: string;
  cvv: string;
  note: string;
}

export const TEST_CARDS: TestCard[] = [
  {
    label: 'RuPay Platinum (India)',
    brand: 'rupay',
    number: '6074 1234 5678 9010',
    exp: '09/29',
    cvv: '542',
    note: 'Domestic RuPay debit/credit card with OTP',
  },
  {
    label: 'Visa Test Card (Success)',
    brand: 'visa',
    number: '4242 4242 4242 4242',
    exp: '12/28',
    cvv: '123',
    note: 'Standard valid card passing 3D-Secure',
  },
  {
    label: 'Mastercard 3D-Secure Required',
    brand: 'mastercard',
    number: '5555 5555 5555 4444',
    exp: '08/29',
    cvv: '789',
    note: 'Requires 3DS OTP banking verification challenge',
  },
  {
    label: 'Amex Business Card',
    brand: 'amex',
    number: '3782 8224 6310 005',
    exp: '10/27',
    cvv: '8431',
    note: 'High limit corporate card',
  },
];
