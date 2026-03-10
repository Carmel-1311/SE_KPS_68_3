export type User = {
  id: number
  role: "admin" | "doctor" | "staff"
}

export function getCurrentUser(): User {

  // จำลอง user ไปก่อน
  return {
    id: 1,
    role: "staff"
  }

}