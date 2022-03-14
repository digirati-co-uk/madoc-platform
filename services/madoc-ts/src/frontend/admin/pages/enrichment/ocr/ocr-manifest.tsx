import { useMutation } from 'react-query';
import { PARAGRAPHS_PROFILE } from '../../../../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { ItemStructureList } from '../../../../../types/schemas/item-structure-list';
import { ResourceLinkResponse } from '../../../../../types/schemas/linking';
import { ManifestFull } from '../../../../../types/schemas/manifest-full';
import { iiifGetLabel } from '../../../../../utility/iiif-get-label';
import { Button } from '../../../../shared/navigation/Button';
import { InfoMessage } from '../../../../shared/callouts/InfoMessage';
import { NotStartedIcon } from '../../../../shared/icons/NotStartedIcon';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../../../../shared/layout/Table';
import { TaskItemTag, TaskItemTagSuccess } from '../../../../shared/atoms/TaskList';
import { TickIcon } from '../../../../shared/icons/TickIcon';
import { WarningMessage } from '../../../../shared/callouts/WarningMessage';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { createLink } from '../../../../shared/utility/create-link';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { HrefLink } from '../../../../shared/utility/href-link';
import { UniversalComponent } from '../../../../types';
import React, { useMemo } from 'react';
import { OCRTaskTags } from '../../../molecules/OCRTaskTags';

type OcrManifestType = {
  data: {
    manifest: ManifestFull;
    manifestStructure: ItemStructureList;
    canvasLinking: { linking: ResourceLinkResponse[] };
  };
  query: {};
  params: { id: string };
  variables: { id: number };
  context: {};
};

export const OcrManifest: UniversalComponent<OcrManifestType> = createUniversalComponent<OcrManifestType>(
  () => {
    const { data } = useData(OcrManifest);
    const api = useApi();

    const [queueManifest, queueManifestQuery] = useMutation(async () => {
      if (data) {
        return api.importManifestOcr(data.manifest.manifest.id, iiifGetLabel(data.manifest.manifest.label));
      }
    });

    const canvasLinkingMap = useMemo(() => {
      const map: { [id: number]: ResourceLinkResponse[] } = {};
      if (data) {
        for (const link of data.canvasLinking.linking) {
          map[link.resource_id] = map[link.resource_id] ? map[link.resource_id] : [];
          map[link.resource_id].push(link);
        }
      }
      return map;
    }, [data]);

    const isEmpty = Object.keys(canvasLinkingMap).length === 0;

    return (
      <>
        <h1>Prepare your manifest for OCR corrections</h1>
        {isEmpty ? (
          <WarningMessage>No OCR data found</WarningMessage>
        ) : queueManifestQuery.data ? (
          <InfoMessage>
            OCR is importing
            <Button
              as={HrefLink}
              href={createLink({ taskId: queueManifestQuery.data.id })}
              style={{ marginLeft: '10px' }}
            >
              View progress
            </Button>
          </InfoMessage>
        ) : (
          <Button disabled={queueManifestQuery.status === 'loading'} onClick={() => queueManifest()}>
            Import OCR
          </Button>
        )}
        <TableContainer>
          {data?.manifestStructure.items.map(item => {
            return (
              <TableRow>
                <TableRowLabel>
                  {canvasLinkingMap[item.id] &&
                  canvasLinkingMap[item.id].find(
                    m => m.link && (m.link.type === 'CaptureModelDocument' || m.link.format === 'text/plain')
                  ) ? (
                    <TickIcon />
                  ) : canvasLinkingMap[item.id] ? (
                    <NotStartedIcon accepted />
                  ) : (
                    <NotStartedIcon />
                  )}
                </TableRowLabel>
                <TableRowLabel>
                  <LocaleString>{item.label}</LocaleString>
                </TableRowLabel>
                <TableActions>
                  <OCRTaskTags links={canvasLinkingMap[item.id]} />
                </TableActions>
              </TableRow>
            );
          })}
        </TableContainer>
      </>
    );
  },
  {
    getKey(params) {
      return ['OcrManifest', { id: Number(params.id) }];
    },
    async getData(key, vars, api) {
      return {
        manifest: await api.getManifestById(vars.id),
        manifestStructure: await api.getManifestStructure(vars.id),
        canvasLinking: await api.getManifestCanvasLinking(vars.id, {
          property: 'seeAlso',
        }),
      };
    },
  }
);
