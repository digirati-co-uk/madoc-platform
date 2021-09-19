import { stringify } from 'query-string';
import { Link, useLocation } from 'react-router-dom';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SmallButton } from '../../shared/navigation/Button';

export const Pagination: React.FC<{ page: number; totalPages: number; stale: boolean; extraQuery?: any }> = ({
  page,
  stale,
  totalPages,
  extraQuery,
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
        <SmallButton
          as={Link}
          to={`${pathname}${
            page > 2
              ? `?${stringify({ ...extraQuery, page: page - 1 })}`
              : extraQuery
              ? `?${stringify({ ...extraQuery })}`
              : ''
          }`}
        >
          {t('Previous page')}
        </SmallButton>
      ) : null}
      <div
        style={{ display: 'inline-block', margin: '0 10px', textAlign: 'center', fontSize: '0.9em', flex: '1 1 0px' }}
      >
        Page {page} of {totalPages}
      </div>
      {nextPage ? (
        <SmallButton as={Link} to={`${pathname}?${stringify({ ...extraQuery, page: page + 1 })}`}>
          {t('Next page')}
        </SmallButton>
      ) : null}
    </div>
  );
};
