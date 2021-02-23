import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { ButtonDropdown, ButtonDropdownDefaultItem } from '../../shared/atoms/ButtonDropdown';
import { PageEditorButton } from '../../shared/atoms/PageEditor';
import { useApi } from '../../shared/hooks/use-api';
import { useStaticData } from '../../shared/hooks/use-data';
import { PageLoader } from '../pages/loaders/page-loader';

export const EditPageLayoutButton: React.FC<{ onUpdate?: () => void }> = props => {
  const { t } = useTranslation();
  const api = useApi();
  const { data } = useStaticData(PageLoader);
  const page = data?.page;

  const [updatePage] = useMutation(async (layout: string) => {
    if (page && layout) {
      await api.pageBlocks.updatePage(page.path, {
        ...page,
        layout,
      });
      if (props.onUpdate) {
        props.onUpdate();
      }
    }
  });

  const hardcodedLayouts = useMemo(
    () => [
      { id: 'page-with-menu', label: t('Default layout') },
      { id: 'page-without-menu', label: t('No menu') },
    ],
    [t]
  );

  return (
    <ButtonDropdown
      as={PageEditorButton}
      items={hardcodedLayouts.map(layout => ({
        onClick: () => {
          updatePage(layout.id);
        },
        render: () => {
          return <ButtonDropdownDefaultItem>{layout.label}</ButtonDropdownDefaultItem>;
        },
      }))}
    >
      Change layout
    </ButtonDropdown>
  );
};
