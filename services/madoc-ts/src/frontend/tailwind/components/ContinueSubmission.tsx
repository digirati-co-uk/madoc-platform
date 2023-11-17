import React from 'react';
import { useTranslation } from 'react-i18next';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { LocaleString } from '../../shared/components/LocaleString';
import { useContinueContribution } from '../../shared/hooks/use-continue-contribution';
import { ArrowForwardIcon } from '../../shared/icons/ArrowForwardIcon';
import { HrefLink } from '../../shared/utility/href-link';
import { useProjectShadowConfiguration } from '../../site/hooks/use-project-shadow-configuration';
import { useTaskMetadata } from '../../site/hooks/use-task-metadata';

export function ContinueSubmission({ task, next }: { task: BaseTask; next?: boolean }) {
  const { t } = useTranslation();
  const { showCaptureModelOnManifest } = useProjectShadowConfiguration();
  const link = useContinueContribution(task, showCaptureModelOnManifest);
  const { subject } = useTaskMetadata(task);

  return (
    <HrefLink href={next ? `${link}?goToNext=true` : link} className="no-underline">
      <section className="p-2 border flex items-center gap-4 bg-white hover:bg-gray-50">
        {subject.thumbnail ? (
          <div className="aspect-square w-32 overflow-hidden flex items-center bg-slate-100">
            <img src={subject.thumbnail} className="w-max h-max object-contain object-center" alt="" />
          </div>
        ) : null}
        <div className="flex-1 pt-2 self-stretch flex flex-col gap-2 min-w-0">
          <div className="text-lg overflow-ellipsis whitespace-nowrap overflow-hidden">
            {subject.parent ? (
              <LocaleString>{subject.parent.label}</LocaleString>
            ) : (
              <LocaleString>{subject.label}</LocaleString>
            )}
          </div>
          <div className="text-sm text-slate-400">
            {subject.parent ? <LocaleString>{subject.label}</LocaleString> : subject.type}
          </div>
          <div className="text-sky-600 underline flex items-center gap-2">
            {next ? t('Contribute to the next image') : t('Continue contribution')}
            <ArrowForwardIcon />
          </div>
        </div>
      </section>
    </HrefLink>
  );
}
