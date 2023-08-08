import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading1 } from '../../shared/typography/Heading1';
import { Slot } from '../../shared/page-blocks/slot';
import { DisplayBreadcrumbs } from '../blocks/Breadcrumbs';
import { useRouteContext } from '../hooks/use-route-context';

export const ItemNotFound: React.FC = () => {
  const { t } = useTranslation();
  const { canvasId, manifestId, collectionId } = useRouteContext();
  const type = canvasId ? 'Canvas' : manifestId ? 'Manifest' : collectionId ? 'Collection' : 'Project';

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <>
        <Heading1>{t(`${type} not found`)}</Heading1>
      </>
    </>
  );
};
