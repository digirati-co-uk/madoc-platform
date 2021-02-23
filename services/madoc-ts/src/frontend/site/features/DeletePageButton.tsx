import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import { PageEditorButton } from '../../shared/atoms/PageEditor';
import { ModalButton } from '../../shared/components/Modal';
import { useApi } from '../../shared/hooks/use-api';
import { useStaticData } from '../../shared/hooks/use-data';
import { PageLoader } from '../pages/loaders/page-loader';
import { useSiteConfiguration } from './SiteConfigurationContext';

export const DeletePageButton: React.FC<{ onDelete?: (defaultCallback: () => void) => void }> = props => {
  const { t } = useTranslation();
  const api = useApi();
  const { data } = useStaticData(PageLoader);
  const page = data?.page;
  const history = useHistory();
  const { navigation } = useSiteConfiguration();

  const [deletePage] = useMutation(async () => {
    if (page) {
      await api.pageBlocks.deletePage(page.path);
      const defaultCallback = () => {
        if (navigation[0]) {
          history.push(navigation[0].path);
        } else {
          history.push('/');
        }
      };
      if (props.onDelete) {
        props.onDelete(defaultCallback);
      } else {
        defaultCallback();
      }
    }
  });

  if (!page) {
    return null;
  }

  return (
    <ModalButton
      as={PageEditorButton}
      title="Delete page"
      render={() => <div>Are you sure you want to delete this page?</div>}
      footerAlignRight
      renderFooter={({ close }) => {
        return (
          <ButtonRow $noMargin>
            <Button onClick={close}>Cancel</Button>
            <Button $primary onClick={() => deletePage().then(() => close())}>
              Delete page
            </Button>
          </ButtonRow>
        );
      }}
    >
      {t('Delete page')}
    </ModalButton>
  );
};
