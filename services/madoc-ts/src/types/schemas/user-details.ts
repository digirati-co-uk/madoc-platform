export type UserDetails = {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  sites: Array<{
    id: number;
    slug: string;
    title: string;
    role: string;
  }>;
  currentSiteId: number;
  statistics: {
    statuses: {
      [key: string]: number;
    };
    total: number;
  };
};
