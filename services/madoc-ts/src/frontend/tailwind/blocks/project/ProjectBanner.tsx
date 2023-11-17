import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { LocaleString } from '../../../shared/components/LocaleString';
import { ArrowForwardIcon } from '../../../shared/icons/ArrowForwardIcon';
import { Heading1, Subheading1 } from '../../../shared/typography/Heading1';
import { HrefLink } from '../../../shared/utility/href-link';
import { StartContributingButton } from '../../../site/features/project/StartContributingButton';
import { useProject } from '../../../site/hooks/use-project';
import { ContinueMostRecentLink } from '../../components/ContinueMostRecentLink';
import { ProgressBarSmall } from '../../components/ProgressBarSmall';

const heights = {
  auto: '',
  large: 'h-96',
};

const blur = {
  none: '',
  sm: 'backdrop-blur-sm',
};

export function ProjectBanner({
  showStatisticsBar = false,
  showContributingButton = true,
  headerImage,
}: {
  showStatisticsBar?: boolean;
  showContributingButton?: boolean;
  headerImage?: { image: string } | null;
}) {
  const { t } = useTranslation();
  const { data: project } = useProject();
  const projectImageUrl = headerImage ? headerImage.image : project?.placeholderImage ? project.placeholderImage : null;

  const hasStatistics = !!project?.statistics;
  const totalItems = hasStatistics ? Object.values(project.statistics).reduce((total, n) => total + n, 0) : 0;
  const donePercentage = hasStatistics && totalItems ? (project.statistics[3] || 0) / totalItems : 0;
  const progressPercentage = hasStatistics && totalItems ? (project.statistics[2] || 0) / totalItems : 0;

  if (!project) {
    return null;
  }

  const contents = (
    <>
      <LocaleString as={Heading1}>{project.label}</LocaleString>
      <LocaleString as={Subheading1}>{project.summary}</LocaleString>
      {projectImageUrl && showStatisticsBar && hasStatistics && (
        <div className="max-w-sm">
          <ProgressBarSmall donePercent={donePercentage} percentage={progressPercentage} />
        </div>
      )}
      <div className="mt-10 mb-5">{showContributingButton && <StartContributingButton />}</div>
      <div className="text-sm underline px-2 flex items-center gap-2">
        <ContinueMostRecentLink>
          {link => (
            <div className="text-sm underline flex items-center gap-2">
              <HrefLink href={link}>{t('Continue working')}</HrefLink>
              <ArrowForwardIcon />
            </div>
          )}
        </ContinueMostRecentLink>
      </div>
    </>
  );

  if (!projectImageUrl) {
    return <div className="mb-5">{contents}</div>;
  }

  return (
    <div
      className="bg-slate-200 bg-no-repeat bg-cover bg-center lg:h-96 relative grid grid-cols-6 mb-5"
      style={{ backgroundImage: `url(${projectImageUrl})` }}
    >
      <div className="col-span-6 lg:col-span-3 xl:col-span-2 bg-opacity-60 bg-white p-8 backdrop-blur-sm">
        {contents}
      </div>

      {!showStatisticsBar && hasStatistics && (
        <div className="col-span-6 md:col-span-3 self-end flex gap-3 p-2">
          {donePercentage ? (
            <div className="bg-white rounded px-4 py-0.5 text-sm text-green-700 border border-green-600">
              {Math.ceil(donePercentage * 100)}% {t('done')}
            </div>
          ) : null}
          {progressPercentage ? (
            <div className="bg-white rounded px-4 py-0.5 text-sm text-orange-700 border border-orange-600">
              {Math.ceil(progressPercentage * 100)}% {t('in progress')}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

blockEditorFor(ProjectBanner, {
  type: 'default.ProjectBanner',
  label: 'Project banner',
  anyContext: ['project'],
  requiredContext: ['project'],
  defaultProps: {
    showStatisticsBar: false,
    showContributingButton: true,
    headerImage: null,
  },
  editor: {
    showStatisticsBar: { label: 'Show statistics bar', type: 'checkbox-field' },
    showContributingButton: { label: 'Show contributing button', type: 'checkbox-field' },
    headerImage: { label: 'Image', type: 'madoc-media-explorer' },
  },
});
