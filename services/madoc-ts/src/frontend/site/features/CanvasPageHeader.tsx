import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { Button, ButtonIcon, ButtonRow } from '../../shared/atoms/Button';
import { LocaleString } from '../../shared/components/LocaleString';
import { useData } from '../../shared/hooks/use-data';
import { GridIcon } from '../../shared/icons/GridIcon';
import { HrefLink } from '../../shared/utility/href-link';
import { ManifestLoader } from '../components';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';
import { AssignCanvasToUser } from './AssignCanvasToUser';
import { CanvasManifestPagination } from './CanvasManifestPagination';
import { CanvasTaskProgress } from './CanvasTaskProgress';
import { RequiredStatement } from './RequiredStatement';

export const CanvasPageHeader: React.FC<{ subRoute?: string }> = ({ subRoute }) => {
  const { manifestId, canvasId } = useRouteContext();
  const createLink = useRelativeLinks();
  const { t } = useTranslation();
  const { data: manifestResponse } = useData(ManifestLoader);
  const { showCanvasNavigation } = useCanvasNavigation();
  const manifest = manifestResponse?.manifest;

  if (!canvasId || !manifestId) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: '1 1 0px' }}>
        <div style={{ fontSize: '24px', color: '#212529' }}>
          <LocaleString>{manifest ? manifest.label : { en: ['...'] }}</LocaleString>
        </div>
        <RequiredStatement />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ButtonRow>
          <AssignCanvasToUser />

          <CanvasTaskProgress />

          <Button
            as={HrefLink}
            href={createLink({ manifestId: manifestId, canvasId: undefined, query: { listing: true } })}
          >
            <ButtonIcon>
              <GridIcon />
            </ButtonIcon>
            {t('Browse all')}
          </Button>
        </ButtonRow>

        {showCanvasNavigation ? <CanvasManifestPagination subRoute={subRoute} /> : null}
      </div>
    </div>
  );
};

blockEditorFor(CanvasPageHeader, {
  type: 'default.CanvasPageHeader',
  label: 'Canvas page header',
  anyContext: ['canvas'],
  requiredContext: ['manifest', 'canvas'],
  editor: {
    subRoute: {
      type: 'text-field',
      label: 'Navigation sub route',
      description: `If you use this on a sub page (e.g. manifest/1/c/2/SUB_ROUTE) this will ensure paginated links are accurate.`,
    },
  },
  defaultProps: {
    subRoute: '',
  },
});
