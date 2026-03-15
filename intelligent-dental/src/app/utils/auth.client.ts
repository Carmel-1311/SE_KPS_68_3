export function withAuthHeaders(headers: HeadersInit = {}) {
  if (typeof window === "undefined") return headers

  const token = localStorage.getItem("auth_token")
  if (!token) return headers

  return {
    ...headers,
    Authorization: `Bearer ${token}`
  }
}
