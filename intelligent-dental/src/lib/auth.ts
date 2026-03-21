export type User = {
  id: number
  role: "dentist" | "patient" | "staff" | "company"
}

export function getCurrentUser(): User {

  // จำลอง user ไปก่อน
  return {
    id: 1,
    role: "company",
  }
}