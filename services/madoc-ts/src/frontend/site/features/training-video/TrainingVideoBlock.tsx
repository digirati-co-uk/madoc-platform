import React from 'react';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { TrainingVideoPlayer } from './TrainingVideoPlayer';
import { TRAINING_VIDEO_BLOCK_TYPE, TrainingVideoContent } from './training-video-rules';

/**
 * The project's main training video, placed on its help page. The button and
 * the contribution-page pop-up find and play this block.
 */
export function TrainingVideoBlock({ link, title, intro }: TrainingVideoContent) {
  return (
    <section className="my-4 flex max-w-4xl flex-col gap-3">
      {title ? <h2 className="m-0 text-2xl font-semibold">{title}</h2> : null}
      {intro ? <p className="m-0 text-gray-700">{intro}</p> : null}
      <TrainingVideoPlayer link={link} title={title} />
    </section>
  );
}

blockEditorFor(TrainingVideoBlock, {
  type: TRAINING_VIDEO_BLOCK_TYPE,
  label: 'Training video (main project video)',
  anyContext: [],
  requiredContext: [],
  defaultProps: {
    link: '',
    title: '',
    intro: '',
  },
  editor: {
    link: {
      type: 'text-field',
      label: 'Video link',
      description: 'A YouTube or Vimeo page link, an embed link, or a direct .mp4 link',
    },
    title: { type: 'text-field', label: 'Title' },
    intro: { type: 'text-field', label: 'Introduction', multiline: true },
  },
});
