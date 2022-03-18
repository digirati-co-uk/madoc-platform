import { InternationalString } from '@hyperion-framework/types';
import React, { useRef } from 'react';
import { useInfiniteQuery } from 'react-query';
import { LocaleString } from '../../../frontend/shared/components/LocaleString';
import { Button } from '../../../frontend/shared/navigation/Button';
import { Heading3 } from '../../../frontend/shared/typography/Heading3';
import { useApi } from '../../../frontend/shared/hooks/use-api';
import { useInfiniteAction } from '../../../frontend/site/hooks/use-infinite-action';

export type ProjectSelectorProps = {
  id: string;
  label: string;
  type: string;
  value: {
    id: string;
    label: InternationalString;
  } | null;
};

export const ProjectSelector: React.FC<ProjectSelectorProps & {
  updateValue: (value: ProjectSelectorProps['value']) => void;
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
        if (lastPage.pagination.totalPages === lastPage.pagination.page) {
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
      <div>
        <Heading3 as={LocaleString}>{props.value.label}</Heading3>
        <Button onClick={() => props.updateValue(null)}>Choose another project</Button>
      </div>
    );
  }

  return (
    <div ref={container} style={{ maxHeight: 500, overflowY: 'scroll' }}>
      <div>
        {pages?.map((page, key) => {
          return (
            <React.Fragment key={key}>
              {page.projects.map(project => (
                <div key={project.id} onClick={() => props.updateValue({ id: project.slug, label: project.label })}>
                  <Heading3 as={LocaleString}>{project.label}</Heading3>
                </div>
              ))}
            </React.Fragment>
          );
        })}
        <Button ref={loadMoreButton} onClick={() => fetchMore()} style={{ display: canFetchMore ? 'block' : 'none' }}>
          Load more
        </Button>
      </div>
    </div>
  );
};
