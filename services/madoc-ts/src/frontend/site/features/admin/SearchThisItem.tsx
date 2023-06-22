import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/navigation/Button';
import { useProjectPageConfiguration } from '../../hooks/use-project-page-configuration';
import { useRelativeLinks } from '../../hooks/use-relative-links';

export const SearchThisItem: React.FC = () => {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const options = useProjectPageConfiguration();

  // Search this Project

    //https://madoc.local/s/default/projects/my-project/search

    //s/default/madoc/api/search
    //facet_on_manifests	true
    // facets	[]
    // fulltext	""
    // non_latin_fulltext	false
    // projectId	"my-project"
    // search_multiple_fields	false
    // search_type	"websearch"

    ///s/default/madoc/api/search
    //facet_on_manifests	true
    // facets	[]
    // fulltext	""
    // iiif_type	"Manifest"
    // non_latin_fulltext	false
    // search_multiple_fields	false
    // search_type	"websearch"

  // Search this Manifest
  // Search this Collection
  return (
    <div>
      {!options.hideSearchButton ? (
        <Button as={Link} to={createLink({ subRoute: 'search' })}>
          {t('Search this project')}
        </Button>
      ) : null}
    </div>
  );
};
