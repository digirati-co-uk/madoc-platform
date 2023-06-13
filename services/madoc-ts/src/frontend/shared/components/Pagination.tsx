import { Link, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { stringify } from 'query-string';
import { SmallButton, Button } from '../navigation/Button';

import styled from 'styled-components';
import { HrefLink } from '../utility/href-link';

const PaginationContainer = styled.div`
  margin: 2em 0;
  display: flex;
  background: #eee;
  padding: 0.3em;
  border-radius: 5px;
`;

const PaginationContainerNumbered = styled.div`
  margin: 2em 0;
  display: flex;
  justify-content: flex-end;
  padding: 0.3em;
`;

const PaginationDisplay = styled.div`
  margin-left: auto;
  margin-right: auto;
  font-size: 0.8em;
  align-self: center;
`;

export const Pagination: React.FC<{
  hash?: string;
  page?: number;
  totalPages?: number;
  stale: boolean;
  pageParam?: string;
  extraQuery?: any;
  position?: 'flex-end' | 'flex-start' | 'center';
  size?: 'lg' | 'md' | 'sm';
}> = ({
  hash,
  page: propsPage,
  stale,
  totalPages: propsTotalPages,
  pageParam = 'page',
  extraQuery: { page: _, ...extraQuery } = {},
  position,
}) => {
  const [page, setStalePage] = useState(propsPage);
  const [totalPages, setStaleTotalPages] = useState(propsTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const { pathname } = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof propsPage !== 'undefined') {
      setIsLoading(false);
      setStalePage(propsPage);
    } else {
      setIsLoading(true);
    }

    if (typeof propsTotalPages !== 'undefined') {
      setIsLoading(false);
      setStaleTotalPages(propsTotalPages);
    } else {
      setIsLoading(true);
    }
  }, [propsPage, propsTotalPages]);

  if (typeof page === 'undefined' || typeof totalPages === 'undefined' || propsTotalPages === 1) return null;

  const prevPage = stale || page > 1;
  const nextPage = stale || page < totalPages;
  const q = extraQuery && Object.keys(extraQuery).length ? `${stringify(extraQuery)}` : '';

  if (totalPages === 0) {
    return null;
  }

  return (
    <PaginationContainer style={{ justifyContent: position }}>
      <SmallButton
        disabled={!prevPage || isLoading}
        as={HrefLink}
        href={`${pathname}${page > 2 ? `?${pageParam}=${page - 1}&` : q ? '?' : ''}${q}${hash ? `#${hash}` : ''}`}
      >
        {isLoading ? t('loading...') : t('Previous page')}
      </SmallButton>
      <PaginationDisplay style={{ color: isLoading ? '#999' : '#666' }}>
        {t('Page {{page}} of {{count}}', { page, count: totalPages })}
      </PaginationDisplay>

      <SmallButton
        as={HrefLink}
        disabled={!nextPage || isLoading}
        href={`${pathname}?${pageParam}=${page + 1}${q ? `&${q}` : ''}${hash ? `#${hash}` : ''}`}
      >
        {isLoading ? t('loading...') : t('Next page')}
      </SmallButton>
    </PaginationContainer>
  );
};

export const PaginationNumbered: React.FC<{
  page?: number;
  totalPages?: number;
  stale: boolean;
  pageParam?: string;
  extraQuery?: any;
  position?: 'flex-end' | 'flex-start' | 'center';
}> = ({ page: propsPage, stale, totalPages: propsTotalPages, pageParam = 'page', extraQuery, position }) => {
  const [page, setStalePage] = useState(propsPage);
  const [totalPages, setStaleTotalPages] = useState(propsTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const { pathname } = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    if (typeof propsPage !== 'undefined') {
      setIsLoading(false);
      setStalePage(propsPage);
    } else {
      setIsLoading(true);
    }

    if (typeof propsTotalPages !== 'undefined') {
      setIsLoading(false);
      setStaleTotalPages(propsTotalPages);
    } else {
      setIsLoading(true);
    }
  }, [propsPage, propsTotalPages]);

  if (typeof page === 'undefined' || typeof totalPages === 'undefined' || propsTotalPages === 1) return null;

  const prevPage = stale || page > 1;
  const nextPage = stale || page < totalPages;

  const q = extraQuery && Object.keys(extraQuery).length ? `${stringify(extraQuery)}` : '';

  if (totalPages === 0) {
    return null;
  }

  return (
    <PaginationContainerNumbered style={{ justifyContent: position }}>
      {prevPage ? (
        <Button as={Link} to={`${pathname}${page > 2 ? `?${pageParam}=${page - 1}&` : q ? '?' : ''}${q}`}>
          {t('Previous page')}
        </Button>
      ) : null}
      {prevPage ? (
        <Button as={Link} to={`${pathname}${page >= 2 ? `?${pageParam}=${page - 1}&` : q ? '?' : ''}${q}`}>
          {page >= 2 ? `${page - 1}` : ``}
        </Button>
      ) : null}
      <Button
        style={{ background: '#e9e9e9' }}
        as={Link}
        to={`${pathname}${page ? `?${pageParam}=${page}&` : q ? '?' : ''}${q}`}
      >
        {page}
      </Button>
      {nextPage ? (
        <Button as={Link} to={`${pathname}?${pageParam}=${page + 1}${q ? `&${q}` : ''}`}>
          {`${page + 1}`}
        </Button>
      ) : null}
      {nextPage ? (
        <Button as={Link} to={`${pathname}?${pageParam}=${page + 1}${q ? `&${q}` : ''}`}>
          {t('Next page')}
        </Button>
      ) : null}
    </PaginationContainerNumbered>
  );
};
