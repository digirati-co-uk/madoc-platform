import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useRouteContext } from '../../site/hooks/use-route-context';
import { useSite } from '../hooks/use-site';
import { IIIFLogo } from '../icons/iiif-logo';

const DragLink = styled.a`
  display: inline-block;
  padding: 0.14em;
  font-size: 1.25em;
  path {
    transition: fill 0.2s;
  }
`;

export const IIIFDragIcon: React.FC = () => {
  const { t } = useTranslation();
  const { manifestId } = useRouteContext();
  const { slug } = useSite();
  const origin = typeof window === 'undefined' ? '' : window.location.origin;

  if (!manifestId) {
    return null;
  }

  return (
    <DragLink
      title={t('IIIF Drag and drop')}
      href={`${origin}/s/${slug}/madoc/api/manifests/${manifestId}/export/3.0?manifest=${encodeURI(
        `${origin}/s/${slug}/madoc/api/manifests/${manifestId}/export/3.0`
      )}`}
    >
      <IIIFLogo $hover />
    </DragLink>
  );
};
