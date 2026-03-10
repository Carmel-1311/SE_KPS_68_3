export type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  allergy: string;
};

export const mockUserProfile: UserProfile = {
  id: 1,
  name: "สมชาย ใจดี",
  email: "user@example.com",
  phone: "0812345678",
  birthday: "1990-08-24",
  allergy: "ไม่มี",
};
