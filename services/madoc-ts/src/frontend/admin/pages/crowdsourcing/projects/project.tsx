import { Outlet } from 'react-router-dom';
import { useProjectTemplate } from '@/frontend/shared/hooks/use-project-template';
import { useSite } from '@/frontend/shared/hooks/use-site';
import { HrefLink } from '@/frontend//shared/utility/href-link';
import { UniversalComponent } from '@/frontend/types';
import React from 'react';
import { LocaleString } from '@/frontend/shared/components/LocaleString';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '@/frontend/shared/layout/WidePage';
import { useTranslation } from 'react-i18next';
import { useData } from '@/frontend/shared/hooks/use-data';
import { createUniversalComponent } from '@/frontend/shared/utility/create-universal-component';
import { Button } from '@/frontend/shared/navigation/Button';
import type { TabularOutlineSharePayload } from './tabular-project/types';

const DEFAULT_DUPLICATE_URL = (id: string | number) =>
  `/projects/create/remote?template=urn:madoc:project:${encodeURIComponent(String(id))}&duplicateProjectId=${encodeURIComponent(
    String(id)
  )}`;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function encodeOutlinePayloadForUrl(payload: TabularOutlineSharePayload) {
  try {
    const normalizedPayload = unescape(encodeURIComponent(JSON.stringify(payload)));

    if (typeof globalThis.btoa === 'function') {
      return globalThis.btoa(normalizedPayload);
    }

    const bufferLike = (
      globalThis as { Buffer?: { from(input: string, encoding?: string): { toString(encoding?: string): string } } }
    ).Buffer;
    if (bufferLike?.from) {
      return bufferLike.from(normalizedPayload, 'binary').toString('base64');
    }

    return '';
  } catch {
    return '';
  }
}

function isTabularProject(project: { template?: string; template_config?: unknown } | undefined) {
  const hasTabularTemplateConfig =
    !!project?.template_config && typeof project.template_config === 'object' && 'tabular' in project.template_config;
  return project?.template === 'tabular-project' || hasTabularTemplateConfig;
}

function buildTabularDuplicateUrl(project: { id?: number | string; summary?: unknown; template_config?: unknown }) {
  const templateConfig = isObjectRecord(project.template_config) ? project.template_config : null;
  const sourceProjectId = typeof project.id !== 'undefined' ? String(project.id) : '';
  const outlinePayload: TabularOutlineSharePayload = {};

  if (isObjectRecord(project.summary)) {
    outlinePayload.summary = project.summary as TabularOutlineSharePayload['summary'];
  }

  if (templateConfig) {
    if (typeof templateConfig.enableZoomTracking === 'boolean') {
      outlinePayload.enableZoomTracking = templateConfig.enableZoomTracking;
    }

    if (typeof templateConfig.crowdsourcingInstructions === 'string') {
      outlinePayload.crowdsourcingInstructions = templateConfig.crowdsourcingInstructions;
    }

    if (isObjectRecord(templateConfig.iiif)) {
      outlinePayload.iiif = templateConfig.iiif as TabularOutlineSharePayload['iiif'];
    }

    if (isObjectRecord(templateConfig.tabular)) {
      outlinePayload.tabular = templateConfig.tabular as TabularOutlineSharePayload['tabular'];
    }
  }

  const encodedOutline = encodeOutlinePayloadForUrl(outlinePayload);
  const sourceProjectIdQuery = sourceProjectId ? `&duplicateProjectId=${encodeURIComponent(sourceProjectId)}` : '';
  if (!encodedOutline) {
    return `/projects/create/tabular-project?duplicate=1${sourceProjectIdQuery}`;
  }

  return `/projects/create/tabular-project?duplicate=1${sourceProjectIdQuery}&outline=${encodeURIComponent(
    encodedOutline
  )}`;
}

type ProjectType = {
  params: { id: string };
  query: unknown;
  data: any;
  variables: { id: number };
};

export const Project: UniversalComponent<ProjectType> = createUniversalComponent<ProjectType>(
  () => {
    const { t } = useTranslation();
    const { data, status } = useData(Project);
    const { slug } = useSite();
    const projectTemplate = useProjectTemplate(data?.template);
    const tabularProject = isTabularProject(data);
    const duplicateProjectUrl =
      data?.id && tabularProject ? buildTabularDuplicateUrl(data) : data?.id ? DEFAULT_DUPLICATE_URL(data.id) : '#';

    const configFrozen = !!projectTemplate?.configuration?.frozen;
    const noModel = !!projectTemplate?.configuration?.captureModels?.noCaptureModel;
    const noActivity = !!projectTemplate?.configuration?.activity?.noActivity;

    if (!data || status === 'loading' || status === 'error') {
      return <div>loading...</div>;
    }

    return (
      <>
        <AdminHeader
          breadcrumbs={[
            { label: t('Site admin'), link: '/' },
            { label: t('Projects'), link: '/projects' },
            { label: <LocaleString>{data.label}</LocaleString>, link: `/projects/${data.id}`, active: true },
          ]}
          menu={[
            { label: t('Overview'), link: `/projects/${data.id}` },
            { label: t('Details'), link: `/projects/${data.id}/metadata` },
            { label: t('Content'), link: `/projects/${data.id}/content` },
            !configFrozen ? { label: t('Configuration'), link: `/projects/${data.id}/configuration` } : null,
            !noModel ? { label: t('Model'), link: `/projects/${data.id}/model` } : null,
            { label: t('Crowdsourcing'), link: `/projects/${data.id}/tasks` },
            { label: t('Search index'), link: `/projects/${data.id}/search` },
            !noActivity ? { label: t('Activity'), link: `/projects/${data.id}/activity` } : null,
            { label: t('Export'), link: `/projects/${data.id}/export` },
            { label: t('Delete'), link: `/projects/${data.id}/delete` },
          ]}
          title={<LocaleString>{data.label}</LocaleString>}
          subtitle={
            <>
              <Button as="a" href={`/s/${slug}/projects/${data.slug}`}>
                {t('Go to project on site')}
              </Button>
              {projectTemplate && projectTemplate.type !== 'custom' ? (
                <div className="mt-2">
                  <strong>{projectTemplate.metadata.label}</strong> |{' '}
                  <HrefLink href={duplicateProjectUrl}>{t('Duplicate this project →')}</HrefLink>
                </div>
              ) : (
                <div className="mt-2">
                  <strong>{t('Canvas annotation project')}</strong> |{' '}
                  <HrefLink href={duplicateProjectUrl}>{t('Duplicate this project →')}</HrefLink>
                </div>
              )}
            </>
          }
        />
        <WidePage>
          <Outlet />
        </WidePage>
      </>
    );
  },
  {
    getData: async (key, { id }, api) => {
      return api.getProject(id);
    },
    getKey: params => {
      return ['get-project', { id: Number(params.id) }];
    },
  }
);
