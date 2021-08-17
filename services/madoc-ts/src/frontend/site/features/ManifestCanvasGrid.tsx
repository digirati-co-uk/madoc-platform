import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { CanvasStatus } from '../../shared/atoms/CanvasStatus';
import { Heading5 } from '../../shared/atoms/Heading5';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../shared/atoms/Images';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
import { useSubjectMap } from '../../shared/hooks/use-subject-map';
import { useManifest } from '../hooks/use-manifest';
import { useManifestPageConfiguration } from '../hooks/use-manifest-page-configuration';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { usePreventCanvasNavigation } from './PreventUsersNavigatingCanvases';

export const ManifestCanvasGrid: React.FC = () => {
  const { data } = useManifest();
  const createLink = useRelativeLinks();
  const { t } = useTranslation();
  const { userManifestTask, canClaimManifest } = useManifestTask({ refetchOnMount: true });
  const createLocaleString = useCreateLocaleString();
  const manifestOptions = useManifestPageConfiguration();
  const { showNavigationContent } = usePreventCanvasNavigation();
  const { isActive, isPreparing } = useProjectStatus();
  const manifestSubjects = data?.subjects;
  const [subjectMap] = useSubjectMap(manifestSubjects);

  const directToModelPage = (!!userManifestTask || canClaimManifest) && manifestOptions?.directModelPage;
  const manifest = data?.manifest;

  if (!manifest || !showNavigationContent) {
    return null;
  }

  return (
    <ImageGrid>
      {manifest.items.map((canvas, idx) => (
        <Link
          key={`${canvas.id}_${idx}`}
          to={createLink({
            canvasId: canvas.id,
            subRoute: directToModelPage ? 'model' : undefined,
          })}
        >
          <ImageStripBox>
            <CroppedImage>
              {canvas.thumbnail ? (
                <img alt={createLocaleString(canvas.label, t('Canvas thumbnail'))} src={canvas.thumbnail} />
              ) : null}
            </CroppedImage>
            {(isActive || isPreparing) && manifestSubjects && subjectMap ? (
              <CanvasStatus status={subjectMap[canvas.id]} />
            ) : null}
            <LocaleString as={Heading5}>{canvas.label}</LocaleString>
          </ImageStripBox>
        </Link>
      ))}
    </ImageGrid>
  );
};

blockEditorFor(ManifestCanvasGrid, {
  type: 'default.ManifestCanvasGrid',
  label: 'Manifest canvas grid',
  editor: {},
  requiredContext: ['manifest'],
  anyContext: ['collection', 'manifest'],
});
