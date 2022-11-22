export type TopicResults = {
  count?: number;
  next?: string;
  previous?: string;
  results?: TopicItem[];
};

export type TopicItem = {
  url: string;
  created?: string;
  modified?: string;
  madoc_id?: string;
  type?: string;
};

export type TopicList = {
  count?: number;
  next?: string;
  previous?: string;
  results?: SingleTopic[];
};

export type SingleTopic = {
  url: string;
  id: string;
  created?: string;
  modified?: string;
  type?: string;
  label?: string;
};
