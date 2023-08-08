import React from 'react';
import { useTranslation } from 'react-i18next';
import { SnippetLarge, SnippetLargeProps } from '../../shared/atoms/SnippetLarge';
import { LocaleString } from '../../shared/components/LocaleString';
import { useApiCollection } from '../../shared/hooks/use-api-collection';
import { createLink } from '../../shared/utility/create-link';
import { HrefLink } from '../../shared/utility/href-link';

export function CollectionGridItem({
  id,
  projectId,
  ...props
}: { id: number; projectId?: string | number } & Partial<SnippetLargeProps>) {
  const { data, failureCount } = useApiCollection(id);
  const { t } = useTranslation();

  if (failureCount) {
    return null;
  }

  if (!data) {
    return null;
  }

  const thumbnail = data.collection.thumbnail
    ? data.collection.thumbnail
    : data.collection.items[0] && data.collection.items[0].thumbnail
    ? data.collection.items[0].thumbnail
    : undefined;

  const placeholder = data?.collection?.placeholder_image;
  // Tailwind instead

  return (
    <HrefLink href={createLink({ collectionId: id, projectId: projectId })} className="no-underline">
      <section className="p-2 border flex items-center gap-4 bg-white hover:bg-gray-50">
        <div className="aspect-video w-40 2xl:w-60 overflow-hidden flex items-center bg-gray-100">
          <img src={thumbnail} className="w-max h-max object-contain" />
        </div>
        <div className="flex-1 pt-2 self-stretch flex flex-col gap-2">
          <LocaleString as="h4" className="text-lg 2xl:text-2xl font-semibold">
            {data.collection.label}
          </LocaleString>
          <p>{t('Collection with {{count}} manifests', { count: data.pagination.totalResults })}</p>
          <LocaleString>{data.collection.summary}</LocaleString>
        </div>
        <div className="mr-8 text-blue-600 no-underline hover:underline">{t('view collection')}</div>
      </section>
    </HrefLink>
  );
}
