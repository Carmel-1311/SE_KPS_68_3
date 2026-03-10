export type User = {
  id: number
  role: "doctor" | "patient" | "staff"
}

export function getCurrentUser(): User {

  // จำลอง user ไปก่อน
  return {
    id: 1,
    role: "staff"
  }

}