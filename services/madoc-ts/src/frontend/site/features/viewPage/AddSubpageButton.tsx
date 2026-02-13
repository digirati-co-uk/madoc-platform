import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { CreateNormalPageRequest } from '../../../../types/schemas/site-page';
import { SitePage } from '../../../../types/site-pages-recursive';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { PageEditorButton } from '../../../shared/page-blocks/PageEditor';
import { ModalButton } from '../../../shared/components/Modal';
import { PageCreator } from '../../../shared/components/PageCreator';
import { useApi } from '../../../shared/hooks/use-api';
import { useStaticData } from '../../../shared/hooks/use-data';
import { PageLoader } from '../../pages/loaders/page-loader';

export const AddSubpageButton: React.FC<{ onCreate?: (page: SitePage) => void }> = props => {
  const { t } = useTranslation();
  const api = useApi();
  const { data } = useStaticData(PageLoader);
  const page = data?.page;
  const subpage = useRef<CreateNormalPageRequest>(undefined);
  const navigate = useNavigate();

  const [addSubpage] = useMutation(async () => {
    if (page && subpage.current) {
      const createdPage = await api.pageBlocks.createPage({
        ...subpage.current,
        parentPage: page.id,
      });
      subpage.current = undefined;
      if (props.onCreate) {
        props.onCreate(createdPage);
      } else {
        navigate(createdPage.path);
      }
    }
  });

  if (!page) {
    return null;
  }

  return (
    <ModalButton
      as={PageEditorButton}
      title="Add new subpage"
      render={() => <PageCreator page={{ path: page.path }} onUpdate={req => (subpage.current = req)} />}
      footerAlignRight
      renderFooter={({ close }) => {
        return (
          <ButtonRow $noMargin>
            <Button onClick={close}>Cancel</Button>
            <Button $primary onClick={() => addSubpage().then(() => close())}>
              Create
            </Button>
          </ButtonRow>
        );
      }}
    >
      {t('Add subpage')}
    </ModalButton>
  );
};
