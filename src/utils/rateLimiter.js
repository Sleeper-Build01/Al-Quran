// Rate limiter - prevents brute force login attacks
const attempts = {};

export function checkRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  if (!attempts[key]) attempts[key] = [];

  // Remove old attempts outside window
  attempts[key] = attempts[key].filter(t => now - t < windowMs);

  if (attempts[key].length >= maxAttempts) {
    const waitMs = windowMs - (now - attempts[key][0]);
    const waitMin = Math.ceil(waitMs / 60000);
    throw new Error(`Too many attempts. Try again in ${waitMin} minute(s).`);
  }

  attempts[key].push(now);
}

export function resetRateLimit(key) {
  delete attempts[key];
}
