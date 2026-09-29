import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { stringify } from 'query-string';
import { Button, LinkButton } from '../navigation/Button';
import { HrefLink } from '../utility/href-link';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from '../icons/ChevronIcon';

const accentLink = 'var(--madoc-accent-link, #4265e9)';

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
  const navigate = useNavigate();

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

  const renderOptions = () => {
    const options = [];
    for (let i = 1; i <= totalPages; i++) {
      options.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return options;
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPage = parseInt(e.target.value, 10);
    const href = `${pathname}${
      selectedPage > 1 ? `?${pageParam}=${selectedPage}${q ? `&${q}` : ''}` : q ? `?${q}` : ''
    }${hash ? `#${hash}` : ''}`;

    navigate(href);
  };

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="my-[2em] flex rounded-[5px] bg-[#eee] p-[0.3em]" style={{ justifyContent: position }}>
      <LinkButton
        $inherit
        disabled={page === 1 || isLoading}
        as={HrefLink}
        href={`${pathname}${page > 2 ? `?${pageParam}=1&` : q ? '?' : ''}${q}${hash ? `#${hash}` : ''}`}
      >
        <ChevronFirst fill={page === 1 ? '#666' : accentLink} />
      </LinkButton>

      <LinkButton
        style={{ marginLeft: '1em', textDecoration: 'none', verticalAlign: 'middle', color: accentLink }}
        disabled={!prevPage || isLoading}
        as={HrefLink}
        href={`${pathname}${page > 2 ? `?${pageParam}=${page - 1}&` : q ? '?' : ''}${q}${hash ? `#${hash}` : ''}`}
      >
        <ChevronLeft fill={!prevPage || isLoading ? '#666' : accentLink} />
        {isLoading ? t('loading...') : t('Previous page')}
      </LinkButton>

      <div className="mx-auto self-center text-[0.8em]" style={{ color: isLoading ? '#999' : '#666' }}>
        {t('Page')}{' '}
        <select
          className="cursor-pointer rounded-md border border-[#ccc] bg-white p-[0.3em] text-base text-[#333] focus:border-[var(--madoc-accent)] focus:outline-none"
          value={page}
          onChange={handleChange}
        >
          {renderOptions()}
        </select>{' '}
        {t('of {{count}}', { count: totalPages })}
      </div>

      <LinkButton
        style={{ marginRight: '1em', textDecoration: 'none', color: accentLink }}
        $noDecoration
        as={HrefLink}
        disabled={!nextPage || isLoading}
        href={`${pathname}?${pageParam}=${page + 1}${q ? `&${q}` : ''}${hash ? `#${hash}` : ''}`}
      >
        {isLoading ? t('loading...') : t('Next page')}
        <ChevronRight fill={accentLink} />
      </LinkButton>

      <LinkButton
        disabled={page === totalPages || isLoading}
        as={HrefLink}
        href={`${pathname}?${pageParam}=${totalPages}${q ? `&${q}` : ''}${hash ? `#${hash}` : ''}`}
      >
        <ChevronLast fill={page === totalPages ? '#666' : accentLink} />
      </LinkButton>
    </div>
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
    <div className="my-[2em] flex justify-end p-[0.3em]" style={{ justifyContent: position }}>
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
    </div>
  );
};
