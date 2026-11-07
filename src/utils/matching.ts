import type { ClassItem, Preferences } from '../types';

export const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function time(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return (
    String(hours).padStart(2, '0') +
    ':' +
    String(remaining).padStart(2, '0')
  );
}

export function overlaps(
  a: { day: number; start: number; end: number },
  b: { day: number; start: number; end: number }
) {
  return (
    a.day === b.day &&
    a.start < b.end &&
    a.end > b.start
  );
}

export function distanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) {
  const radians = (value: number) =>
    (value * Math.PI) / 180;

  const value =
    Math.sin(radians(latitude2 - latitude1) / 2) ** 2 +
    Math.cos(radians(latitude1)) *
      Math.cos(radians(latitude2)) *
      Math.sin(radians(longitude2 - longitude1) / 2) ** 2;

  return (
    6371 *
    2 *
    Math.atan2(
      Math.sqrt(value),
      Math.sqrt(Math.max(0, 1 - value))
    )
  );
}

export function match(
  item: ClassItem,
  preferences: Preferences,
  enrolled: ClassItem[]
) {
  const distance = distanceKm(
    preferences.latitude,
    preferences.longitude,
    item.latitude,
    item.longitude
  );

  const reasons = [
    item.fee <= preferences.budget
      ? 'Within budget'
      : null,

    item.medium.toLowerCase() ===
    preferences.medium.toLowerCase()
      ? 'Preferred language'
      : null,

    item.mode === 'online' ||
    distance <= preferences.radiusKm
      ? 'Travel-friendly'
      : null,

    item.day === preferences.day &&
    item.start >= preferences.start &&
    item.end <= preferences.end
      ? 'Fits your availability'
      : null,
  ].filter(Boolean) as string[];

  return {
    score: reasons.length,
    reasons,
    distance,
    clash: enrolled.some(existing =>
      overlaps(item, existing)
    ),
  };
}

export function parseClock(value: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw Error('Use 24-hour time, for example 09:00.');
  }

  const [hours, minutes] = value.split(':').map(Number);

  return hours * 60 + minutes;
}

export function numberValue(
  value: string,
  label: string,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER
) {
  const result = Number(value);

  if (
    !value.trim() ||
    !Number.isFinite(result) ||
    result < minimum ||
    result > maximum
  ) {
    throw Error(`Check ${label}.`);
  }

  return result;
}

export function dateValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw Error('Trial date must be YYYY-MM-DD.');
  }

  const date = new Date(value + 'T00:00:00+05:30');

  if (!Number.isFinite(date.getTime())) {
    throw Error('Enter a valid date.');
  }

  const normalized = new Date(
    date.getTime() + 330 * 60000
  )
    .toISOString()
    .slice(0, 10);

  if (normalized !== value) {
    throw Error('Enter a valid date.');
  }

  const today = new Date(Date.now() + 330 * 60000)
    .toISOString()
    .slice(0, 10);

  if (value < today) {
    throw Error('Trial date must be today or later.');
  }

  return value;
}