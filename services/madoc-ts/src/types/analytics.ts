export interface AnalyticsQuery {
  days?: number;
  scope?: 'site' | 'all';
}

export interface AnalyticsCounts {
  pageViews: number;
  signedInViews: number;
  anonymousViews: number;
  contributionsStarted: number;
  contributionsCompleted: number;
  reviewsCompleted: number;
}

export interface AnalyticsDay extends AnalyticsCounts {
  date: string;
}

export interface AnalyticsReport {
  scope: 'site' | 'all';
  start: string;
  end: string;
  collectionStarted: string;
  totals: AnalyticsCounts;
  daily: AnalyticsDay[];
  weekly: Array<{ week: string; signedInViews: number }>;
  projects: Array<AnalyticsCounts & { siteId: number; siteName: string; projectId: number; projectName: string }>;
  sites: Array<AnalyticsCounts & { siteId: number; siteName: string }>;
}
