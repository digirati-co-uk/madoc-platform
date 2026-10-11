import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolveTrainingVideoSource } from './training-video-rules';

interface TrainingVideoPlayerProps {
  link?: string;
  title?: string;
}

export function TrainingVideoPlayer({ link, title }: TrainingVideoPlayerProps) {
  const { t } = useTranslation();
  const source = resolveTrainingVideoSource(link);

  if (!source) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-neutral-100 p-4 text-center text-sm text-gray-600">
        {t('This video link can’t be played. Check the link in the Training video block.')}
      </div>
    );
  }

  if (source.kind === 'file') {
    return <video className="aspect-video w-full rounded-lg bg-black" src={source.src} controls preload="metadata" />;
  }

  return (
    <iframe
      className="aspect-video w-full rounded-lg border-0 bg-black"
      src={source.src}
      title={title || t('Training video')}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
    />
  );
}
