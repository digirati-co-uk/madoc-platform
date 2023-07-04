import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { useProjectPageConfiguration } from '../../hooks/use-project-page-configuration';
import { useRelativeLinks } from '../../hooks/use-relative-links';
import { SearchBox } from '../../../shared/atoms/SearchBox';
import { useRouteContext } from '../../hooks/use-route-context';

const SearchResourceContainer = styled.div`
  padding: 1em 0;
  width: 500px;

  label {
    font-size: 1em;
    line-height: 2em;
  }
`;
export const SearchResource: React.FC = () => {
  const { t } = useTranslation();
  const options = useProjectPageConfiguration();
  const { projectId, collectionId, manifestId } = useRouteContext();

  const navigate = useNavigate();
  const createLink = useRelativeLinks();
  const resource = manifestId ? 'manifest' : collectionId ? 'collection' : projectId ? 'project' : 'resource';
  const handleSearch = (val: string) => {
    navigate(createLink({ subRoute: 'search', query: { fulltext: val } }));
  };

  return (
    <SearchResourceContainer>
      <label>{t(`Search this ${resource}`)}</label>
      {!options.hideSearchButton ? <SearchBox onSearch={val => handleSearch(val)} placeholder="" value="" /> : null}
    </SearchResourceContainer>
  );
};

blockEditorFor(SearchResource, {
  type: 'default.SearchResource',
  label: 'Search Resource',
  anyContext: ['project', 'collection', 'manifest'],
  requiredContext: [],
  editor: {},
});
