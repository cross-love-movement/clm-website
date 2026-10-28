import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const KEY_LENGTH = 64

/** scrypt from node:crypto — no native dependency, no build step. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer

  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false

  const [scheme, saltHex, hashHex] = stored.split('$')

  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false

  const derived = (await scryptAsync(password, Buffer.from(saltHex, 'hex'), KEY_LENGTH)) as Buffer
  const expected = Buffer.from(hashHex, 'hex')

  return expected.length === derived.length && timingSafeEqual(expected, derived)
}
