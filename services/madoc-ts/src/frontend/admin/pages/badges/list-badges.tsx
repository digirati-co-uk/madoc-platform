import React, { useEffect } from 'react';
import { Badge } from '../../../../types/badges';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import {
  SystemListingDescription,
  SystemListingLabel,
  SystemListingThumbnail,
  SystemMetadata,
} from '../../../shared/atoms/SystemUI';
import { LocaleString } from '../../../shared/components/LocaleString';
import { useData } from '../../../shared/hooks/use-data';
import { Button } from '../../../shared/navigation/Button';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../shared/utility/href-link';

export function ListBadges() {
  const { data } = useData<{ badges: Badge[] }>(ListBadges);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <SystemListItem>
        <div>
          <Button as={HrefLink} href={`/configure/site/badges/create`}>
            Create badge
          </Button>
        </div>
      </SystemListItem>
      {data.badges.map(badge => {
        return <SingleBadge badge={badge} key={badge.id} />;
      })}
    </div>
  );
}

function SingleBadge({ badge }: { badge: Badge }) {
  const [currentTier, setCurrentTier] = React.useState(0);

  // Change on timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTier(t => t + 1);
    }, 2000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const tier = badge.tier_colors ? badge.tier_colors[currentTier % badge.tier_colors.length] : '#000';

  return (
    <SystemListItem>
      <SystemListingThumbnail style={{ width: 70, height: 70 }}>
        <div style={{ '--award-tier': tier, width: 60 } as any}>
          <div dangerouslySetInnerHTML={{ __html: badge.svg }} />
        </div>
      </SystemListingThumbnail>
      <SystemMetadata>
        <HrefLink href={`/configure/site/badges/${badge.id}`}>
          <LocaleString as={SystemListingLabel}>{badge.label}</LocaleString>
        </HrefLink>
        <LocaleString as={SystemListingDescription}>{badge.description}</LocaleString>
      </SystemMetadata>
    </SystemListItem>
  );
}

serverRendererFor(ListBadges, {
  getKey: () => ['list-badges', {}],
  getData: async (key, vars, api) => {
    return api.siteManager.listBadges();
  },
});
