import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

const KEY_LENGTH = 64
const SALT_LENGTH = 16

export function hashPassword(plain: string) {
  const salt = randomBytes(SALT_LENGTH).toString("hex")
  const hash = scryptSync(plain, salt, KEY_LENGTH).toString("hex")
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(plain: string, stored: string) {
  const [scheme, salt, hash] = stored.split("$")
  if (scheme !== "scrypt" || !salt || !hash) {
    return false
  }

  const derived = scryptSync(plain, salt, KEY_LENGTH).toString("hex")
  const a = Buffer.from(hash, "hex")
  const b = Buffer.from(derived, "hex")
  if (a.length !== b.length) {
    return false
  }
  return timingSafeEqual(a, b)
}
