import React, { useEffect, useMemo, useState } from 'react';
import { mapStackTrace } from 'sourcemapped-stacktrace';
import styled from 'styled-components';
import type { CurrentUserWithScope } from '../../../extensions/site-manager/types';
import { useUser } from '../hooks/use-site';
import { Button, ButtonRow } from '../navigation/Button';
import { ErrorMessage } from '../callouts/ErrorMessage';
import { WidePageWrapper } from '../layout/WidePage';

const Shell = styled.div`
  min-height: min(75vh, 780px);
  display: flex;
  align-items: center;
  padding: 36px 0;
`;

const Card = styled.section`
  width: 100%;
  border-radius: 18px;
  border: 1px solid rgba(24, 40, 64, 0.1);
  background: linear-gradient(145deg, #ffffff 0%, #f7f9fc 100%);
  box-shadow: 0 16px 40px rgba(34, 54, 88, 0.14);
  padding: 28px;
`;

const StatusPill = styled.p`
  margin: 0 0 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: #185f7d;
  background: #e9f6fb;
  border-radius: 999px;
  padding: 8px 12px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #1e8db7;
  }
`;

const Heading = styled.h1`
  margin: 0;
  font-size: clamp(1.7rem, 3.2vw, 2.1rem);
  color: #15253a;
  line-height: 1.2;
`;

const Subheading = styled.p`
  margin: 12px 0 0;
  max-width: 62ch;
  color: #425366;
  font-size: 1rem;
  line-height: 1.5;
`;

const ActionRow = styled(ButtonRow)`
  margin-top: 20px;
`;

const ErrorDetails = styled.details`
  margin-top: 20px;

  summary {
    cursor: pointer;
    color: #17466b;
    font-weight: 600;
  }
`;

const AdminTools = styled.div`
  margin-top: 20px;
  border-top: 1px solid rgba(24, 40, 64, 0.12);
  padding-top: 18px;
`;

const AdminToolsLabel = styled.p`
  margin: 0 0 12px;
  color: #355167;
  font-weight: 600;
`;

const AdminToolsButtons = styled(ButtonRow)`
  margin-top: 0;
`;

type AdminLink = { label: string; href: string };

function getValueAfter(segments: string[], key: string) {
  const index = segments.indexOf(key);
  if (index === -1 || !segments[index + 1]) {
    return undefined;
  }
  return segments[index + 1];
}

function getAdminRoot(pathname: string) {
  const slugMatch = pathname.match(/^\/s\/([^/]+)/);
  if (slugMatch) {
    return `/s/${slugMatch[1]}/admin`;
  }
  if (pathname.startsWith('/admin')) {
    return '/admin';
  }
  return '';
}

function getAdminLinksForPathname(pathname: string): AdminLink[] {
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map(segment => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });
  const collectionId = getValueAfter(segments, 'collections');
  const manifestId = getValueAfter(segments, 'manifests');
  const canvasId = getValueAfter(segments, 'canvases') || getValueAfter(segments, 'c');
  const adminRoot = getAdminRoot(pathname);
  const toAdminPath = (path: string) => `${adminRoot}${path}`;

  const links: AdminLink[] = [];
  if (collectionId) {
    links.push({ label: `Collection ${collectionId}`, href: toAdminPath(`/collections/${collectionId}`) });
  }
  if (manifestId) {
    links.push({ label: `Manifest ${manifestId}`, href: toAdminPath(`/manifests/${manifestId}`) });
  }
  if (canvasId) {
    links.push({
      label: `Canvas ${canvasId}`,
      href: manifestId
        ? toAdminPath(`/manifests/${manifestId}/canvases/${canvasId}`)
        : toAdminPath(`/canvases/${canvasId}`),
    });
  }

  return links;
}

function getUserFromHydration(): CurrentUserWithScope | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }
  try {
    const hydratedData = document.getElementById('react-site-data');
    if (!hydratedData?.innerText) {
      return undefined;
    }
    const json = JSON.parse(hydratedData.innerText);
    return json?.user as CurrentUserWithScope | undefined;
  } catch {
    return undefined;
  }
}

function canViewAdminLinks(user?: CurrentUserWithScope) {
  if (!user) {
    return false;
  }
  const scope = user.scope || [];
  return (
    user.role === 'global_admin' ||
    user.site_role === 'admin' ||
    scope.includes('site.admin') ||
    scope.includes('tasks.admin')
  );
}

export const NotFoundPage: React.FC<{ error?: any }> = () => {
  return <h1>Not found</h1>;
};

export const ErrorPage: React.FC<{ error?: Error; resetError?: () => void; user?: CurrentUserWithScope }> = props => {
  const [trace, setTrace] = useState<string[]>([]);
  const contextUser = useUser();
  const hydratedUser = useMemo(() => {
    if (props.user || contextUser) {
      return undefined;
    }
    return getUserFromHydration();
  }, [props.user, contextUser]);
  const user = props.user || contextUser || hydratedUser;
  const adminLinks = useMemo(() => {
    if (typeof window === 'undefined' || !canViewAdminLinks(user)) {
      return [];
    }
    return getAdminLinksForPathname(window.location.pathname);
  }, [user]);

  useEffect(() => {
    if (props.error && props.error.stack) {
      try {
        mapStackTrace(props.error.stack, setTrace);
      } catch {
        setTrace(props.error.stack.split('\n'));
      }
    }
  }, [props.error]);

  return (
    <WidePageWrapper>
      <Shell>
        <Card role="alert" aria-live="polite">
          <StatusPill>
            <span aria-hidden="true" />
            Temporary issue
          </StatusPill>
          <Heading>Something went wrong.</Heading>
          <Subheading>
            We could not finish this request. Please try reloading the page. If the problem persists, wait a moment
            and try again.
          </Subheading>
          <ActionRow>
            <Button as="a" href="">
              Refresh page
            </Button>
            {props.resetError ? <Button onClick={props.resetError}>Reset error</Button> : null}
          </ActionRow>
          {adminLinks.length ? (
            <AdminTools>
              <AdminToolsLabel>Admin links from this URL</AdminToolsLabel>
              <AdminToolsButtons>
                {adminLinks.map(link => (
                  <Button key={link.href} as="a" href={link.href}>
                    {link.label}
                  </Button>
                ))}
              </AdminToolsButtons>
            </AdminTools>
          ) : null}
          {props.error ? (
            <ErrorDetails>
              <summary>Show technical details</summary>
              <ErrorMessage style={{ padding: '0.5em 1.5em', marginTop: 12 }}>
                <h2>{props.error.name}</h2>
                <pre>{props.error.message}</pre>
                {trace.map((item, idx) => (
                  <pre key={idx}>{item}</pre>
                ))}
              </ErrorMessage>
            </ErrorDetails>
          ) : null}
        </Card>
      </Shell>
    </WidePageWrapper>
  );
};
