import { Link, useLocation } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SmallButton } from '../../shared/atoms/Button';

export const Pagination: React.FC<{ page: number; totalPages: number; stale: boolean }> = ({
  page,
  stale,
  totalPages,
}) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const prevPage = stale || page > 1;
  const nextPage = stale || page < totalPages;

  if (totalPages === 0 && page === 1) {
    return null;
  }

  return (
    <div style={{ margin: '2em 0' }}>
      {prevPage ? (
        <SmallButton as={Link} to={`${pathname}${page > 2 ? `?page=${page - 1}` : ''}`}>
          {t('Previous page')}
        </SmallButton>
      ) : null}
      <div style={{ display: 'inline-block', margin: 10, fontSize: '0.9em' }}>
        Page {page} of {totalPages}
      </div>
      {nextPage ? (
        <SmallButton as={Link} to={`${pathname}?page=${page + 1}`}>
          {t('Next page')}
        </SmallButton>
      ) : null}
    </div>
  );
};
