import { useTranslation } from 'react-i18next';
import { MetadataEmptyState } from '../../../shared/atoms/MetadataConfiguration';
import { TranscriptionIcon } from '../../../shared/icons/TranscriptionIcon';
import { CanvasPlaintext } from '../../features/canvas/CanvasPlaintext';
import { CanvasMenuHook } from './types';
import { useApiCanvas } from '../../../shared/hooks/use-api-canvas';
import { useRouteContext } from '../use-route-context';

export function useTranscriptionMenu(isOpen = false): CanvasMenuHook {
  const { canvasId } = useRouteContext();
  const { data } = useApiCanvas(isOpen ? canvasId : undefined, true, { plaintext: true });
  const { t } = useTranslation();
  const plaintext = data?.plaintext;

  const content = (
    <>
      {plaintext ? (
        <CanvasPlaintext />
      ) : (
        <MetadataEmptyState style={{ marginTop: 100 }}>No plaintext</MetadataEmptyState>
      )}
    </>
  );

  return {
    id: 'transcription',
    label: t('Transcription'),
    icon: <TranscriptionIcon />,
    isLoaded: !!data,
    notifications: plaintext ? 1 : 0,
    content,
  };
}
