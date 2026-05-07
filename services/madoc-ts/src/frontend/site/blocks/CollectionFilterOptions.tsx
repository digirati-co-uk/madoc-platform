import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { useSubjectMap } from '../../shared/hooks/use-subject-map';
import { HrefLink } from '../../shared/utility/href-link';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { CollectionLoader } from '../pages/loaders/collection-loader';
import { GoToRandomCanvas } from '../features/canvas/GoToRandomCanvas';
import { GoToRandomManifest } from '../features/manifest/GoToRandomManifest';
import { useProjectPageConfiguration } from '../hooks/use-project-page-configuration';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { StartContributingButton } from '../features/project/StartContributingButton';
import { HIDE_COMPLETED_FILTER, SHOW_AVAILABLE_FILTER } from '../../../utility/resource-status';

export interface CollectionFilterOptionsProps {
  buttons?: {
    hideFilterButton?: boolean;
    hideSearchButton?: boolean;
    hideRandomManifest?: boolean;
    hideRandomCanvas?: boolean;
    hideStartContributing?: boolean;
  };
}

export function CollectionFilterOptions(props: CollectionFilterOptionsProps) {
  const { hideFilterButton, hideSearchButton, hideRandomManifest, hideRandomCanvas, hideStartContributing } =
    props.buttons || {};
  const { t } = useTranslation();
  const { data } = usePaginatedData(CollectionLoader);

  const createLink = useRelativeLinks();
  const { c, filter } = useLocationQuery();
  const [, showDoneButton] = useSubjectMap(data ? data.subjects : []);
  const activeFilter = typeof filter === 'undefined' ? undefined : `${filter}`;
  const options = useProjectPageConfiguration();
  const {
    project: { allowCollectionNavigation = true, allowManifestNavigation = true },
  } = useSiteConfiguration();
  if (!data) {
    return null;
  }

  return (
    <>
      {hideStartContributing ? null : <StartContributingButton />}
      <ButtonRow>
        {!hideFilterButton && (showDoneButton || filter) ? (
          <Button
            as={HrefLink}
            href={createLink({
              query: { filter: activeFilter === HIDE_COMPLETED_FILTER ? undefined : HIDE_COMPLETED_FILTER, c },
            })}
          >
            {activeFilter === HIDE_COMPLETED_FILTER ? t('Show completed') : t('Hide completed')}
          </Button>
        ) : null}
        {!hideFilterButton ? (
          <Button
            as={HrefLink}
            href={createLink({
              query: { filter: activeFilter === SHOW_AVAILABLE_FILTER ? undefined : SHOW_AVAILABLE_FILTER, c },
            })}
          >
            {activeFilter === SHOW_AVAILABLE_FILTER ? t('Show all') : t('Show available')}
          </Button>
        ) : null}
        {hideSearchButton ? null : (
          <Button as={Link} to={createLink({ subRoute: 'search' })}>
            {t('Search this collection')}
          </Button>
        )}
        {!hideRandomManifest && allowCollectionNavigation && !options.hideRandomManifest ? (
          <GoToRandomManifest />
        ) : null}
        {!hideRandomCanvas && allowManifestNavigation && !options.hideRandomCanvas ? <GoToRandomCanvas /> : null}
      </ButtonRow>
    </>
  );
}

blockEditorFor(CollectionFilterOptions, {
  requiredContext: ['collection'],
  defaultProps: {
    buttons: {},
  },
  editor: {
    buttons: {
      type: 'checkbox-list-field',
      label: 'Button display options',
      options: [
        {
          label: 'Hide filter button',
          value: 'hideFilterButton',
        },
        {
          label: 'Hide search button',
          value: 'hideSearchButton',
        },
        {
          label: 'Hide random manifest',
          value: 'hideRandomManifest',
        },
        {
          label: 'Hide random canvas',
          value: 'hideRandomCanvas',
        },
        {
          label: 'Hide start contributing',
          value: 'hideStartContributing',
        },
      ],
    },
  },
  label: 'Collection filter options',
  type: 'default.CollectionFilterOptions',
});
