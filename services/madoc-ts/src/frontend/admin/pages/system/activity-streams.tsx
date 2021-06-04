import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import ReactTimeago from 'react-timeago';
import {
  ActivityOrderedCollection,
  ActivityOrderedCollectionPage,
} from '../../../../activity-streams/change-discovery-types';
import { madocStreams } from '../../../../activity-streams/madoc-streams';
import { Button } from '../../../shared/atoms/Button';
import { EmptyState } from '../../../shared/atoms/EmptyState';
import { Heading1, Subheading1 } from '../../../shared/atoms/Heading1';
import { Input, InputContainer, InputLabel } from '../../../shared/atoms/Input';
import { SystemBackground } from '../../../shared/atoms/SystemBackground';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import { WarningMessage } from '../../../shared/atoms/WarningMessage';
import { Activity, ActivityContainer } from '../../../shared/components/Activity';
import { useApi } from '../../../shared/hooks/use-api';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { useSite } from '../../../shared/hooks/use-site';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';

const streamNames = Object.keys(madocStreams) as Array<keyof typeof madocStreams>;

export const ActivityStreams: React.FC = () => {
  const { t } = useTranslation();
  const { stream, secondary, remoteStream } = useLocationQuery<{
    stream?: string;
    secondary?: string;
    remoteStream?: string;
  }>();

  return (
    <>
      <AdminHeader title={t('Activity streams')} breadcrumbs={[{ label: 'Site admin', link: '/' }]} noMargin />
      <SystemBackground>
        {remoteStream ? (
          <ViewRemoteActivityStream url={remoteStream} />
        ) : stream ? (
          <ViewActivityStream name={stream} secondary={secondary} />
        ) : (
          <StreamOverview />
        )}
      </SystemBackground>
    </>
  );
};

const ViewRemoteActivityPage: React.FC<{
  url: string;
  incomplete?: boolean;
  lastLoaded?: boolean;
  onNextPage?: (id: string) => void;
}> = ({ url, lastLoaded, incomplete, onNextPage }) => {
  const { data } = useQuery<ActivityOrderedCollectionPage>(
    ['remote-activity-page', { url }],
    async () => {
      return fetch(url).then(r => r.json());
    },
    {
      refetchInterval: incomplete ? 60000 : false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    }
  );
  const prev = data && data.prev;

  useEffect(() => {
    if (lastLoaded && data && onNextPage && prev && data.orderedItems.length <= 10) {
      onNextPage(prev.id);
    }
  }, [data, lastLoaded, onNextPage, prev]);

  if (!data) {
    return null;
  }

  return (
    <>
      {(data.orderedItems || [])
        .map((item, n) => {
          return <Activity key={n} activity={item} actions={[]} />;
        })
        .reverse()}
      {prev && lastLoaded && onNextPage ? <Button onClick={() => onNextPage(prev.id)}>Next page</Button> : null}
    </>
  );
};

const ViewRemoteActivityStream: React.FC<{ url: string }> = ({ url }) => {
  const [loadedPages, setLoadedPages] = useState<string[]>([]);
  const { data } = useQuery<ActivityOrderedCollection>(
    ['remote-activity-stream', { url }],
    async () => {
      return fetch(url).then(r => r.json());
    },
    {
      refetchInterval: false,
      refetchOnMount: false,
      staleTime: 3600,
    }
  );

  useEffect(() => {
    if (data && data.totalItems) {
      if (!loadedPages.length) {
        setLoadedPages([data.last.id]);
      }
    }
  }, [data, loadedPages.length]);

  return (
    <div>
      <Button as={HrefLink} $primary href={`/system/activity-streams`}>
        Back
      </Button>
      <SystemListItem>
        <div>
          <Heading1>Remote stream</Heading1>
          <WarningMessage>This stream is not from madoc</WarningMessage>
          <Subheading1>{url}</Subheading1>
        </div>
      </SystemListItem>
      <ActivityContainer>
        {loadedPages.map((page, n) => {
          const last = n === loadedPages.length - 1;

          return (
            <ViewRemoteActivityPage
              incomplete={n === 0}
              key={page}
              url={page}
              lastLoaded={last}
              onNextPage={next => setLoadedPages(p => [...p, next])}
            />
          );
        })}
      </ActivityContainer>
    </div>
  );
};

const ViewActivityPage: React.FC<{
  name: string;
  secondary?: string;
  page: number;
  incomplete?: boolean;
  lastLoaded?: boolean;
  onNextPage?: (id: number) => void;
}> = ({ name, secondary, page, lastLoaded, incomplete, onNextPage }) => {
  const api = useApi();
  const { data } = useQuery<ActivityOrderedCollectionPage>(
    ['activity-page', { name, secondary, page }],
    async () => {
      return api.getActivityStream({ primaryStream: name, secondaryStream: secondary, page });
    },
    {
      refetchInterval: incomplete ? 60000 : false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
    }
  );
  const prev = data && data.prev;

  useEffect(() => {
    if (lastLoaded && data && onNextPage && prev && data.orderedItems.length <= 10) {
      onNextPage(page - 1);
    }
  }, [data, lastLoaded, onNextPage, page, prev]);

  if (!data) {
    return null;
  }

  return (
    <>
      {(data.orderedItems || [])
        .map((item, n) => {
          return <Activity key={n} activity={item} actions={[]} />;
        })
        .reverse()}
      {prev && lastLoaded && onNextPage ? <Button onClick={() => onNextPage(page - 1)}>Next page</Button> : null}
    </>
  );
};

export const ViewActivityStream: React.FC<{ name: string; secondary?: string }> = ({ name, secondary }) => {
  const stream = madocStreams[name as keyof typeof madocStreams];
  const [loadedPages, setLoadedPages] = useState<number[]>([]);
  const api = useApi();
  const { data } = useQuery<ActivityOrderedCollection>(
    ['activity-stream', { name, secondary }],
    async () => {
      return api.getActivityStream({ primaryStream: name, secondaryStream: secondary });
    },
    {
      refetchInterval: false,
      refetchOnMount: false,
      staleTime: 3600,
    }
  );
  const { slug } = useSite();

  const link = secondary
    ? `/s/${slug}/madoc/api/activity/${name}/stream/${secondary}/changes`
    : `/s/${slug}/madoc/api/activity/${name}/changes`;

  useEffect(() => {
    if (data && data.totalPages) {
      if (!loadedPages.length) {
        setLoadedPages([data.totalPages]);
      }
    }
  }, [data, loadedPages.length]);

  if (!stream) {
    throw new Error('Stream not found');
  }
  return (
    <div>
      <SystemListItem>
        <div>
          <Heading1>{stream.displayName}</Heading1>
          <p>{stream.description}</p>
          <Subheading1>Tracks changes for {stream.type} resources.</Subheading1>
          {data ? (
            <Subheading1>
              <a href={link} rel="noopener noreferrer" target="_blank">
                {link}
              </a>
            </Subheading1>
          ) : null}
        </div>
      </SystemListItem>
      {data && data.totalItems === 0 ? (
        <SystemListItem>
          <div style={{ width: '100%' }}>
            <EmptyState $noMargin>Nothing here yet</EmptyState>
          </div>
        </SystemListItem>
      ) : data ? (
        <ActivityContainer>
          {loadedPages.map((page, n) => {
            const last = n === loadedPages.length - 1;

            return (
              <ViewActivityPage
                incomplete={n === 0}
                key={page}
                page={page}
                name={name}
                secondary={secondary}
                lastLoaded={last}
                onNextPage={next => setLoadedPages(p => [...p, next])}
              />
            );
          })}
        </ActivityContainer>
      ) : null}
    </div>
  );
};

const StreamOverview: React.FC = () => {
  const [customStreamUrl, setCustomStreamURL] = useState('');
  const history = useHistory();

  return (
    <div>
      <SystemListItem>
        <div>
          <Heading1>Activity streams</Heading1>
          <Subheading1>Overview of change discovery streams published by Madoc</Subheading1>
        </div>
      </SystemListItem>
      <SystemListItem $connected>
        <InputContainer style={{ flexDirection: 'row', flex: '1 1 0px', maxWidth: '100%', alignItems: 'baseline' }}>
          <InputLabel>Stream URL</InputLabel>
          <Input
            type="text"
            onChange={e => setCustomStreamURL(e.currentTarget.value)}
            style={{ flex: '1 1 0px', margin: '0 0.5em' }}
          />
          <Button
            $primary
            onClick={() => {
              history.push(`/system/activity-streams?remoteStream=${customStreamUrl}`);
            }}
          >
            View remote stream
          </Button>
        </InputContainer>
      </SystemListItem>

      {streamNames.map(name => {
        const stream = madocStreams[name];
        return (
          <SystemListItem key={name}>
            <div>
              <h3>{stream.displayName}</h3>
              <p>{stream.description}</p>
              <Button as={HrefLink} $primary href={`/system/activity-streams?stream=${name}`}>
                View stream
              </Button>
            </div>
          </SystemListItem>
        );
      })}
    </div>
  );
};
