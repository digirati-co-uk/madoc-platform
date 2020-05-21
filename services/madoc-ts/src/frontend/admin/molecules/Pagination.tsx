import { Link, useLocation } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const Pagination: React.FC<{ page: number; totalPages: number; stale: boolean }> = ({
  page,
  stale,
  totalPages,
}) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const prevPage = stale || page > 1;
  const nextPage = stale || page < totalPages;

  return (
    <div>
      {prevPage ? <Link to={`${pathname}${page > 2 ? `?page=${page - 1}` : ''}`}>{t('Previous page')}</Link> : null}
      {nextPage ? <Link to={`${pathname}?page=${page + 1}`}>{t('Next page')}</Link> : null}
    </div>
  );
};
