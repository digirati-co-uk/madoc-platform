import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveTrainingVideoSource } from './training-video-rules';

interface TrainingVideoPlayerProps {
  link?: string;
  title?: string;
}

export function TrainingVideoPlayer({ link, title }: TrainingVideoPlayerProps) {
  const { t } = useTranslation();
  const source = resolveTrainingVideoSource(link);
  const [failedSource, setFailedSource] = useState<string>();

  if (!source) {
    return <p className="rounded-lg bg-gray-100 p-4 text-gray-700">{t('This video can’t be played right now.')}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {failedSource === source.src ? (
        <p role="alert" className="m-0 rounded-lg bg-gray-100 p-4 text-gray-700">
          {t('This video can’t be played right now.')}
        </p>
      ) : source.kind === 'file' ? (
        <video
          key={source.src}
          className="aspect-video w-full rounded-lg bg-black"
          src={source.src}
          aria-label={title || t('Training video')}
          controls
          playsInline
          preload="metadata"
          onError={() => setFailedSource(source.src)}
        />
      ) : (
        <iframe
          className="aspect-video w-full rounded-lg border-0 bg-black"
          src={source.src}
          title={title || t('Training video')}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        />
      )}
      <a
        href={source.src}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start rounded text-sm text-gray-700 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t('Open video in a new tab')}
      </a>
    </div>
  );
}
