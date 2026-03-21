export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  allergy: string | null;
};

export type ApiResponse<T> = {
  data: T;
};
