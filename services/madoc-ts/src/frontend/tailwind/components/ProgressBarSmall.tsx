import React from 'react';

export function ProgressBarSmall({
  label,
  percentage,
  donePercent = 0,
}: {
  label?: string;
  percentage: number;
  donePercent?: number;
}) {
  if (percentage === 0) {
    return null;
  }

  return (
    <div className="mt-5">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          {label ? <div className="text-sm font-semibold mb-2">{label}</div> : null}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="h-2 bg-white bg-opacity-90 rounded-full overflow-hidden flex">
                {donePercent > 0 && (
                  <div className="h-full bg-green-600" style={{ width: `${Math.round(donePercent * 100)}%` }}></div>
                )}
                <div className="h-full bg-orange-400" style={{ width: `${Math.round(percentage * 100)}%` }}></div>
              </div>
            </div>
            <div className="text-xs font-semibold ml-3">{Math.round(percentage * 100)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
