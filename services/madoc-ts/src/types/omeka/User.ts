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

export type SingleUser = { id: number; name: string; email: string; role: string };
