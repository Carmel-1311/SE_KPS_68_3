export function withAuthHeaders(headers: HeadersInit = {}) {
  if (typeof window === "undefined") return headers

  const token = localStorage.getItem("auth_token")
  if (!token) return headers

  return {
    ...headers,
    Authorization: `Bearer ${token}`
  }
}

export function getAuthToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function getUserIdFromToken() {
  if (typeof window === "undefined") return null

  const token = localStorage.getItem("auth_token")
  if (!token) return null

  const payloadPart = token.split(".")[1]
  if (!payloadPart) return null

  try {
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")
    const payload = JSON.parse(atob(padded)) as { id?: unknown }
    const userId = Number(payload.id)

    return Number.isInteger(userId) && userId > 0 ? userId : null
  } catch {
    return null
  }
}

export function getAccountRole() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("account_role")
}

export function getAccountName() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("account_name")
}

export function getAccountUsername() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("account_username")
}
