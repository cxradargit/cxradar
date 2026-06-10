import { randomBytes } from 'crypto'

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

// Generates a CSPRNG base62 token (~119 bits of entropy at length 20)
export function generateToken(length = 20): string {
  const bytes = randomBytes(length)
  return Array.from(bytes, b => BASE62[b % 62]).join('')
}
