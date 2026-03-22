import {decodeToken} from "@/lib/auth.server"
export type User = {
  id: number
  role: "dentist" | "patient" | "staff" | "company"
}

type Req = Request | { headers: Headers }

export function getCurrentUser(req: Req ) {
  const authHeader = req.headers.get("authorization")

  if (!authHeader) return null

  const token = authHeader.replace("Bearer ", "")
  const payload = decodeToken(token)

  if (!payload) return null 

  return {
    id: payload.id,
    role: payload.role
  }
}