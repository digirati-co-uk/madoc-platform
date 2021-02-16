import { useTranslation } from 'react-i18next';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { DashboardTab, DashboardTabs } from '../../shared/components/DashboardTabs';
import { HrefLink } from '../../shared/utility/href-link';
import { renderUniversalRoutes } from '../../shared/utility/server-utils';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { useStaticData } from '../../shared/hooks/use-data';
import React from 'react';
import { UserDetails } from '../../../types/schemas/user-details';
import { CrowdsourcingReview } from '../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import { Pagination } from '../../../types/schemas/_pagination';
import { isAdmin, isContributor, isReviewer } from '../../shared/utility/user-roles';
import { ContributorTasks } from '../features/ContributorTasks';
import { DashboardNavigation } from '../features/DashboardNavigation';
import { ReviewerTasks } from '../features/ReviewerTasks';
import { UserGreeting } from '../features/UserGreeting';
import { UserProjects } from '../features/UserProjects';
import { UserStatistics } from '../features/UserStatistics';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useSite } from '../../shared/hooks/use-site';
import { useUserHomepage } from '../hooks/use-user-homepage';

type UserHomepageType = {
  query: {};
  params: {};
  context: {};
  data: {
    userDetails: UserDetails;
    reviewerTasks?: { tasks: CrowdsourcingReview[]; pagination: Pagination };
    contributorDraftTasks?: { tasks: CrowdsourcingTask[]; pagination: Pagination };
    contributorReviewTasks?: { tasks: CrowdsourcingTask[]; pagination: Pagination };
    isSiteAdmin: boolean;
    isSiteContributor: boolean;
    projects: any[];
  };
  variables: {};
};

export const UserHomepage: UniversalComponent<UserHomepageType> = createUniversalComponent<UserHomepageType>(
  ({ route }) => {
    const { data, error } = useStaticData(UserHomepage, {}, { retry: false });
    const location = useLocation();
    const { slug } = useSite();

    const showReviews = data && isReviewer(data.userDetails);

    if (error) {
      return <a href="/login">Please login</a>;
    }

    if (!data) {
      // We want to load here.
      return <div>Loading...</div>;
    }

    return (
      <div>
        <UserGreeting />

        <DashboardTabs>
          <DashboardTab $active={location.pathname === '/dashboard'}>
            <HrefLink href="/dashboard">Overview</HrefLink>
          </DashboardTab>
          <DashboardTab $active={location.pathname === '/dashboard/contributions'}>
            <HrefLink href="/dashboard/contributions">Contributions</HrefLink>
          </DashboardTab>
          {showReviews && (
            <DashboardTab $active={location.pathname === '/dashboard/reviews'}>
              <HrefLink href="/dashboard/reviews">Reviews</HrefLink>
            </DashboardTab>
          )}
          <DashboardTab>
            <a href={`/s/${slug}/profile`}>Manage account</a>
          </DashboardTab>
        </DashboardTabs>

        {renderUniversalRoutes(route.routes)}
      </div>
    );
  },
  {
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
        });
        response.contributorReviewTasks = await api.getTasks<CrowdsourcingTask>(0, {
          type: 'crowdsourcing-task',
          status: [2, 5],
          all_tasks: true,
          assignee: `urn:madoc:user:${userDetails.user.id}`,
          per_page: 10,
        });
      }

      response.projects = (await projects).projects;

      return response as UserHomepageType['data'];
    },
  }
);
