import React from 'react';
import { useTranslation } from 'react-i18next';
import { createLink } from '../../../../shared/utility/create-link';
import styled, { css } from 'styled-components';
import { NavigationButton } from '../../../../shared/components/CanvasNavigationMinimalist';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';

export const PaginationContainer = styled.div<{ $size?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 250px;
  padding: 0;
  margin-left: auto;
  button {
    border: none;
    background-color: transparent;
  }
`;

export const ReviewNavigation: React.FC<{
  handleNavigation?: (taskId: string, page: number | string) => Promise<void> | void;
  taskId?: string;
  projectId?: string;
  subRoute?: string;
  pages?: any;
  query?: any;
  size?: string | undefined;
}> = ({ taskId: id, pages: pages, projectId, subRoute, query, handleNavigation, size }) => {

  const hash = window.location.hash.slice(1);
  const pg = hash ? Number(hash) - 1 : 0;
  const idx = pages && pages[pg].tasks ? pages[pg].tasks.findIndex((i: CrowdsourcingTask) => i.id === id) : -1;

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
            if (handleNavigation) {
              e.preventDefault();
              if (pages[pg - 1].tasks) {
                handleNavigation(prevPageItem.id, pg - 1);
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
            if (handleNavigation) {
              e.preventDefault();
              if (pages[pg + 1].tasks) {
                handleNavigation(nextPageItem.id, pg + 2);
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
    <PaginationContainer style={{ display: 'flex' }} $size={size}>
      {idx > 0 ? (
        <NavigationButton
          alignment="left"
          onClick={e => {
            if (handleNavigation) {
              e.preventDefault();
              if (pages[pg].tasks) {
                handleNavigation(pages[pg].tasks[idx - 1].id, pg + 1);
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
            if (handleNavigation) {
              e.preventDefault();
              if (pages[pg].tasks) {
                handleNavigation(pages[pg].tasks[idx + 1].id, pg + 1);
              }
            }
          }}
          link={createLink({
            projectId,
            taskId: pages[pg].tasks[idx + 1].id,
            subRoute,
            query,
          })}
          item={pages[pg].tasks[idx + 1]}
        />
      ) : (
        getNextPage()
      )}
    </PaginationContainer>
  );
};
