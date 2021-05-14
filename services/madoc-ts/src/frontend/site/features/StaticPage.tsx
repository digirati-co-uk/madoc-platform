import React from 'react';
import { useLocation } from 'react-router-dom';
import { useApi } from '../../shared/hooks/use-api';
import { useData } from '../../shared/hooks/use-data';
import { SlotProvider } from '../../shared/page-blocks/slot-context';
import { PageLoader } from '../pages/loaders/page-loader';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const StaticPage: React.FC<{ layout?: string; title: string }> = ({ title, layout = 'none', children }) => {
  const { pathname } = useLocation();
  const { data, refetch } = useData(PageLoader);
  const { editMode } = useSiteConfiguration();
  const api = useApi();

  const invalidateSlots = async () => {
    console.log('invalidate slots');
    await refetch();
  };

  return (
    <SlotProvider
      isPage={true}
      editable={editMode}
      invalidateSlots={invalidateSlots}
      onUpdateBlock={invalidateSlots}
      onCreateSlot={invalidateSlots}
      beforeCreateSlot={async req => {
        if (data) {
          if (!data.page) {
            const page = await api.pageBlocks.createPage({
              layout,
              path: pathname,
              title: { none: [title] },
              navigationOptions: {
                order: 0,
                root: false,
                hide: true,
              },
            });

            req.pageId = page.id;
          } else {
            req.pageId = data.page.id;
          }
        }
      }}
    >
      {children}
    </SlotProvider>
  );
};
