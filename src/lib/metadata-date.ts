const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Machine-readable date, or null when missing or still in the future. */
export function metadataDate(isoDate: string, now = new Date()): string | null {
  if (!ISO_DATE.test(isoDate)) {
    return null;
  }
  const today = now.toISOString().slice(0, 10);
  if (isoDate > today) {
    return null;
  }
  return isoDate;
}
