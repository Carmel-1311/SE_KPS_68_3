import jwt from "jsonwebtoken"

const SECRET = process.env.JWT_SECRET!

export type TokenPayload = {
  accountId: number
  role: "dentist" | "patient" | "staff" | "company"
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload
  } catch (err) {
    return null
  }
}
