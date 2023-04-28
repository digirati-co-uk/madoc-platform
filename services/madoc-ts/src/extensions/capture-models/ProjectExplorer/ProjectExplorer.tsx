import { InternationalString } from '@iiif/presentation-3';
import React, { useRef } from 'react';
import { useInfiniteQuery } from 'react-query';
import { RoundedCard } from '../../../frontend/shared/capture-models/editor/components/RoundedCard/RoundedCard';
import { defaultTheme } from '../../../frontend/shared/capture-models/editor/themes';
import { LocaleString } from '../../../frontend/shared/components/LocaleString';
import { Button } from '../../../frontend/shared/navigation/Button';
import { Heading3 } from '../../../frontend/shared/typography/Heading3';
import { useApi } from '../../../frontend/shared/hooks/use-api';
import { useInfiniteAction } from '../../../frontend/site/hooks/use-infinite-action';
import { ThemeProvider } from 'styled-components';

export type ProjectExplorerProps = {
  id: string;
  label: string;
  type: string;
  value: {
    id: string;
    label: InternationalString;
  } | null;
};

export const ProjectExplorer: React.FC<ProjectExplorerProps & {
  updateValue: (value: ProjectExplorerProps['value']) => void;
}> = props => {
  const api = useApi();
  const container = useRef<HTMLDivElement>(null);
  const { data: pages, fetchMore, canFetchMore, isFetchingMore } = useInfiniteQuery(
    ['get-projects-list', {}],
    async (key, _, vars: { page?: number }) => {
      return api.getProjects(vars?.page);
    },
    {
      getFetchMore: lastPage => {
        if (lastPage.pagination.totalPages === 0 || lastPage.pagination.totalPages === lastPage.pagination.page) {
          return undefined;
        }

        return {
          page: lastPage.pagination.page + 1,
        };
      },
    }
  );
  const [loadMoreButton] = useInfiniteAction({
    fetchMore,
    canFetchMore,
    isFetchingMore,
    container: container,
  });

  if (props.value) {
    return (
      <ThemeProvider theme={defaultTheme}>
        <RoundedCard interactive size="small" onClick={() => props.updateValue(null)}>
          <Heading3 as={LocaleString}>{props.value.label}</Heading3>
        </RoundedCard>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <div
        ref={container}
        style={{ maxHeight: 350, overflowY: 'scroll', padding: '1em', border: '2px solid #fefefe', borderRadius: 5 }}
      >
        <div>
          {pages?.map((page, key) => {
            return (
              <React.Fragment key={key}>
                {page.projects.map(project => (
                  <RoundedCard
                    size="small"
                    interactive
                    onClick={() => props.updateValue({ id: project.slug, label: project.label })}
                    key={project.id}
                    label={<LocaleString>{project.label}</LocaleString>}
                  >
                    <LocaleString>{project.summary}</LocaleString>
                  </RoundedCard>
                ))}
              </React.Fragment>
            );
          })}
          <Button ref={loadMoreButton} onClick={() => fetchMore()} style={{ display: canFetchMore ? 'block' : 'none' }}>
            Load more
          </Button>
        </div>
      </div>
    </ThemeProvider>
  );
};
