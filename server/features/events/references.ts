import { randomBytes } from 'node:crypto'

/** Crockford base32 without I, L, O, U — no visually ambiguous characters. */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export function eventPrefix(slug: string) {
  const letters = slug.replace(/[^a-z0-9]/gi, '').toUpperCase()
  return (letters.slice(0, 3) || 'CLM').padEnd(3, 'X')
}

/**
 * Human-readable booking code, e.g. `PEO-7K4M2Q`.
 * 32^6 ≈ 1.07 billion combinations per prefix.
 */
export function generateReference(slug: string) {
  const bytes = randomBytes(6)
  let code = ''

  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length]
  }

  return `${eventPrefix(slug)}-${code}`
}

export function isReference(value: string) {
  return /^[A-Z0-9]{3}-[0-9A-HJKMNP-TV-Z]{6}$/.test(value)
}
