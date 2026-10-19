import React from 'react';
import { Link } from 'react-router-dom';
import { AnalyticsReport } from '../../../../types/analytics';
import { MiniSparkline } from './MiniSparkline';

interface AnalyticsOverviewProps {
  data?: AnalyticsReport;
}

interface TrafficCard {
  key: string;
  label: string;
  count: number;
  values: number[];
  color: string;
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  if (!data) {
    return (
      <section
        aria-label="Site traffic overview"
        className="mb-6 px-4 py-3 rounded bg-gray-50 border border-gray-200 text-sm text-gray-500"
      >
        Traffic data is not available.{' '}
        <Link to="/analytics" className="text-[#4157bb] underline">
          Open analytics
        </Link>
      </section>
    );
  }

  const cards: TrafficCard[] = [
    {
      key: 'total',
      label: 'Total page views',
      count: data.totals.pageViews,
      values: data.daily.map(d => d.pageViews),
      color: '#4157bb',
    },
    {
      key: 'signedin',
      label: 'Signed-in views',
      count: data.totals.signedInViews,
      values: data.daily.map(d => d.signedInViews),
      color: '#1d7a5a',
    },
    {
      key: 'anon',
      label: 'Anonymous views',
      count: data.totals.anonymousViews,
      values: data.daily.map(d => d.anonymousViews),
      color: '#7c4dbb',
    },
  ];

  return (
    <section aria-label="Site traffic overview – last 30 days" className="mb-6">
      <div className="flex flex-wrap items-baseline gap-3 mb-3">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Traffic – last 30 days</h2>
        <Link to="/analytics" className="ml-auto text-xs font-medium text-[#4157bb] hover:underline">
          View full analytics →
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {cards.map(card => (
          <div
            key={card.key}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <div
                className="text-2xl font-bold text-gray-800 tabular-nums"
                aria-label={`${card.count.toLocaleString()} ${card.label}`}
              >
                {card.count.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 leading-snug">{card.label}</div>
            </div>
            <div className="shrink-0 self-center">
              <MiniSparkline
                values={card.values}
                dates={data.daily.map(d => d.date)}
                label={`${card.label} trend over last 30 days`}
                color={card.color}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
