import { Link, useLocation } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { stringify } from 'query-string';

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
    <div>
      {prevPage ? (
        <Link to={`${pathname}${page > 2 ? `?${pageParam}=${page - 1}` : ''}${q}`}>{t('Previous page')}</Link>
      ) : null}
      {nextPage ? <Link to={`${pathname}?${pageParam}=${page + 1}${q}`}>{t('Next page')}</Link> : null}
    </div>
  );
};
