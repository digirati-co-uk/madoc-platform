import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useSearchQuery } from '../hooks/use-search-query';
import { useSearchFacets } from '../hooks/use-search-facets';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { SearchBox } from '../../shared/atoms/SearchBox';
import { Dropdown } from '../../shared/capture-models/editor/atoms/Dropdown';

const SearchBoxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DropdownContainer = styled.div`
  margin: 1em 1em 1em 0;
  font-size: 0.9em;
  font-weight: 400;
  min-width: 250px;

  & strong {
    font-size: 0.9em;
    font-weight: 400;
  }
`;

export const SearchPageSearch: React.FC = () => {
  const { t } = useTranslation();
  const { fulltext, rscType } = useSearchQuery();

  const { setFullTextQuery, setResourceType } = useSearchFacets();

  return (
    <SearchBoxContainer>
      <SearchBox onSearch={setFullTextQuery} placeholder="Keywords" value={fulltext} key={fulltext} />

      <DropdownContainer>
        <Dropdown
          key={fulltext}
          placeholder={t('Type')}
          value={rscType}
          onChange={val => {
            setResourceType(val || '');
          }}
          options={[
            {
              value: '',
              text: 'All results',
            },
            {
              value: 'manifest',
              text: 'Documents',
            },
            {
              value: 'canvas',
              text: 'Pages',
            },
          ]}
        />
      </DropdownContainer>
    </SearchBoxContainer>
  );
};

blockEditorFor(SearchPageSearch, {
  label: 'Search Page Search',
  type: 'default.SearchPageSearch',
  anyContext: ['collection', 'manifest', 'canvas', 'project', 'topic', 'topicType'],
  requiredContext: ['page'],
  defaultProps: {},
  editor: {},
});
