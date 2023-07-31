import React, { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from '../../../shared/icons/SearchIcon';
import { Button, useRouteContext } from '../../../shared/plugins/public-api';

export function ProjectSearchBox() {
  const { projectId } = useRouteContext();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    const text = data.get('text');
    if (!text) return;
    navigate(`/projects/${projectId}/search?fulltext=${encodeURIComponent(text.toString())}`);
  };

  return (
    <div className="sm:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto my-3 py-2">
      <label className="text-l mb-2 block" htmlFor="project-search-field">
        <SearchIcon className="inline-block mr-1" />
        {t('Search this project')}
      </label>
      <form onSubmit={onSubmit} className="flex">
        <input
          id="project-search-field"
          type="text"
          placeholder={t('Find manifest')}
          name="text"
          className="flex-1 p-2 outline-0 focus:border-blue-500 border border-gray-300 rounded rounded-r-none"
        />
        <Button className="px-5 rounded-l-none border-l-0">Search</Button>
      </form>
    </div>
  );
}
