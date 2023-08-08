import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { CanvasStatus } from '../../../shared/atoms/CanvasStatus';
import { LocaleString, useCreateLocaleString } from '../../../shared/components/LocaleString';
import { useSubjectMap } from '../../../shared/hooks/use-subject-map';
import { HrefLink } from '../../../shared/utility/href-link';
import { useSiteConfiguration } from '../../../site/features/SiteConfigurationContext';
import { useProject } from '../../../site/hooks/use-project';
import { useProjectManifests } from '../../../site/hooks/use-project-manifests';

export function ProjectManifestList(props: { square?: boolean; dark?: boolean; cover?: boolean; center?: boolean }) {
  const { t } = useTranslation();
  const {
    project: { allowManifestNavigation, hideProjectManifestNavigation },
  } = useSiteConfiguration();
  const { data: project } = useProject();
  const createLocaleString = useCreateLocaleString();
  const { data: manifests } = useProjectManifests();
  const subjects = manifests?.subjects;
  const [subjectMap] = useSubjectMap(subjects);

  if (
    !allowManifestNavigation ||
    hideProjectManifestNavigation ||
    !manifests ||
    !manifests.collection.items.length ||
    !project
  ) {
    return null;
  }

  const lessThan5Items = manifests.collection.items.length <= 4;
  const grid = lessThan5Items ? 'grid grid-cols-4' : 'grid grid-t-md';

  const aspect = props.square ? 'aspect-square' : 'aspect-video';
  const bg = props.dark ? 'bg-black' : 'bg-gray-200';
  const fit = props.cover ? 'object-cover' : 'object-contain';
  const textCenter = props.center ? 'text-center' : '';

  return (
    <section className="my-5">
      <h3 className={`text-xl font-semibold mb-4 ${textCenter}`}>{t('Manifests')}</h3>
      <div className={`grid gap-5 ${grid}`}>
        {manifests.collection.items.map((manifest, idx) => (
          <Link
            className="no-underline"
            key={`${manifest.id}_${idx}`}
            to={
              manifest.type === 'manifest'
                ? `/projects/${project.slug}/manifests/${manifest.id}`
                : `/projects/${project.slug}/collections/${manifest.id}`
            }
          >
            <div className="p-2 border hover:bg-gray-50 hover:border-gray-300">
              <div className={`flex items-center justify-center ${bg} ${aspect} `}>
                {manifest.thumbnail ? (
                  <img
                    alt={createLocaleString(manifest.label, t('Untitled manifest'))}
                    src={manifest.thumbnail}
                    className={`${fit} inline-block h-full w-full`}
                  />
                ) : null}
              </div>

              {subjects && subjectMap ? <CanvasStatus status={subjectMap[manifest.id]} /> : null}

              <LocaleString
                as="div"
                className="mt-2 font-semibold text-sm overflow-hidden whitespace-nowrap overflow-ellipsis"
              >
                {manifest.label}
              </LocaleString>

              <div className="text-sm text-gray-500">
                {manifest.type === 'manifest'
                  ? t('{{count}} images', { count: manifest.canvasCount })
                  : t('{{count}} manifests', { count: manifest.canvasCount })}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex">
        <HrefLink
          href={`/projects/${project.slug}/manifests`}
          className="hover:underline ml-auto p-2 flex items-center gap-2"
        >
          {t('View all manifests')}
        </HrefLink>
      </div>
    </section>
  );
}

blockEditorFor(ProjectManifestList, {
  type: 'default.ProjectManifestList',
  label: 'Project manifest list',
  anyContext: ['project'],
  requiredContext: ['project'],
  defaultProps: {
    square: false,
    dark: false,
    cover: false,
    center: false,
  },
  editor: {
    square: {
      label: 'Square or rectangle aspect ratio',
      type: 'checkbox-field',
      inlineLabel: 'Square',
    },
    dark: {
      label: 'Light or dark',
      type: 'checkbox-field',
      inlineLabel: 'Dark',
    },
    cover: {
      label: 'Cover or contain',
      type: 'checkbox-field',
      inlineLabel: 'Cover',
    },
    center: {
      label: 'Center text',
      type: 'checkbox-field',
      inlineLabel: 'Center',
    },
  },
});
