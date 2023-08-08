import React from 'react';
import { useRouteContext } from '../../hooks/use-route-context';
import { useSite } from '../../../shared/hooks/use-site';
import styled from 'styled-components';
import { Button } from '../../../shared/navigation/Button';
import { useTranslation } from 'react-i18next';
import { ModalButton } from '../../../shared/components/Modal';

const Wrapper = styled.div``;

const IframePopUpWrapper = styled.div`
  iframe {
    border: none;
    width: 100%;
    height: 100%;
  }
  height: 500px;
`;
export const GenerateManifestPdf: React.FC = () => {
  const { t } = useTranslation();
  const { manifestId } = useRouteContext();
  const { slug } = useSite();
  const origin = typeof window === 'undefined' ? '' : window.location.origin;

  return (
    <Wrapper>
      <ModalButton
        as={Button}
        title={'Generate PDF'}
        modalSize="lg"
        render={() => {
          return (
            <IframePopUpWrapper>
              <iframe
                referrerPolicy="no-referrer"
                src={`https://pdiiif.jbaiter.de/?manifest=${origin}/s/${slug}/madoc/api/manifests/${manifestId}/export/3.0`}
                loading="lazy"
              />
            </IframePopUpWrapper>
          );
        }}
      >
        {t('Generate PDF')}
      </ModalButton>
    </Wrapper>
  );
};
