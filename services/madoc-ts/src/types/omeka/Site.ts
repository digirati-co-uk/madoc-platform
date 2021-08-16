type Site = {
  id: number;
  owner_id?: number;
  slug: string;
  theme: string;
  title: string;
  navigation: string;
  item_pool: string;
  created: Date;
  modified?: Date;
  is_public: number;
  summary?: string;
};
