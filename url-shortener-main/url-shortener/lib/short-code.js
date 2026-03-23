const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const DEFAULT_LENGTH = 6;

function generateShortCode(length = DEFAULT_LENGTH) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export async function generateUniqueShortCode(exists, length = DEFAULT_LENGTH, maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateShortCode(length);
    const taken = await exists(code);
    if (!taken) return code;
  }
  return generateUniqueShortCode(exists, length + 1, maxAttempts);
}
