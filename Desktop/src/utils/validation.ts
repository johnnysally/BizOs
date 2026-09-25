export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const isPhone = (s: string, dialCode = '+254') => {
  const cleaned = String(s).replace(/[\s-]/g, '');
  if (cleaned.startsWith('+')) return /^\+\d{8,15}$/.test(cleaned);
  if (cleaned.startsWith('0')) return /^0\d{8,10}$/.test(cleaned);
  return new RegExp(`^\\${dialCode}\\d{6,12}$`).test(cleaned);
};

export const isStrongPassword = (s: string, min = 8) => {
  if (s.length < min) return false;
  if (!/[a-zA-Z]/.test(s)) return false;
  if (!/\d/.test(s)) return false;
  return true;
};

export const isUrl = (s: string) => {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
};

export const isNonEmpty = (s: string) => s.trim().length > 0;

export const minLength = (s: string, n: number) => s.length >= n;

export const maxLength = (s: string, n: number) => s.length <= n;

export const isNumeric = (s: string) => /^\d+$/.test(s);

export const isValidAmount = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 && /^\d+(\.\d{1,2})?$/.test(String(s));
};

export const isObjectId = (s: string) => /^[a-f\d]{24}$/i.test(s);