import { InternationalString } from '@iiif/presentation-3';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CanvasStatus } from '../../shared/atoms/CanvasStatus';
import { ModalButton } from '../../shared/components/Modal';
import { StandaloneCanvasViewer } from '../../shared/components/StandaloneCanvasViewer';
import { CustomRouteContext } from '../../shared/page-blocks/slot-context';
import { Heading5 } from '../../shared/typography/Heading5';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../shared/atoms/Images';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
import { useSubjectMap } from '../../shared/hooks/use-subject-map';
import { useManifest } from '../hooks/use-manifest';
import { useManifestPageConfiguration } from '../hooks/use-manifest-page-configuration';
import { useManifestTask } from '../hooks/use-manifest-task';
import { useProjectShadowConfiguration } from '../hooks/use-project-shadow-configuration';
import { useProjectStatus } from '../hooks/use-project-status';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { CanvasViewer } from './CanvasViewer';
import { usePreventCanvasNavigation } from './PreventUsersNavigatingCanvases';
import { FilterInput } from '../../shared/atoms/FilterInput';

export function ManifestCanvasGrid(props: {
  background?: string;
  popup?: boolean;
  list?: boolean;
  textColor?: string;
  cardBorder?: string;
  imageStyle?: string;
}) {
  const { data } = useManifest();
  const createLink = useRelativeLinks();
  const { t } = useTranslation();
  const { userManifestTask, canClaimManifest } = useManifestTask({ refetchOnMount: true });
  const createLocaleString = useCreateLocaleString();
  const manifestOptions = useManifestPageConfiguration();
  const { showCaptureModelOnManifest } = useProjectShadowConfiguration();
  const { showNavigationContent } = usePreventCanvasNavigation();
  const { isActive, isPreparing } = useProjectStatus();
  const manifestSubjects = data?.subjects;
  const [subjectMap] = useSubjectMap(manifestSubjects);

  const directToModelPage = (!!userManifestTask || canClaimManifest) && manifestOptions?.directModelPage;
  const coveredImages = manifestOptions?.coveredImages;
  const rectangularImages = manifestOptions?.rectangularImages;
  const hideCanvasLabels = manifestOptions?.hideCanvasLabels;
  const manifest = data?.manifest;
  const [items, setItems] = useState(manifest?.items);

  function handleFilter(e: string) {
    const result = manifest?.items
      ? manifest?.items.filter(item => createLocaleString(item.label, t('Canvas thumbnail')).includes(e))
      : '';

    setItems(result ? result : []);
  }

  if (!manifest || !showNavigationContent) {
    return null;
  }

  const renderCanvasSnippet = (canvas: { id: number; label: InternationalString; thumbnail: string | null }) => {
    return (
      <ImageStripBox
        data-view-list={props.list}
        $border={props.cardBorder}
        $color={props.textColor}
        $bgColor={props.background}
      >
        <CroppedImage $covered={coveredImages || props.imageStyle === 'covered'} $rect={rectangularImages}>
          {canvas.thumbnail ? (
            <img alt={createLocaleString(canvas.label, t('Canvas thumbnail'))} src={canvas.thumbnail} />
          ) : null}
        </CroppedImage>
        {(isActive || isPreparing) && manifestSubjects && subjectMap && !showCaptureModelOnManifest ? (
          <CanvasStatus status={subjectMap[canvas.id]} floating={coveredImages} />
        ) : null}
        {hideCanvasLabels ? null : <LocaleString as={Heading5}>{canvas.label}</LocaleString>}
      </ImageStripBox>
    );
  };

  if (props.popup) {
    return (
      <>
        <FilterInput type="text" onChange={e => handleFilter(e.target.value)} placeholder="Search this Manifest" />
        <ImageGrid data-view-list={props.list}>
          {items?.map((canvas, idx) => (
            <ModalButton
              modalSize="lg"
              key={`${canvas.id}_${idx}`}
              render={() => {
                return (
                  <CustomRouteContext ctx={{ canvas: canvas.id }}>
                    <CanvasViewer>
                      <StandaloneCanvasViewer canvasId={canvas.id} />
                    </CanvasViewer>
                  </CustomRouteContext>
                );
              }}
              title={createLocaleString(canvas.label, t('Canvas thumbnail'))}
            >
              {renderCanvasSnippet(canvas)}
            </ModalButton>
          ))}
        </ImageGrid>
      </>
    );
  }

  return (
    <>
      <FilterInput type="text" onChange={e => handleFilter(e.target.value)} placeholder="Search this Manifest" />
      <ImageGrid data-view-list={props.list}>
        {items?.map((canvas, idx) => (
          <Link
            key={`${canvas.id}_${idx}`}
            to={createLink({
              canvasId: canvas.id,
              subRoute: directToModelPage ? 'model' : undefined,
            })}
          >
            {renderCanvasSnippet(canvas)}
          </Link>
        ))}
      </ImageGrid>
    </>
  );
}

blockEditorFor(ManifestCanvasGrid, {
  type: 'default.ManifestCanvasGrid',
  label: 'Manifest canvas grid',
  defaultProps: {
    background: '',
    popup: false,
    list: false,
    textColor: '',
    cardBorder: '',
    imageStyle: 'fit',
  },
  editor: {
    popup: { type: 'checkbox-field', label: 'Popup', inlineLabel: 'Show canvases in popup' },
    list: { type: 'checkbox-field', label: 'View', inlineLabel: 'Display as list' },
    background: { label: 'Card background color', type: 'color-field' },
    textColor: { label: 'Card text color', type: 'color-field' },
    cardBorder: { label: 'Card border', type: 'color-field' },
    imageStyle: {
      label: 'Image Style',
      type: 'dropdown-field',
      options: [
        { value: 'covered', text: 'covered' },
        { value: 'fit', text: 'fit' },
      ],
    },
  },
  requiredContext: ['manifest'],
  anyContext: ['collection', 'manifest'],
});
