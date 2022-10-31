import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { useUserPermissions } from '../../shared/hooks/use-site';
import { Button, ButtonIcon, ButtonRow } from '../../shared/navigation/Button';
import { LocaleString } from '../../shared/components/LocaleString';
import { useData } from '../../shared/hooks/use-data';
import { GridIcon } from '../../shared/icons/GridIcon';
import { HrefLink } from '../../shared/utility/href-link';
import { ManifestLoader, CanvasLoader } from '../components';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';
import { AssignCanvasToUser } from './AssignCanvasToUser';
import { CanvasManifestPagination } from './CanvasManifestPagination';
import { CanvasTaskProgress } from './CanvasTaskProgress';
import { RequiredStatement } from './RequiredStatement';
import { useGoogleFonts } from '../../shared/hooks/use-google-fonts';

const StyledHeader = styled.div<{
  $color?: string;
  $font?: string;
}>`
  color: ${props => (props.$color ? props.$color : 'black')};
  font-family: ${props => (props.$font ? `${props.$font}, sans-serif` : 'inherit')};
`;

export const CanvasPageHeader: React.FC<{
  subRoute?: string;
  title?: string;
  textColor?: string;
  fontSize?: string;
  font?: string;
}> = ({ subRoute, title, textColor, fontSize, font }) => {
  useGoogleFonts(font);

  const { manifestId, canvasId } = useRouteContext();
  const createLink = useRelativeLinks();
  const { t } = useTranslation();
  const { data: manifestResponse } = useData(ManifestLoader);
  const { data: canvasResponse } = useData(CanvasLoader);
  const { showCanvasNavigation } = useCanvasNavigation();
  const { canProgress, isAdmin } = useUserPermissions();
  const manifest = manifestResponse?.manifest;
  const canvas = canvasResponse?.canvas;

  if (!canvasId || !manifestId) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: '1 1 0px' }}>
        <StyledHeader $color={textColor} $font={font}>
          {title && title === 'canvasTitle' ? (
            <LocaleString>{canvas ? canvas.label : { en: ['...'] }}</LocaleString>
          ) : title && title === 'both' ? (
            <>
              <LocaleString>{manifest ? manifest.label : { en: ['...'] }}</LocaleString>
              {', '}
              <LocaleString>{canvas ? canvas.label : { en: ['...'] }}</LocaleString>
            </>
          ) : (
            <LocaleString>{manifest ? manifest.label : { en: ['...'] }}</LocaleString>
          )}
        </StyledHeader>
        <RequiredStatement />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ButtonRow>
          <AssignCanvasToUser />

          {!isAdmin && !canProgress ? null : <CanvasTaskProgress />}

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
    title: {
      label: 'Canvas title',
      type: 'dropdown-field',
      options: [
        { value: 'canvasTitle', text: 'Canvas title' },
        { value: 'manifestTitle', text: 'Manifest title' },
        { value: 'both', text: 'Manifest and Canvas titles' },
      ],
    },
    textColor: { label: 'Text color', type: 'color-field' },
    font: { label: 'Font (from google)', type: 'text-field' },
    subRoute: {
      type: 'text-field',
      label: 'Navigation sub route',
      description: `If you use this on a sub page (e.g. manifest/1/c/2/SUB_ROUTE) this will ensure paginated links are accurate.`,
    },
  },
  defaultProps: {
    subRoute: '',
    title: 'both',
    textColor: '',
    font: '',
  },
});
