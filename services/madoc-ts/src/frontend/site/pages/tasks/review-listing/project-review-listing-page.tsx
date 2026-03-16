import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useProject } from '../../../hooks/use-project';
import { ReviewListingPage } from './review-listing-page';
import { TabularReviewListingPage } from './tabular-review-listing-page';

export function ProjectReviewListingPage() {
  const { slug, taskId } = useParams<{ slug?: string; taskId?: string }>();
  const { data: project } = useProject();

  if (!slug) {
    return <ReviewListingPage />;
  }

  const isTabularProject = project?.template === 'tabular-project';
  if (!isTabularProject) {
    return <ReviewListingPage />;
  }

  if (taskId) {
    return <Outlet />;
  }

  return <TabularReviewListingPage />;
}
