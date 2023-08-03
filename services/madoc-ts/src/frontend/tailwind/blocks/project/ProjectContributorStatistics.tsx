import React from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectAssigneeStats } from '../../../site/hooks/use-project-assignee-stats';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useSite } from '../../../shared/hooks/use-site';
import { HrefLink } from '../../../shared/utility/href-link';
export function ProjectContributorStatistics() {
  const { t } = useTranslation();
  const { data } = useProjectAssigneeStats();
  const site = useSite();

  if (!data) {
    return null;
  }

  if (!data.submissions.total || data.submissions.total === 0) {
    return <p>No contributions to this project yet</p>;
  }

  const graphScale = Math.ceil(data.submissions.total / 10) * 10;

  const getPercentage = (a: number) => {
    const p = (a / graphScale) * 100;
    return `${p}%`;
  };

  const scaleIndicatorList = [];
  for (let i = 1; i * 10 <= graphScale; i++) {
    scaleIndicatorList.push(i * 10);
  }

  const barScale = graphScale === 10 ? getPercentage(1) : graphScale === 20 ? getPercentage(2) : getPercentage(5);
  const barScaleAlt =
    graphScale === 10 ? getPercentage(0.5) : graphScale === 20 ? getPercentage(1) : getPercentage(2.5);

  const style = `repeating-linear-gradient(to left, #f7f7f7, #f7f7f7 ${barScaleAlt}, #fff ${barScaleAlt}, #fff ${barScale}`;
  return (
    <div className="container mx-auto px-5 max-w-5xl my-5">
      <div className="overflow-hidden">
        <h3 className="text-xl font-semibold mb-4">{t('All contributions')}</h3>
        {!data.submissions.stats ? (
          <p>No contributions to this project yet</p>
        ) : (
          <dl>
            {data.submissions.stats.map((stat, i) => (
              <dd key={i} className="flex">
                <div className="w-1/5 flex items-center">
                  <div className="w-10">
                    <img
                      className="rounded-full w-8"
                      src={`/s/${site.slug}/madoc/api/users/${stat.user?.id}/image`}
                      alt=""
                    />
                  </div>
                  <HrefLink
                    href={`/users/${stat.user.id}`}
                    className="flex-1 text-sm whitespace-nowrap overflow-hidden text-ellipsis min-w-0 px-2"
                  >
                    {stat.user?.name}
                  </HrefLink>
                </div>
                <div className="w-4/5 border-l-2 border-gray-300" style={{ background: style }}>
                  <div
                    tabIndex={0}
                    data-tooltip-id={`my-tooltip-${i}`}
                    style={{ width: getPercentage(stat.submissions) }}
                    className="bg-teal-400 h-5 my-3 pr-3 flex items-center justify-end"
                  >
                    <span className="not-sr-only text-white text-sm">{stat.submissions}</span>
                    <span className="sr-only">{stat.submissions} Submissions</span>
                  </div>
                  <ReactTooltip id={`my-tooltip-${i}`} place="right" content={`${stat.submissions} Submissions`} />
                </div>
              </dd>
            ))}
            <div className="flex">
              <div className="w-1/5" />
              <div className=" flex w-4/5 border-gray-300 border-t-2 text-gray-500">
                <div className="text-end">0</div>
                {scaleIndicatorList.map((n, i) => (
                  <div key={i} style={{ width: '100%' }} className="text-end">
                    {n}
                  </div>
                ))}
              </div>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
