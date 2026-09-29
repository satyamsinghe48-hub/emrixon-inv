const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanString(value: FormDataEntryValue | null, maxLength = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function isValidEmail(value: string) {
  return value.length <= 320 && EMAIL_RE.test(value.trim());
}

export function isValidHttpUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.username === '' && url.password === '';
  } catch {
    return false;
  }
}

export function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isSafeAmount(value: number) {
  return Number.isFinite(value) && value > 0 && value <= 999999999999.99 && Math.round(value * 100) === value * 100;
}

export function isValidCurrency(value: string) {
  return /^[A-Z]{3}$/.test(value);
}

export function isValidTimeZone(value: string) {
  if (!value || value.length > 100) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}
