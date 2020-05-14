export type AuthenticatedUser = {
  name: string;
  id: number;
  sites: Array<{ id: number; slug: string; title: string; role: string }>;
  role: string;
};
