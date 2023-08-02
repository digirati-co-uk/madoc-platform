import React from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectAssigneeStats } from '../../../site/hooks/use-project-assignee-stats';
import { Tooltip as ReactTooltip } from 'react-tooltip';
export function ProjectContributorStatistics() {
  const { t } = useTranslation();
  const { data } = useProjectAssigneeStats();

  if (!data) {
    return null;
  }
  const getPercentage = (a: number) => {
    const p = (a / 25) * 100;
    return `w-[${p}%]`;
  };

  const style = 'repeating-linear-gradient(to left, #f7f7f7, #f7f7f7 10%, #fff 10%, #fff 20%)';
  return (
    <div className="container mx-auto">
      <div className="overflow-hidden p-5 shadow-md">
        {/* Top */}
        <div className="px-5 py-3">
          <h5 className="font-bold text-stone-600">{t('All contributions')}</h5>
        </div>
        {/* main */}
        {!data.submissions.stats ? (
          <p>No contributions to this project yet</p>
        ) : (
          <dl className="">
            {data.submissions.stats.map((stat, i) => (
              <dd key={i} className="flex">
                <div className="w-1/5 py-1">
                  <p>{stat.user?.name} </p>
                  <p className="italic text-gray-500">User role tbc</p>
                </div>
                <div className="w-[100%] border-l-2 border-gray-300" style={{ background: style }}>
                  <div
                    data-tooltip-id={`my-tooltip-${i}`}
                    className={`${getPercentage(stat.submissions)} bg-teal-400 h-5 my-3`}
                  />
                  <ReactTooltip id={`my-tooltip-${i}`} place="right" content={`${stat.submissions} Submissions`} />
                </div>
              </dd>
            ))}
            <div className="flex">
              <div className="w-1/5" />
              <div className=" flex w-[100%] border-gray-300 border-t-2 text-gray-500">
                <div className="w-[21%] text-end">0 - 5</div>
                <div className="w-[20%] text-end">10</div>
                <div className="w-[20%] text-end">15</div>
                <div className="w-[20%] text-end">20</div>
                <div className="w-[20%] text-end">25+</div>
              </div>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
