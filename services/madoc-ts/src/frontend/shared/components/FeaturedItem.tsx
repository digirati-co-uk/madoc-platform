import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { CanvasFull } from '../../../types/canvas-full';
import { ObjectContainer } from '../atoms/ObjectContainer';
import { LocaleString, useCreateLocaleString } from './LocaleString';
import { Heading3 } from '../typography/Heading3';
import { CroppedImage } from '../atoms/Images';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useRelativeLinks } from '../../site/hooks/use-relative-links';
import { ImageStripBox } from '../atoms/ImageStrip';
import { CanvasSnippet } from './CanvasSnippet';
import {useRouteContext} from "../../site/hooks/use-route-context";

interface FeaturedItemProps {
  canvas?: { id: string };
  data?: CanvasFull & { canvas: CanvasFull['canvas'] };
}

export function FeaturedItem(props: FeaturedItemProps) {
  const createLink = useRelativeLinks();
  const { manifestId } = useRouteContext();
  const { t } = useTranslation();
  const createLocaleString = useCreateLocaleString();
  const { data } = props;
  const canvas = data?.canvas;

  if (!canvas || !data) {
    return null;
  }
  return <CanvasSnippet id={canvas.id} manifestId={manifestId} />;
}
blockEditorFor(FeaturedItem, {
  label: 'Featured Item',
  type: 'default.featuredItem',
  defaultProps: {
    canvas: null,
  },
  hooks: [
    {
      name: 'getSiteCanvas',
      creator: props => (props.canvas ? [props.canvas.id] : undefined),
      mapToProps: (props, data) => {
        return { ...props, data };
      },
    },
  ],
  editor: {
    canvas: {
      label: 'Canvas',
      type: 'canvas-explorer',
    },
  },
  anyContext: ['manifest'],
  requiredContext: ['manifest'],
});
