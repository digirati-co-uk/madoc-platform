const DATE_FIELD_MAX_DIGITS = 8;

const DATE_FIELD_PATTERN = /^(\d{2})-(\d{2})-(\d{3,4})$/;

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function getDaysInMonth(month: number, year: number) {
  switch (month) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      return 31;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    case 2:
      return isLeapYear(year) ? 29 : 28;
    default:
      return 0;
  }
}

export function isValidDateFieldValue(rawValue?: string) {
  const value = (rawValue || '').trim();
  if (!value) {
    return true;
  }

  const match = DATE_FIELD_PATTERN.exec(value);
  if (!match) {
    return false;
  }

  const day = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const year = Number.parseInt(match[3], 10);

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return false;
  }
  if (month < 1 || month > 12 || day < 1) {
    return false;
  }

  return day <= getDaysInMonth(month, year);
}

export function formatDateFieldInput(rawValue?: string) {
  const digitsOnly = (rawValue || '').replace(/\D/g, '').slice(0, DATE_FIELD_MAX_DIGITS);
  if (!digitsOnly) {
    return '';
  }
  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }
  if (digitsOnly.length <= 4) {
    return `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
  }
  return `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 4)}-${digitsOnly.slice(4)}`;
}
