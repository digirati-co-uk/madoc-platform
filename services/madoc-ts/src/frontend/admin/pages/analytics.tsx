import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnalyticsQuery, AnalyticsReport } from '../../../types/analytics';
import { useData } from '../../shared/hooks/use-data';
import { useUser } from '../../shared/hooks/use-site';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../types';
import { AdminHeader } from '../molecules/AdminHeader';
import { WidePage } from '../../shared/layout/WidePage';
import { BarChart } from '../features/analytics/BarChart';

const DAY_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 365, label: '365 days' },
] as const;

function fmt(n: number) {
  return n.toLocaleString();
}

function StatCard({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
      <div className="text-3xl font-bold text-gray-800 tabular-nums">{fmt(value)}</div>
      <div className="text-sm font-medium text-gray-600 mt-1">{label}</div>
      {note && <div className="text-xs text-gray-500 mt-0.5">{note}</div>}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-[#24386b] mb-4 pb-2 border-b border-gray-200">{children}</h2>;
}

interface AnalyticsPageType {
  params: Record<string, never>;
  query: { days?: string; scope?: string };
  variables: AnalyticsQuery;
  data: AnalyticsReport;
}

export const AnalyticsPage: UniversalComponent<AnalyticsPageType> = createUniversalComponent<AnalyticsPageType>(
  () => {
    const { data, isLoading, isError } = useData(AnalyticsPage);
    const user = useUser();
    const isGlobalAdmin = user?.role === 'global_admin';
    const [searchParams, setSearchParams] = useSearchParams();

    const activeDays = Number(searchParams.get('days') || 30);
    const activeScope = searchParams.get('scope') === 'all' && isGlobalAdmin ? 'all' : 'site';

    function setDays(d: number) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('days', String(d));
        return next;
      });
    }

    function setScope(s: 'site' | 'all') {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('scope', s);
        return next;
      });
    }

    return (
      <>
        <AdminHeader
          title="Analytics"
          breadcrumbs={[
            { label: 'Admin dashboard', link: '/' },
            { label: 'Analytics', link: '/analytics', active: true },
          ]}
        />

        <WidePage>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div
              className="flex items-center gap-1 rounded border border-gray-200 p-0.5 bg-gray-50"
              role="group"
              aria-label="Time period"
            >
              {DAY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDays(opt.value)}
                  aria-pressed={activeDays === opt.value}
                  className={`px-3 py-1 text-sm rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4157bb] ${
                    activeDays === opt.value ? 'bg-[#24386b] text-white font-medium' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {isGlobalAdmin && (
              <div
                className="flex items-center gap-1 rounded border border-gray-200 p-0.5 bg-gray-50 ml-auto"
                role="group"
                aria-label="Scope"
              >
                {(['site', 'all'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScope(s)}
                    aria-pressed={activeScope === s}
                    className={`px-3 py-1 text-sm rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4157bb] ${
                      activeScope === s ? 'bg-[#24386b] text-white font-medium' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {s === 'site' ? 'This site' : 'All sites'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="text-sm text-gray-500 text-center py-16" aria-live="polite" aria-busy>
              Loading analytics…
            </div>
          )}
          {isError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-4" role="alert">
              Analytics could not be loaded. Please try again later.
            </div>
          )}

          {data &&
            !isLoading &&
            !isError &&
            (() => {
              const daily = data.daily;
              const totals = data.totals;

              const dailyTotalViews = daily.map(d => ({ label: d.date, value: d.pageViews }));
              const dailySignedIn = daily.map(d => ({ label: d.date, value: d.signedInViews }));
              const dailyAnon = daily.map(d => ({ label: d.date, value: d.anonymousViews }));
              const weeklyData = data.weekly.map(w => ({ label: w.week, value: w.signedInViews }));
              const collectionNote = data.collectionStarted
                ? `Data collection began ${data.collectionStarted}. Dates before this will show zero.`
                : undefined;

              return (
                <>
                  <p className="text-sm text-gray-600 mb-6">
                    {data.scope === 'all' ? 'All sites' : 'This site'} · {data.start} to {data.end} · UTC
                  </p>
                  <section aria-labelledby="section-traffic" className="mb-8">
                    <SectionHeading>
                      <span id="section-traffic">Page views</span>
                    </SectionHeading>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                      <StatCard label="Total page views" value={totals.pageViews} />
                      <StatCard label="Signed-in views" value={totals.signedInViews} />
                      <StatCard label="Anonymous views" value={totals.anonymousViews} />
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="min-w-0 bg-white border border-gray-200 rounded-lg p-5">
                        <BarChart
                          data={dailyTotalViews}
                          title="Total page views per day"
                          description={collectionNote}
                          color="#4157bb"
                          chartHeight={200}
                        />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="min-w-0 bg-white border border-gray-200 rounded-lg p-5">
                          <BarChart
                            data={dailySignedIn}
                            title="Signed-in views per day"
                            color="#1d7a5a"
                            chartHeight={160}
                          />
                        </div>
                        <div className="min-w-0 bg-white border border-gray-200 rounded-lg p-5">
                          <BarChart
                            data={dailyAnon}
                            title="Anonymous views per day"
                            color="#7c4dbb"
                            chartHeight={160}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section aria-labelledby="section-contributions" className="mb-8">
                    <SectionHeading>
                      <span id="section-contributions">Contributions</span>
                    </SectionHeading>
                    <p className="text-xs text-gray-500 mb-4">
                      Each milestone is counted once per saved contribution. Started = first saved revision. Completed =
                      first submitted or accepted revision. Reviews completed = first accepted or rejected review
                      outcome (including auto-approvals).
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <StatCard label="Contributions started" value={totals.contributionsStarted} />
                      <StatCard label="Contributions completed" value={totals.contributionsCompleted} />
                      <StatCard label="Reviews completed" value={totals.reviewsCompleted} />
                    </div>
                  </section>

                  <section aria-labelledby="section-weekly" className="mb-8">
                    <SectionHeading>
                      <span id="section-weekly">Weekly signed-in visits</span>
                    </SectionHeading>
                    <p className="text-xs text-gray-500 mb-4">
                      Weeks run Monday–Sunday (UTC). The first and last weeks in a selected period may be partial. This
                      counts visits (page views by signed-in users), not unique users. No visitor identifiers or session
                      records are stored.
                    </p>
                    {weeklyData.length === 0 ? (
                      <div className="text-sm text-gray-500 bg-gray-50 rounded py-8 text-center">
                        No weekly data available for this period.
                      </div>
                    ) : (
                      <div className="min-w-0 bg-white border border-gray-200 rounded-lg p-5">
                        <BarChart
                          data={weeklyData}
                          title="Signed-in visits per week"
                          unit="visits"
                          color="#4157bb"
                          chartHeight={200}
                        />
                      </div>
                    )}
                  </section>

                  {data.projects.length > 0 && (
                    <section aria-labelledby="section-projects" className="mb-8">
                      <SectionHeading>
                        <span id="section-projects">Project breakdown</span>
                      </SectionHeading>
                      <div className="overflow-x-auto rounded border border-gray-200">
                        <table className="w-full text-sm border-collapse">
                          <caption className="sr-only">Signed-in and anonymous page views by project</caption>
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="text-left px-3 py-2 border-b border-gray-200 font-medium text-gray-600"
                              >
                                Project
                              </th>
                              <th
                                scope="col"
                                className="text-right px-3 py-2 border-b border-gray-200 font-medium text-gray-600"
                              >
                                Total views
                              </th>
                              <th
                                scope="col"
                                className="text-right px-3 py-2 border-b border-gray-200 font-medium text-gray-600"
                              >
                                Signed-in
                              </th>
                              <th
                                scope="col"
                                className="text-right px-3 py-2 border-b border-gray-200 font-medium text-gray-600"
                              >
                                Anonymous
                              </th>
                              <th
                                scope="col"
                                className="text-right px-3 py-2 border-b border-gray-200 font-medium text-gray-600"
                              >
                                Started
                              </th>
                              <th
                                scope="col"
                                className="text-right px-3 py-2 border-b border-gray-200 font-medium text-gray-600"
                              >
                                Completed
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.projects.map((p, i) => (
                              <tr key={i} className="even:bg-gray-50 hover:bg-blue-50">
                                <td className="px-3 py-2 border-b border-gray-100">
                                  {p.projectName}
                                  {data.scope === 'all' && (
                                    <span className="block text-xs text-gray-500">{p.siteName}</span>
                                  )}
                                </td>
                                <td className="text-right px-3 py-2 border-b border-gray-100 tabular-nums">
                                  {fmt(p.pageViews)}
                                </td>
                                <td className="text-right px-3 py-2 border-b border-gray-100 tabular-nums">
                                  {fmt(p.signedInViews)}
                                </td>
                                <td className="text-right px-3 py-2 border-b border-gray-100 tabular-nums">
                                  {fmt(p.anonymousViews)}
                                </td>
                                <td className="text-right px-3 py-2 border-b border-gray-100 tabular-nums">
                                  {fmt(p.contributionsStarted)}
                                </td>
                                <td className="text-right px-3 py-2 border-b border-gray-100 tabular-nums">
                                  {fmt(p.contributionsCompleted)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {activeScope === 'all' && data.sites.length > 0 && (
                    <section aria-labelledby="section-sites" className="mb-8">
                      <SectionHeading>
                        <span id="section-sites">Site comparison</span>
                      </SectionHeading>
                      <div className="overflow-x-auto rounded border border-gray-200">
                        <table className="w-full text-sm border-collapse">
                          <caption className="sr-only">Page view totals by site</caption>
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="text-left px-3 py-2 border-b border-gray-200 font-medium text-gray-600"
                              >
                                Site
                              </th>
                              <th
                                scope="col"
                                className="text-right px-3 py-2 border-b border-gray-200 font-medium text-gray-600"
                              >
                                Total views
                              </th>
                              <th
                                scope="col"
                                className="text-right px-3 py-2 border-b border-gray-200 font-medium text-gray-600"
                              >
                                Signed-in
                              </th>
                              <th
                                scope="col"
                                className="text-right px-3 py-2 border-b border-gray-200 font-medium text-gray-600"
                              >
                                Anonymous
                              </th>
                              <th
                                scope="col"
                                className="text-right px-3 py-2 border-b border-gray-200 font-medium text-gray-600"
                              >
                                Started
                              </th>
                              <th
                                scope="col"
                                className="text-right px-3 py-2 border-b border-gray-200 font-medium text-gray-600"
                              >
                                Completed
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.sites.map((s, i) => (
                              <tr key={i} className="even:bg-gray-50">
                                <td className="px-3 py-2 border-b border-gray-100 font-medium">{s.siteName}</td>
                                <td className="text-right px-3 py-2 border-b border-gray-100 tabular-nums">
                                  {fmt(s.pageViews)}
                                </td>
                                <td className="text-right px-3 py-2 border-b border-gray-100 tabular-nums">
                                  {fmt(s.signedInViews)}
                                </td>
                                <td className="text-right px-3 py-2 border-b border-gray-100 tabular-nums">
                                  {fmt(s.anonymousViews)}
                                </td>
                                <td className="text-right px-3 py-2 border-b border-gray-100 tabular-nums">
                                  {fmt(s.contributionsStarted)}
                                </td>
                                <td className="text-right px-3 py-2 border-b border-gray-100 tabular-nums">
                                  {fmt(s.contributionsCompleted)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  <p className="text-xs text-gray-500 mt-4 pb-8">
                    Analytics counters record page views and contribution milestones only. No personal data, visitor
                    identifiers, session records, or URLs are stored in these counts.
                  </p>
                </>
              );
            })()}
        </WidePage>
      </>
    );
  },
  {
    getKey: (_, query) => [
      'analytics',
      { days: Number(query.days || 30), scope: query.scope === 'all' ? 'all' : 'site' },
    ],
    getData: (_, vars, api) => api.getAnalytics(vars),
  }
);
