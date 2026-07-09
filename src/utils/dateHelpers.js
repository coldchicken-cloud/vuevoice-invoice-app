// Small collection of date helpers used when creating/editing an invoice.
// Pulled out of the form component so the calculation logic can be unit
// tested (and read) on its own.

const READABLE_DATE_OPTIONS = { year: 'numeric', month: 'short', day: 'numeric' };

/**
 * Returns "now" as both a unix timestamp and a human readable string,
 * e.g. { unix: 1719999999999, readable: "Jul 7, 2026" }
 */
export function getTodayAsInvoiceDate() {
  const unix = Date.now();
  return {
    unix,
    readable: new Date(unix).toLocaleDateString('en-us', READABLE_DATE_OPTIONS),
  };
}

/**
 * Given a number of days (the payment terms), returns the resulting due
 * date - relative to a base timestamp - both as a unix timestamp and a
 * human readable string.
 */
export function addDaysToInvoiceDate(baseUnixTimestamp, daysToAdd) {
  const futureDate = new Date(baseUnixTimestamp || Date.now());
  futureDate.setDate(futureDate.getDate() + parseInt(daysToAdd, 10));

  const unix = futureDate.getTime();
  return {
    unix,
    readable: new Date(unix).toLocaleDateString('en-us', READABLE_DATE_OPTIONS),
  };
}

/**
 * Formats any unix timestamp using the same readable format used
 * throughout the app, so dates look consistent everywhere.
 */
export function formatReadableDate(unixTimestamp) {
  if (!unixTimestamp) return '';
  return new Date(unixTimestamp).toLocaleDateString('en-us', READABLE_DATE_OPTIONS);
}

/**
 * Converts a unix timestamp to the yyyy-mm-dd string that
 * <input type="date"> expects/returns.
 */
export function unixToIsoDateString(unixTimestamp) {
  if (!unixTimestamp) return '';
  return new Date(unixTimestamp).toISOString().slice(0, 10);
}

/**
 * The inverse of unixToIsoDateString - takes what an <input type="date">
 * gives back and returns both the unix timestamp and the readable string.
 */
export function isoDateStringToInvoiceDate(isoDateString) {
  if (!isoDateString) return { unix: null, readable: '' };
  const unix = new Date(`${isoDateString}T00:00:00`).getTime();
  return { unix, readable: new Date(unix).toLocaleDateString('en-us', READABLE_DATE_OPTIONS) };
}

/**
 * True when an invoice's due date has passed and it still hasn't been
 * marked paid. Deliberately not stored on the invoice itself - it's a
 * function of "now", so it's computed wherever it's needed instead.
 */
export function isPastDue(paymentDueDateUnix, isPaid) {
  if (isPaid || !paymentDueDateUnix) return false;
  return paymentDueDateUnix < Date.now();
}
