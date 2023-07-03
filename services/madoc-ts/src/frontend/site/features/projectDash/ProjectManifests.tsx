import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { CanvasStatus } from '../../../shared/atoms/CanvasStatus';
import { Heading3 } from '../../../shared/typography/Heading3';
import { SingleLineHeading5, Subheading5 } from '../../../shared/typography/Heading5';
import { ImageGrid } from '../../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../../shared/atoms/Images';
import { LocaleString, useCreateLocaleString } from '../../../shared/components/LocaleString';
import { useSubjectMap } from '../../../shared/hooks/use-subject-map';
import { useProject } from '../../hooks/use-project';
import { useProjectManifests } from '../../hooks/use-project-manifests';
import { useSiteConfiguration } from '../SiteConfigurationContext';
import { ImageStripBox } from '../../../shared/atoms/ImageStrip';

export function ProjectManifests(props: {
  background?: string;
  list?: boolean;
  textColor?: string;
  cardBorder?: string;
  imageStyle?: string;
}) {
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

  return (
    <>
      <Heading3>{t('Manifests')}</Heading3>
      <ImageGrid data-view-list={props.list}>
        {manifests.collection.items.map((manifest, idx) => (
          <Link
            key={`${manifest.id}_${idx}`}
            to={
              manifest.type === 'manifest'
                ? `/projects/${project.slug}/manifests/${manifest.id}`
                : `/projects/${project.slug}/collections/${manifest.id}`
            }
          >
            <ImageStripBox
              data-view-list={props.list}
              $border={props.cardBorder ? props.cardBorder : '#999'}
              $color={props.textColor}
              $bgColor={props.background}
            >
              <CroppedImage $covered={props.imageStyle === 'covered'}>
                {manifest.thumbnail ? (
                  <img alt={createLocaleString(manifest.label, t('Untitled manifest'))} src={manifest.thumbnail} />
                ) : null}
              </CroppedImage>
              {subjects && subjectMap ? <CanvasStatus status={subjectMap[manifest.id]} /> : null}

              <LocaleString as={SingleLineHeading5}>{manifest.label}</LocaleString>
              <Subheading5>
                {manifest.type === 'manifest'
                  ? t('{{count}} images', { count: manifest.canvasCount })
                  : t('{{count}} manifests', { count: manifest.canvasCount })}
              </Subheading5>
            </ImageStripBox>
          </Link>
        ))}
      </ImageGrid>
    </>
  );
}

blockEditorFor(ProjectManifests, {
  type: 'default.ProjectManifests',
  label: 'Project manifests',
  anyContext: ['project'],
  requiredContext: ['project'],
  defaultProps: {
    background: '',
    list: false,
    textColor: '',
    cardBorder: '#999',
    imageStyle: 'fit',
  },
  editor: {
    list: { type: 'checkbox-field', label: 'View', inlineLabel: 'Display as list' },
    background: { label: 'Card background color', type: 'color-field' },
    textColor: { label: 'Card text color', type: 'color-field' },
    cardBorder: { label: 'Card border', type: 'color-field' },
    imageStyle: {
      label: 'Image Style',
      type: 'dropdown-field',
      options: [
        { value: 'covered', text: 'covered' },
        { value: 'fit', text: 'fit' },
      ],
    },
  },
});
