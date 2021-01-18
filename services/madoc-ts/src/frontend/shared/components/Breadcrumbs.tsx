import { InternationalString } from '@hyperion-framework/types';
import React, { useMemo, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LocaleString } from './LocaleString';
import styled, { css } from 'styled-components';

type BreadcrumbContextType = {
  project?: { name: InternationalString; id: number | string };
  collection?: { name: InternationalString; id: number };
  manifest?: { name: InternationalString; id: number };
  canvas?: { name: InternationalString; id: number };
  task?: { name: string; id: string };
  subpage?: { name: InternationalString; path: string };
};

export const BreadcrumbList = styled.div`
  display: flex;
  margin: 0.5em 0;
  font-size: 0.9em;
`;

export const BreadcrumbItem = styled.div<{ active?: boolean }>`
  font-weight: bold;
  &,
  a {
    cursor: pointer;
    text-decoration: none;
    color: rgba(0, 0, 0, 0.7);
    &:hover {
      color: rgba(0, 0, 0, 1);
    }
    ${props =>
      props.active &&
      css`
        cursor: initial;
        color: rgba(0, 0, 0, 1);
      `}
  }
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

  return <BreadcrumbReactContext.Provider value={ctx}>{children}</BreadcrumbReactContext.Provider>;
};

export const DisplayBreadcrumbs: React.FC = () => {
  const breads = useBreadcrumbs();
  const location = useLocation();

  const stack = useMemo(() => {
    const flatList = [];

    // Projects can only be in one place.
    if (breads.project) {
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

    return flatList;
  }, [breads]);

  if (stack.length === 0) {
    return <React.Fragment />;
  }

  return (
    <BreadcrumbList>
      {stack.map((s, n) => (
        <React.Fragment key={s.url}>
          <BreadcrumbItem active={s.url === location.pathname}>
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
    </BreadcrumbList>
  );
};
