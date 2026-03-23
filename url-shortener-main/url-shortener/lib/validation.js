const URL_REGEX = /^(https?:\/\/)([\w.-]+)(\.[\w.-]+)*(\/[^\s]*)?$/i;

export function isValidUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return URL_REGEX.test(value.trim());
  }
}

export function normalizeUrl(value) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "https://" + trimmed;
}
