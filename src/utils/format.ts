const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

export function toDateTimeString(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return DATE_TIME_FORMATTER.format(date).replace(' ', ' ');
}

export function isNumericType(type: string): boolean {
  return /(int|decimal|numeric|float|double)/i.test(type);
}

export function isDateType(type: string): boolean {
  return /(date|time)/i.test(type);
}

export function normalizeValue(value: any): any {
  if (value === '' || value === undefined) {
    return null;
  }
  return value;
}
