import { Link, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { stringify } from 'query-string';
import { SmallButton, SmallRoundedButton, MediumRoundedButton } from '../atoms/Button';

import styled from 'styled-components';
import { HrefLink } from '../utility/href-link';

const PaginationContainer = styled.div`
  margin: 2em 0;
  display: flex;
  background: #eee;
  padding: 0.3em;
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
  page?: number;
  totalPages?: number;
  stale: boolean;
  pageParam?: string;
  extraQuery?: any;
}> = ({
  page: propsPage,
  stale,
  totalPages: propsTotalPages,
  pageParam = 'page',
  extraQuery: { page: _, ...extraQuery } = {},
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
    <PaginationContainer>
      <SmallRoundedButton
        disabled={!prevPage || isLoading}
        as={HrefLink}
        href={`${pathname}${page > 2 ? `?${pageParam}=${page - 1}&` : q ? '?' : ''}${q}`}
      >
        {isLoading ? t('loading...') : t('Previous page')}
      </SmallRoundedButton>
      <PaginationDisplay style={{ color: isLoading ? '#999' : '#666' }}>
        Page {isLoading ? '...' : page} of {totalPages}
      </PaginationDisplay>

      <SmallRoundedButton
        as={HrefLink}
        disabled={!nextPage || isLoading}
        href={`${pathname}?${pageParam}=${page + 1}${q ? `&${q}` : ''}`}
      >
        {isLoading ? t('loading...') : t('Next page')}
      </SmallRoundedButton>
    </PaginationContainer>
  );
};

export const PaginationNumbered: React.FC<{
  page?: number;
  totalPages?: number;
  stale: boolean;
  pageParam?: string;
  extraQuery?: any;
}> = ({ page: propsPage, stale, totalPages: propsTotalPages, pageParam = 'page', extraQuery }) => {
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
    <PaginationContainerNumbered>
      {prevPage ? (
        <MediumRoundedButton as={Link} to={`${pathname}${page > 2 ? `?${pageParam}=${page - 1}&` : q ? '?' : ''}${q}`}>
          {t('Previous')}
        </MediumRoundedButton>
      ) : null}
      {prevPage ? (
        <MediumRoundedButton as={Link} to={`${pathname}${page >= 2 ? `?${pageParam}=${page - 1}&` : q ? '?' : ''}${q}`}>
          {page >= 2 ? `${page - 1}` : ``}
        </MediumRoundedButton>
      ) : null}
      <MediumRoundedButton
        style={{ background: '#e9e9e9' }}
        as={Link}
        to={`${pathname}${page ? `?${pageParam}=${page}&` : q ? '?' : ''}${q}`}
      >
        {page}
      </MediumRoundedButton>
      {nextPage ? (
        <MediumRoundedButton as={Link} to={`${pathname}?${pageParam}=${page + 1}${q ? `&${q}` : ''}`}>
          {`${page + 1}`}
        </MediumRoundedButton>
      ) : null}
      {nextPage ? (
        <MediumRoundedButton as={Link} to={`${pathname}?${pageParam}=${page + 1}${q ? `&${q}` : ''}`}>
          {t('Next')}
        </MediumRoundedButton>
      ) : null}
    </PaginationContainerNumbered>
  );
};
