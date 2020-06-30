import { Link, useLocation } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { stringify } from 'query-string';
import { TinyButton } from '../atoms/Button';

export const Pagination: React.FC<{
  page: number;
  totalPages: number;
  stale: boolean;
  pageParam?: string;
  extraQuery?: any;
}> = ({ page, stale, totalPages, pageParam = 'page', extraQuery }) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const prevPage = stale || page > 1;
  const nextPage = stale || page < totalPages;
  const q = extraQuery ? `&${stringify(extraQuery)}` : '';

  return (
    <div style={{ margin: '2em 0' }}>
      {prevPage ? (
        <TinyButton as={Link} to={`${pathname}${page > 2 ? `?${pageParam}=${page - 1}` : ''}${q}`}>
          {t('Previous page')}
        </TinyButton>
      ) : null}
      <div style={{ display: 'inline-block', margin: 10, fontSize: '0.9em' }}>
        Page {page} of {totalPages}
      </div>
      {nextPage ? (
        <TinyButton as={Link} to={`${pathname}?${pageParam}=${page + 1}${q}`}>
          {t('Next page')}
        </TinyButton>
      ) : null}
    </div>
  );
};
