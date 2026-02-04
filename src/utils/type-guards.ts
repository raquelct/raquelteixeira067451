export function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isValidCPF(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const cpfDigits = value.replace(/\D/g, '');
  
  if (cpfDigits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfDigits)) return false;
  
  return true;
}

export function isValidPhone(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const phoneDigits = value.replace(/\D/g, '');
  return phoneDigits.length >= 10 && phoneDigits.length <= 11;
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
