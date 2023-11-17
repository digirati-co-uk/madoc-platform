import React, { useCallback } from 'react';
import styled from 'styled-components';
import { NavigationButton, PaginationText } from '../../../../shared/components/NavigationButton';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
import { useRouteContext } from '../../../hooks/use-route-context';
import { useInfiniteData } from '../../../../shared/hooks/use-data';
import { ReviewListingPage } from '../../../components';
import { useRelativeLinks } from '../../../hooks/use-relative-links';

const PaginationContainer = styled.div`
  display: flex;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 13;
  justify-content: space-between;
  align-items: center;
  width: 130px;
  padding: 0;
  button {
    border: none;
    background-color: transparent;
    margin-left: auto;
    svg {
      fill: black !important;
    }
  }
`;

export const ReviewNavigation: React.FC<{
  taskId?: string;
}> = ({ taskId: id }) => {
  const { hash } = useLocation();
  const hsh = hash.slice(1);
  const pg = hsh ? Number(hsh) - 1 : 0;
  const { projectId } = useRouteContext();
  const { sort_by = '', ...query } = useLocationQuery();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const createLink = useRelativeLinks();

  const { data: pages, fetchMore, canFetchMore, isFetchingMore } = useInfiniteData(ReviewListingPage, undefined, {
    keepPreviousData: true,
    getFetchMore: lastPage => {
      if (lastPage.pagination.totalPages === 0 || lastPage.pagination.totalPages === lastPage.pagination.page) {
        return undefined;
      }
      return {
        page: lastPage.pagination.page + 1,
      };
    },
  });

  const idx = pages && pages[pg] ? pages[pg].tasks.findIndex((i: CrowdsourcingTask) => i.id === id) : -1;
  // results per page = 20
  const totalIndex = 20 * pg + (idx + 1);

  const beforeNavigate = useCallback(
    async (newTaskId, page, getNext): Promise<void> => {
      if (!isFetchingMore && canFetchMore && getNext) {
        await fetchMore();
      }
      navigate(createLink({ taskId: undefined, subRoute: `reviews/${newTaskId}`, query: { sort_by }, hash: page }));
    },
    [canFetchMore, createLink, fetchMore, isFetchingMore, navigate, sort_by]
  );

  if (!pages || idx === -1) {
    return null;
  }

  const getPrevPage = () => {
    if (pg - 1 > -1) {
      const prevPageItem = pages[pg - 1].tasks[pages[pg - 1].tasks.length - 1];
      return (
        <NavigationButton
          alignment="left"
          onClick={e => {
            if (beforeNavigate) {
              e.preventDefault();
              if (pages[pg - 1].tasks) {
                return beforeNavigate(prevPageItem.id, pg - 1, false);
              }
            }
          }}
          link={createLink({
            projectId,
            taskId: undefined,
            subRoute: prevPageItem.id,
            query,
            hash: (pg - 1).toString(),
          })}
          item={prevPageItem}
        />
      );
    }
  };

  const getNextPage = () => {
    if (pg + 1 < pages.length) {
      const nextPageItem = pages[pg + 1].tasks[0];

      return (
        <NavigationButton
          alignment="right"
          onClick={e => {
            if (beforeNavigate) {
              e.preventDefault();
              if (pages[pg + 1].tasks) {
                return beforeNavigate(nextPageItem.id, pg + 2, idx + 2 > pages[pg].tasks.length - 1);
              }
            }
          }}
          link={createLink({
            projectId,
            taskId: undefined,
            subRoute: nextPageItem.id,
            query,
            hash: (pg + 1).toString(),
          })}
          item={nextPageItem}
        />
      );
    }
  };

  return (
    <PaginationContainer style={{ display: 'flex' }}>
      {idx > 0 ? (
        <NavigationButton
          alignment="left"
          onClick={e => {
            if (beforeNavigate) {
              e.preventDefault();
              if (pages[pg].tasks) {
                return beforeNavigate(pages[pg].tasks[idx - 1].id, pg + 1, false);
              }
            }
          }}
          link={createLink({
            projectId,
            taskId: undefined,
            subRoute: pages[pg].tasks[idx - 1].id,
            query,
            hash: (pg + 1).toString(),
          })}
          item={pages[pg].tasks[idx - 1]}
        />
      ) : (
        getPrevPage()
      )}
      {idx < pages[pg].tasks.length - 1 ? (
        <NavigationButton
          alignment="right"
          onClick={e => {
            if (beforeNavigate) {
              e.preventDefault();
              if (pages[pg].tasks) {
                return beforeNavigate(pages[pg].tasks[idx + 1].id, pg + 1, idx + 2 > pages[pg].tasks.length - 1);
              }
            }
          }}
          link={createLink({
            projectId,
            taskId: pages[pg].tasks[idx + 1].id,
            query,
          })}
          item={pages[pg].tasks[idx + 1]}
        />
      ) : (
        getNextPage()
      )}
      {
        <PaginationText style={{ color: '#999999' }}>
          {t('{{page}} of {{count}}', {
            page: totalIndex,
            count: pages[0].pagination.totalResults,
          })}
        </PaginationText>
      }
    </PaginationContainer>
  );
};
