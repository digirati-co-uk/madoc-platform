import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { DashboardTab, DashboardTabs } from '../../shared/components/DashboardTabs';
import { useUser } from '../../shared/hooks/use-site';
import { useUserDetails } from '../../shared/hooks/use-user-details';
import { HrefLink } from '../../shared/utility/href-link';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { useStaticData } from '../../shared/hooks/use-data';
import React from 'react';
import { UserDetails } from '../../../types/schemas/user-details';
import { CrowdsourcingReview } from '../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import { Pagination } from '../../../types/schemas/_pagination';
import { isAdmin, isContributor, isReviewer } from '../../shared/utility/user-roles';
import { UserGreeting } from '../features/contributor/UserGreeting';

type UserHomepageType = {
  query: unknown;
  params: Record<string, never>;
  variables: Record<string, never>;
  data: {
    userDetails: UserDetails;
    reviewerTasks?: { tasks: CrowdsourcingReview[]; pagination: Pagination };
    contributorDraftTasks?: { tasks: CrowdsourcingTask[]; pagination: Pagination };
    contributorReviewTasks?: { tasks: CrowdsourcingTask[]; pagination: Pagination };
    isSiteAdmin: boolean;
    isSiteContributor: boolean;
    projects: any[];
  };
};

export const UserHomepage: UniversalComponent<UserHomepageType> = createUniversalComponent<UserHomepageType>(
  () => {
    const { data, error } = useStaticData(UserHomepage, {}, { retry: false });
    const location = useLocation();
    const user = useUser();
    const userDetails = useUserDetails();
    const { t } = useTranslation();

    const showReviews = data && isReviewer(data.userDetails);

    if (error || !user) {
      return <Navigate to={'/'} />;
    }

    if (!data) {
      // We want to load here.
      return <div>{t('Loading...')}</div>;
    }

    return (
      <div>
        <UserGreeting />
        <DashboardTabs>
          <DashboardTab $active={location.pathname === '/dashboard'}>
            <HrefLink href="/dashboard">{t('Overview')}</HrefLink>
          </DashboardTab>
          <DashboardTab $active={location.pathname === '/dashboard/contributions'}>
            <HrefLink href="/dashboard/contributions">{t('Contributions')}</HrefLink>
          </DashboardTab>
          {showReviews && (
            <DashboardTab $active={location.pathname === '/dashboard/reviews'}>
              <HrefLink href="/dashboard/reviews">{t('Reviews')}</HrefLink>
            </DashboardTab>
          )}
          {userDetails?.sites && userDetails?.sites.length > 1 ? (
            <DashboardTab $active={location.pathname === '/dashboard/my-sites'}>
              <HrefLink href="/dashboard/my-sites">{t('My sites')}</HrefLink>
            </DashboardTab>
          ) : null}
        </DashboardTabs>

        <Outlet />
      </div>
    );
  },
  {
    hooks: [
      {
        creator: () => [],
        name: 'getUserDetails',
      },
    ],
    getKey: () => {
      return ['current-user', {}];
    },
    getData: async (key, vars, api) => {
      const userDetails = await api.getUserDetails();
      const response: Partial<UserHomepageType['data']> = {
        userDetails,
        isSiteAdmin: false,
        isSiteContributor: false,
      };

      response.isSiteAdmin = isAdmin(userDetails);
      response.isSiteContributor = isContributor(userDetails);

      const projects = api.getSiteProjects();

      if (isReviewer(userDetails)) {
        response.reviewerTasks = await api.getTasks<CrowdsourcingReview>(0, {
          type: 'crowdsourcing-review',
          status: [0, 1, 2, 5],
          all_tasks: true,
          assignee: `urn:madoc:user:${userDetails.user.id}`,
          per_page: 10,
        });
      }

      if (isContributor(userDetails)) {
        response.contributorDraftTasks = await api.getTasks<CrowdsourcingTask>(0, {
          type: 'crowdsourcing-task',
          status: [0, 1, 4],
          all_tasks: true,
          per_page: 10,
          assignee: `urn:madoc:user:${userDetails.user.id}`,
          detail: true,
        });
        response.contributorReviewTasks = await api.getTasks<CrowdsourcingTask>(0, {
          type: 'crowdsourcing-task',
          status: [2, 5],
          all_tasks: true,
          assignee: `urn:madoc:user:${userDetails.user.id}`,
          per_page: 10,
          detail: true,
        });
      }

      response.projects = (await projects).projects;

      return response as UserHomepageType['data'];
    },
  }
);
