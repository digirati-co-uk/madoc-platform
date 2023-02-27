import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRelativeLinks } from '../../site/hooks/use-relative-links';
import { SnippetLarge, SnippetLargeProps } from '../atoms/SnippetLarge';
import { useApiCanvas } from '../hooks/use-api-canvas';
import { LocaleString } from './LocaleString';
import { HrefLink } from '../utility/href-link';

export const CanvasSnippet: React.FC<{
  id: number;
  manifestId?: number;
  collectionId?: number;
  model?: boolean;
  buttonText?: any;
} & Partial<SnippetLargeProps>> = ({ id, manifestId, collectionId, model, buttonText, ...props }) => {
  const { t } = useTranslation();
  const { data } = useApiCanvas(id);
  const createLink = useRelativeLinks();

  const link = createLink({
    canvasId: id,
    manifestId: manifestId,
    collectionId: collectionId,
    subRoute: model ? 'model' : undefined,
  });
  console.log(data)

  if (!data) {
    return (
      <SnippetLarge
        margin
        label={'...'}
        subtitle={t(`Canvas`)}
        summary={'...'}
        linkAs={HrefLink}
        buttonText={buttonText || t('view canvas')}
        link={link}
        {...props}
      />
    );
  }

  const thumbnail = data.canvas.thumbnail && data.canvas.thumbnail[0] ? data.canvas.thumbnail[0].id : undefined;

  return (
    <SnippetLarge
      margin
      label={<LocaleString>{data.canvas.label}</LocaleString>}
      subtitle={t(`Canvas`)}
      summary={<LocaleString>{data.canvas.summary}</LocaleString>}
      linkAs={HrefLink}
      thumbnail={thumbnail}
      buttonText={buttonText || t('view canvas')}
      link={link}
      {...props}
    />
  );
};
