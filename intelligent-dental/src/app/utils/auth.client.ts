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
