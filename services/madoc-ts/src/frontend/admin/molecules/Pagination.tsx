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
    <div style={{ margin: '2em 0', width: '100%', display: 'flex' }}>
      {prevPage ? (
        <SmallButton as={Link} to={`${pathname}${page > 2 ? `?page=${page - 1}` : ''}`}>
          {t('Previous page')}
        </SmallButton>
      ) : null}
      <div
        style={{ display: 'inline-block', margin: '0 10px', textAlign: 'center', fontSize: '0.9em', flex: '1 1 0px' }}
      >
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
