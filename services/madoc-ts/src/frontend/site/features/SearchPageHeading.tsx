import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useSearchQuery } from '../hooks/use-search-query';
import { useBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Heading1 } from '../../shared/typography/Heading1';
import { LocaleString } from '../../shared/components/LocaleString';
import styled from 'styled-components';

export const SearchHeadingContainer = styled.div`
  h1 {
    display: flex;

    span {
      &[data-position='first'] {
        order: 0;
        ::after {
          content: '\\00a0 ';
        }
      }

      &[data-position='last'] {
        order: 1;
        ::before {
          content: '\\00a0 ';
        }
      }

      &[data-position='none'] {
        display: none;
      }
    }
  }
`;

export const SearchHeading: React.FC<{
  title?: string;
  queryPosition?: string;
}> = ({ title = 'search', queryPosition = 'first' }) => {
  const { fulltext } = useSearchQuery();

  const breads = useBreadcrumbs();
  const isGlobal = !!breads.subpage;

  const getHeading = () => {
    if (breads.manifest) return breads.manifest?.name;
    else if (breads.collection) return breads.collection.name;
    else {
      return breads.project?.name;
    }
  };

  return (
    <SearchHeadingContainer>
      {isGlobal ? (
        <>
          <Heading1>
            <span data-position={queryPosition}>{!fulltext || fulltext === ' ' ? null : `“${fulltext}”`}</span>
            <LocaleString>{title}</LocaleString>
          </Heading1>
        </>
      ) : (
        <Heading1>
          <LocaleString data-position={queryPosition}>{getHeading()}</LocaleString>
          <LocaleString>{title}</LocaleString>
        </Heading1>
      )}
    </SearchHeadingContainer>
  );
};

blockEditorFor(SearchHeading, {
  type: 'default.SearchHeading',
  label: 'Search heading',
  anyContext: ['collection', 'manifest', 'canvas', 'project', 'topic', 'topicType'],
  requiredContext: ['page'],
  defaultProps: {
    queryPosition: 'first',
    title: 'search',
  },
  editor: {
    queryPosition: {
      label: 'Search Query position',
      type: 'dropdown-field',
      options: [
        { value: 'last', text: 'Show after' },
        { value: 'first', text: 'Show before' },
        { value: 'none', text: 'Dont show' },
      ],
    },
    title: {
      label: 'Additional title',
      type: 'text-field',
    },
  },
});
