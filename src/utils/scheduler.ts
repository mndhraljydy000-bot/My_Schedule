import { ARABIC_MONTHS, ARABIC_DAYS, ARABIC_DAYS_SHORT } from '../data/sources';

export { ARABIC_MONTHS, ARABIC_DAYS, ARABIC_DAYS_SHORT };

export function pad(n: number): string { return String(n).padStart(2, '0'); }

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getDayOfWeek(iso: string): number {
  return new Date(iso + 'T00:00:00').getDay();
}

export function getDayName(iso: string): string {
  return ARABIC_DAYS[getDayOfWeek(iso)];
}

export function isToday(iso: string): boolean {
  return iso === todayISO();
}

export function isPast(iso: string): boolean {
  return iso < todayISO();
}

export function hoursUntilTomorrow(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.max(1, Math.round((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60)));
}

export function formatArabicDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${ARABIC_MONTHS[m - 1]} ${y}`;
}

export function formatArabicDateShort(iso: string): string {
  if (!iso) return '';
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${ARABIC_MONTHS[m - 1]}`;
}

export function daysBetween(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00').getTime();
  const e = new Date(end + 'T00:00:00').getTime();
  return Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)));
}
