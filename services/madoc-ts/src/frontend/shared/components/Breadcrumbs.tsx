import { InternationalString } from '@iiif/presentation-3';
import React, { useMemo, useContext } from 'react';
import { Helmet as _Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { useCurrentAdminPages } from '../../site/hooks/use-current-admin-pages';
import { useSite } from '../hooks/use-site';
import { ErrorBoundary } from '../utility/error-boundary';
import { LocaleString, useLocaleString } from './LocaleString';
import styled, { css } from 'styled-components';

type BreadcrumbContextType = {
  project?: { name: InternationalString; id: number | string };
  collection?: { name: InternationalString; id: number };
  manifest?: { name: InternationalString; id: number };
  canvas?: { name: InternationalString; id: number };
  task?: { name: string; id: string };
  subpage?: { name: InternationalString; path: string };
};

const Helmet: any = _Helmet;

export const BreadcrumbList = styled.div`
  display: flex;
  padding: 0.5em 0;
  font-size: 0.9em;
  min-height: 2.5em;
  margin: 0.5em 0;
  align-items: center;
`;

export const BreadcrumbItem = styled.div<{ active?: boolean; $icon?: boolean; $color?: string; $activeColor?: string }>`
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${props =>
    props.$icon &&
    css`
      width: 1.5em;
      font-size: 1.2em;
      align-items: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-radius: 3px;

      &:hover {
        background: #f0f0f0;
      }
    `}
  &,
  a {
    cursor: pointer;
    text-decoration: none;
    color: ${props => (props.$color ? props.$color : 'rgba(0, 0, 0, 0.7)')};
    &:hover {
      color: rgba(0, 0, 0, 1);
    }
    ${props =>
      props.active &&
      css`
        cursor: initial;
        color: ${props.$activeColor ? props.$activeColor : 'rgba(0, 0, 0, 1)'};
      `}
  }
`;

export const BreadcrumbAdmin = styled.div`
  margin-left: auto;
  display: flex;
  background: #eee;
  border-radius: 3px;

  ${BreadcrumbItem} {
    margin-left: 0.5em;
    font-size: 0.75em;
    padding: 0.4em 0.8em;
  }
`;

const ViewInAdmin = styled.div`
  background: #2b4068;
  border-radius: 3px;
  padding: 0.4em 0.8em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.75em;
`;

const DividerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 24" width="16">
    <path d="M0 0h24v24H0z" fill="none" />
    <path className="divider-arrow" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
);

export const BreadcrumbDivider = styled(DividerIcon)`
  margin: 0 0.5em;

  path.divider-arrow {
    fill: #999;
  }
`;

const BreadcrumbReactContext = React.createContext<BreadcrumbContextType>({});

export const useBreadcrumbs: () => BreadcrumbContextType = () => {
  return useContext(BreadcrumbReactContext) || {};
};

export const BreadcrumbContext: React.FC<BreadcrumbContextType> = ({
  children,
  manifest,
  project,
  collection,
  canvas,
  task,
  subpage,
}) => {
  const parentCtx = useBreadcrumbs();
  const ctx = useMemo(() => {
    const newCtx: BreadcrumbContextType = { ...parentCtx };
    if (project) {
      newCtx.project = project;
    }
    if (collection) {
      newCtx.collection = collection;
    }
    if (manifest) {
      newCtx.manifest = manifest;
    }
    if (canvas) {
      newCtx.canvas = canvas;
    }
    if (task) {
      newCtx.task = task;
    }
    if (subpage) {
      newCtx.subpage = subpage;
    }
    return newCtx;
  }, [parentCtx, manifest, project, collection, canvas, task, subpage]);

  return (
    <ErrorBoundary>
      <BreadcrumbReactContext.Provider value={ctx}>{children}</BreadcrumbReactContext.Provider>
    </ErrorBoundary>
  );
};

export type BreadcrumbProps = {
  currentPage?: string | undefined;
  textColor?: string | undefined;
  textColorActive?: string | undefined;
};

export const DisplayBreadcrumbs: React.FC<BreadcrumbProps> = ({ currentPage, textColor, textColorActive }) => {
  const site = useSite();
  const breads = useBreadcrumbs();
  const location = useLocation();
  const adminLinks = useCurrentAdminPages();
  const { t } = useTranslation();

  const stack = useMemo(() => {
    const flatList = [];

    // Projects can only be in one place.
    if (breads.project) {
      flatList.push({
        label: { none: [t('breadcrumbs__Projects', { defaultValue: t('Projects') })] },
        url: `/projects`,
      });

      flatList.push({
        label: breads.project.name,
        url: `/projects/${breads.project.id}`,
      });
    }

    // Collection can be in 2 places.
    if (breads.collection) {
      if (breads.project) {
        // 1. Under a project
        flatList.push({
          label: breads.collection.name,
          url: `/projects/${breads.project.id}/collections/${breads.collection.id}`,
        });
      } else {
        flatList.push({
          label: { none: [t('breadcrumbs__Collections', { defaultValue: t('Collections') })] },
          url: `/collections`,
        });
        // 2. On it's own
        flatList.push({
          label: breads.collection.name,
          url: `/collections/${breads.collection.id}`,
        });
      }
    }

    // Manifest can be in 4 places.
    if (breads.manifest) {
      if (breads.project) {
        if (breads.collection) {
          // 1. Under collection and project
          flatList.push({
            label: breads.manifest.name,
            url: `/projects/${breads.project.id}/collections/${breads.collection.id}/manifests/${breads.manifest.id}`,
          });
        } else {
          // 2. Just under project
          flatList.push({
            label: breads.manifest.name,
            url: `/projects/${breads.project.id}/manifests/${breads.manifest.id}`,
          });
        }
      } else if (breads.collection) {
        // 3. Just under collection
        flatList.push({
          label: breads.manifest.name,
          url: `/collections/${breads.collection.id}/manifests/${breads.manifest.id}`,
        });
      } else {
        flatList.push({
          label: { none: [t('breadcrumbs__Manifests', { defaultValue: t('Manifests') })] },
          url: `/manifests`,
        });
        // 4. On its own.
        flatList.push({
          label: breads.manifest.name,
          url: `/manifests/${breads.manifest.id}`,
        });
      }
    }

    // Canvas can be in 4 places, same as manifests. Cannot be standalone.
    if (breads.canvas) {
      if (breads.manifest) {
        if (breads.project) {
          if (breads.collection) {
            // 1. Under collection and project
            flatList.push({
              label: breads.canvas.name,
              url: `/projects/${breads.project.id}/collections/${breads.collection.id}/manifests/${breads.manifest.id}/c/${breads.canvas.id}`,
            });
          } else {
            // 2. Just under project
            flatList.push({
              label: breads.canvas.name,
              url: `/projects/${breads.project.id}/manifests/${breads.manifest.id}/c/${breads.canvas.id}`,
            });
          }
        } else if (breads.collection) {
          // 3. Just under collection
          flatList.push({
            label: breads.canvas.name,
            url: `/collections/${breads.collection.id}/manifests/${breads.manifest.id}/c/${breads.canvas.id}`,
          });
        } else {
          // 4. On its own.
          flatList.push({
            label: breads.canvas.name,
            url: `/manifests/${breads.manifest.id}/c/${breads.canvas.id}`,
          });
        }
      }
    }

    if (breads.subpage) {
      flatList.push({
        label: breads.subpage.name,
        url: breads.subpage.path,
      });
    }

    if (currentPage) {
      flatList.push({
        label: { none: [currentPage] },
        url: location.pathname,
      });
    }

    return flatList;
  }, [
    breads.canvas,
    breads.collection,
    breads.manifest,
    breads.project,
    breads.subpage,
    currentPage,
    location.pathname,
    t,
  ]);
  const activePage = stack.find(s => s.url === location.pathname);
  const [pageTitle] = useLocaleString(activePage?.label);

  if (stack.length === 0) {
    return <React.Fragment />;
  }

  return (
    <BreadcrumbList>
      {pageTitle ? (
        <Helmet>
          <title>
            {site.title} - {pageTitle}
          </title>
        </Helmet>
      ) : null}
      {stack.map((s, n) => (
        <React.Fragment key={s.url}>
          <BreadcrumbItem active={s.url === location.pathname} $activeColor={textColorActive} $color={textColor}>
            {s.url === location.pathname ? (
              <LocaleString>{s.label}</LocaleString>
            ) : (
              <Link to={s.url}>
                <LocaleString>{s.label}</LocaleString>
              </Link>
            )}
          </BreadcrumbItem>
          {n < stack.length - 1 ? <BreadcrumbDivider /> : null}
        </React.Fragment>
      ))}
      {adminLinks.length ? (
        <BreadcrumbAdmin>
          <ViewInAdmin>{t('View in Admin')}</ViewInAdmin>
          {adminLinks.map(link => {
            return (
              <BreadcrumbItem key={link.link} $activeColor={textColorActive} $color={textColor}>
                <a href={link.link}>{link.label}</a>
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbAdmin>
      ) : null}
    </BreadcrumbList>
  );
};

blockEditorFor(DisplayBreadcrumbs, {
  type: 'default.DisplayBreadcrumbs',
  label: 'Display breadcrumbs',
  anyContext: ['collection', 'manifest', 'canvas', 'project'],
  defaultProps: {
    textColor: '',
    textColorActive: '',
  },
  editor: {
    textColor: { label: 'Text color', type: 'color-field' },
    textColorActive: { label: 'Text color active', type: 'color-field' },
  },
});
