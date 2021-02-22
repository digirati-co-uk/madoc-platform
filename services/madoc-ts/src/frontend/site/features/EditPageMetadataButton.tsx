import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { CreateNormalPageRequest } from '../../../types/schemas/site-page';
import { SitePage } from '../../../types/site-pages-recursive';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import { PageEditorButton } from '../../shared/atoms/PageEditor';
import { ModalButton } from '../../shared/components/Modal';
import { PageCreator } from '../../shared/components/PageCreator';
import { useApi } from '../../shared/hooks/use-api';
import { useStaticData } from '../../shared/hooks/use-data';
import { PageLoader } from '../pages/loaders/page-loader';

export const EditPageMetadataButton: React.FC<{ onUpdate?: (page: SitePage) => void }> = props => {
  const { t } = useTranslation();
  const api = useApi();
  const { data } = useStaticData(PageLoader);
  const page = data?.page;
  const newPage = useRef<CreateNormalPageRequest>();

  const [updatePage] = useMutation(async () => {
    if (page && newPage.current) {
      const updatedPage = await api.pageBlocks.updatePage(page.path, {
        ...page,
        ...newPage.current,
      });
      newPage.current = undefined;
      if (props.onUpdate) {
        props.onUpdate(updatedPage.page);
      }
    }
  });

  if (!page) {
    return null;
  }

  return (
    <ModalButton
      as={PageEditorButton}
      title="Edit page metadata"
      render={() => (
        <PageCreator
          defaultDescription={page.description}
          defaultTitle={page.title}
          defaultPath={page.path}
          onUpdate={req => (newPage.current = req)}
        />
      )}
      footerAlignRight
      renderFooter={({ close }) => {
        return (
          <ButtonRow $noMargin>
            <Button onClick={close}>{t('Cancel')}</Button>
            <Button $primary onClick={() => updatePage().then(() => close())}>
              {t('Update')}
            </Button>
          </ButtonRow>
        );
      }}
    >
      {t('Edit metadata')}
    </ModalButton>
  );
};
