import { useApi } from '../../shared/hooks/use-api';
import { useQuery } from 'react-query';
import { SingleTopic, TopicResults } from '../../../types/topics';

export function useGetTopic(topicId: string) {
  const api = useApi();
  const { data } = useQuery<SingleTopic>(
    ['single-topic'],
    async () => {
      return api.getTopicDetails(topicId);
    },
    {
      refetchInterval: 60000,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    }
  );
  return { data };
}

export function useEnrichmentApi(url: string) {
  const { data } = useQuery<any>(
    ['topic-page-result', { url }],
    async () => {
      return fetch(`${url}?format=json`).then(r => r.json());
    },
    {
      refetchInterval: 60000,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    }
  );
  return { data };
}

export function useGetTopicItems(type: string, subtype: string) {
  const api = useApi();
  const { data } = useQuery<TopicResults>(
    ['topic-page-result'],
    async () => {
      return api.returnTopicItems(type, subtype);
    },
    {
      refetchInterval: 60000,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    }
  );
  return { data };
}
