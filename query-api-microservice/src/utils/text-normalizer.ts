function removeDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function removeInvisibleChars(text: string): string {
  return text.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '');
}

function removePunctuation(text: string): string {
  return text.replace(/[^\w\s]/g, '');
}

function cleanWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function toTitleCase(text: string): string {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function cleanText(text: string): string {
  return cleanWhitespace(
    removePunctuation(
      removeDiacritics(removeInvisibleChars(text)).toLowerCase(),
    ),
  );
}

export function normalizeCountryCode(text: string): string {
  return cleanWhitespace(removeInvisibleChars(text)).toUpperCase();
}

export function normalizeSectorName(text: string): string | null {
  if (!text) return null;
  return toTitleCase(cleanText(text));
}
