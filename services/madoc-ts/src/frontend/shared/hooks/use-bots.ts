import { useMemo } from 'react';
import { siteBots } from '../../../automation/bot-definitions';
import { BotAdminDetails } from '../../../automation/utils/BotAdminDetails';
import { SiteUser, User } from '../../../extensions/site-manager/types';
import { parseUrn } from '../../../utility/parse-urn';
import { apiHooks } from './use-api-query';

export function useBots(): readonly [
  Array<SiteUser & { bot: BotAdminDetails }>,
  (user: string | number | SiteUser | User) => boolean
] {
  const { data } = apiHooks.getAutomatedUsers(() => [], {
    cacheTime: 60 * 60 * 24,
    keepPreviousData: true,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
  });

  function isBot(u: string | number | SiteUser | User) {
    const find = (id: number) => listOfBots.find(user => user.id === id);

    if (typeof u === 'string') {
      const urn = parseUrn(u);
      return urn ? find(urn?.id) : false;
    }

    if (Number.isInteger(u)) {
      return find(u as any);
    }

    return (u as any).id;
  }

  const listOfBots = useMemo(() => {
    return (
      data?.users
        .map(user => {
          const bot = siteBots.find(t => t.type === user.config?.bot?.type);
          if (!bot) {
            return null as any; // caught by .filter(Boolean)
          }
          return {
            ...user,
            bot,
          };
        })
        .filter(Boolean) || []
    );
  }, [data]);

  return [listOfBots, isBot] as const;
}
