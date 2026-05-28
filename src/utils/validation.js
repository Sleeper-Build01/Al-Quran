// ✅ Input validation & sanitization utilities

// Sanitize string - removes HTML/script tags to prevent XSS
export function sanitize(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

// Validate email format
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !re.test(email)) return 'Please enter a valid email address'
  if (email.length > 254) return 'Email is too long'
  return null
}

// Validate password strength
export function validatePassword(password) {
  if (!password || password.length < 8) return 'Password must be at least 8 characters'
  if (password.length > 128) return 'Password is too long'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  return null
}

// Validate name
export function validateName(name) {
  if (!name || name.trim().length < 2) return 'Name must be at least 2 characters'
  if (name.length > 50) return 'Name is too long'
  if (/<|>|script/i.test(name)) return 'Name contains invalid characters'
  return null
}

// Validate search query - prevent abuse
export function validateSearchQuery(query) {
  if (!query || query.trim().length === 0) return 'Please enter a search term'
  if (query.length > 200) return 'Search query is too long'
  if (/<script|javascript:|on\w+=/i.test(query)) return 'Invalid search query'
  return null
}

// Sanitize user-generated content before saving to Firestore
export function sanitizeForDB(obj) {
  if (typeof obj === 'string') return sanitize(obj)
  if (Array.isArray(obj)) return obj.map(sanitizeForDB)
  if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [sanitize(k), sanitizeForDB(v)])
    )
  }
  return obj
}
