export type User = {
  id: number;
  email: string;
  name: string;
  created: Date;
  modified?: Date;
  password_hash?: string;
  role: string;
  is_active: number;
};
