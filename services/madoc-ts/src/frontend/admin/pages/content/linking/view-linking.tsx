import { useMemo } from 'react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceLinkResponse } from '../../../../../types/schemas/linking';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import { Spinner } from '../../../../shared/icons/Spinner';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useStaticData } from '../../../../shared/hooks/use-data';
import { TableContainer } from '../../../../shared/layout/Table';
import { LinkingProperty } from '../../../../shared/atoms/LinkingProperty';
import { useParams } from 'react-router-dom';
import { ViewOCRModel } from './view-ocr-model';

type ViewCanvasLinking = {
  query: {};
  params: { id: string };
  data: { linking: ResourceLinkResponse[] };
  variables: { id: number };
};

export const ViewCanvasLinking: UniversalComponent<ViewCanvasLinking> = createUniversalComponent<ViewCanvasLinking>(
  () => {
    const { t } = useTranslation();
    const { data, refetch, isFetching } = useStaticData(ViewCanvasLinking);
    const { id: canvasId, linkId } = useParams<{ id: string; linkId: string }>();

    const link = useMemo(() => {
      if (data) {
        return data.linking.find(l => l.id === Number(linkId));
      }
    }, [data, linkId]);

    if (!link) {
      return <div>Loading...</div>;
    }

    const renderLinkingPreview = () => {
      switch (link.link.type) {
        case 'CaptureModelDocument': {
          return <ViewOCRModel link={link} canvasId={Number(canvasId)} />;
        }
        default:
          return null;
      }
    };

    if (isFetching) {
      return <Spinner />;
    }

    if (data && data.linking.length === 0) {
      return <EmptyState>{t('No linking properties')}</EmptyState>;
    }

    return (
      <TableContainer style={{ background: '#EEEEEE' }}>
        <LinkingProperty key={link.link.id} link={link} refetch={refetch} />
        {renderLinkingPreview()}
      </TableContainer>
    );
  },
  {
    getKey(params) {
      return ['canvas-linking-property', { id: Number(params.id) }];
    },
    getData(key, vars, api) {
      return api.getCanvasLinking(vars.id);
    },
  }
);
