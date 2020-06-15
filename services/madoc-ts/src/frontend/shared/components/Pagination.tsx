import { Link, useLocation } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const Pagination: React.FC<{ page: number; totalPages: number; stale: boolean; pageParam?: string }> = ({
  page,
  stale,
  totalPages,
  pageParam = 'page',
}) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const prevPage = stale || page > 1;
  const nextPage = stale || page < totalPages;

  return (
    <div>
      {prevPage ? <Link to={`${pathname}${page > 2 ? `?${pageParam}=${page - 1}` : ''}`}>{t('Previous page')}</Link> : null}
      {nextPage ? <Link to={`${pathname}?${pageParam}=${page + 1}`}>{t('Next page')}</Link> : null}
    </div>
  );
};
