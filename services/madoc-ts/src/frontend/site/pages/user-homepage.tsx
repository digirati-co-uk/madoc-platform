// Site users
// - User project + details
// - Bookmarks
// - Projects that are running
// Contributor
// - Crowd Sourcing tasks
// Reviewer
//  - Reviews
//  - Assign to another reviewer / admin
// Admin
// - IIIF Imports
// - Quick assign
// - Go to admin
// - Create "to-do" task

import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { useStaticData } from '../../shared/hooks/use-data';
import React from 'react';
import { UserDetails } from '../../../types/schemas/user-details';
import { Heading1, Subheading1 } from '../../shared/atoms/Heading1';
import { TinyButton } from '../../shared/atoms/Button';
import { Statistic, StatisticContainer, StatisticLabel, StatisticNumber } from '../../shared/atoms/Statistics';
import { Heading3, Subheading3 } from '../../shared/atoms/Heading3';
import { ProjectListing } from '../../shared/atoms/ProjectListing';
import { CrowdsourcingReview } from '../../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../../types/tasks/crowdsourcing-task';
import { Pagination } from '../../../types/schemas/_pagination';
import { GridContainer, HalfGird } from '../../shared/atoms/Grid';
import { TableContainer, TableEmpty, TableRow, TableRowLabel } from '../../shared/atoms/Table';
import { Status } from '../../shared/atoms/Status';
import { Link } from 'react-router-dom';
import { HrefLink } from '../../shared/utility/href-link';
import { LightNavigation, LightNavigationItem } from '../../shared/atoms/LightNavigation';
import { isAdmin, isContributor, isReviewer } from '../../shared/utility/user-roles';

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
    projects: any[];
  };
  variables: {};
};

const ReviewerTasks: React.FC<{ reviews: UserHomepageType['data']['reviewerTasks'] }> = ({ reviews }) => {
  return (
    <>
      <Heading3>Reviews</Heading3>
      <TableContainer>
        {reviews && reviews.tasks.length ? (
          reviews.tasks.map(task => (
            <TableRow key={task.id}>
              <TableRowLabel>
                <Status status={task.status} text={task.status_text} />
              </TableRowLabel>
              <TableRowLabel>
                <Link to={`/tasks/${task.id}`}>{task.name}</Link>
              </TableRowLabel>
            </TableRow>
          ))
        ) : (
          <TableEmpty>No reviews</TableEmpty>
        )}
      </TableContainer>
      <TinyButton as={HrefLink} href={`/tasks?type=crowdsourcing-review`}>
        Browse all reviews
      </TinyButton>
    </>
  );
};

const ContributorTasks: React.FC<{
  drafts: UserHomepageType['data']['contributorDraftTasks'];
  reviews: UserHomepageType['data']['contributorReviewTasks'];
}> = ({ drafts, reviews }) => {
  return (
    <>
      <Heading3>Your contributions</Heading3>
      <GridContainer>
        <HalfGird $margin>
          <Subheading3>Contributions in progress</Subheading3>
          <TableContainer>
            {drafts && drafts.tasks.length ? (
              drafts.tasks.map(task => (
                <TableRow key={task.id}>
                  <TableRowLabel>
                    <Status status={task.status} text={task.status_text} />
                  </TableRowLabel>
                  <TableRowLabel>
                    <Link to={`/tasks/${task.id}`}>{task.name}</Link>
                  </TableRowLabel>
                </TableRow>
              ))
            ) : (
              <TableEmpty>No contributions yet</TableEmpty>
            )}
          </TableContainer>
        </HalfGird>
        <HalfGird $margin>
          <Subheading3>Contributions in review</Subheading3>
          <TableContainer>
            {reviews && reviews.tasks.length ? (
              reviews.tasks.map(task => (
                <TableRow key={task.id}>
                  <TableRowLabel>
                    <Status status={task.status} text={task.status_text} />
                  </TableRowLabel>
                  <TableRowLabel>
                    <Link to={`/tasks/${task.id}`}>{task.name}</Link>
                  </TableRowLabel>
                </TableRow>
              ))
            ) : (
              <TableEmpty>No contributions in review</TableEmpty>
            )}
          </TableContainer>
        </HalfGird>
      </GridContainer>
      <TinyButton as={HrefLink} href={`/tasks?type=crowdsourcing-task`}>
        Browse all contributions
      </TinyButton>
    </>
  );
};

export const UserHomepage: UniversalComponent<UserHomepageType> = createUniversalComponent<UserHomepageType>(
  () => {
    const { data } = useStaticData(UserHomepage);

    if (!data) {
      return <div>Loading...</div>;
    }

    const { userDetails, isSiteAdmin } = data;

    return (
      <div>
        <Heading1>Welcome back Stephen</Heading1>
        <Subheading1>Quick navigation</Subheading1>

        <LightNavigation>
          <LightNavigationItem>
            <HrefLink href={'/projects'}>Projects</HrefLink>
          </LightNavigationItem>
          <LightNavigationItem>
            <HrefLink href={'/collections'}>Collections</HrefLink>
          </LightNavigationItem>
          <LightNavigationItem>
            <HrefLink href={'/tasks'}>All tasks</HrefLink>
          </LightNavigationItem>
          <LightNavigationItem>
            <a href={'./profile'}>Manage account</a>
          </LightNavigationItem>
          {isSiteAdmin ? (
            <LightNavigationItem>
              <a href={`./madoc/admin`}>Admin</a>
            </LightNavigationItem>
          ) : null}
        </LightNavigation>

        <div>
          <StatisticContainer>
            <Statistic>
              <StatisticNumber>{0}</StatisticNumber>
              <StatisticLabel>Bookmarks</StatisticLabel>
            </Statistic>
            <Statistic>
              <StatisticNumber>{userDetails.statistics.statuses['3'] || 0}</StatisticNumber>
              <StatisticLabel>Accepted contributions</StatisticLabel>
            </Statistic>
            <Statistic>
              <StatisticNumber>{userDetails.statistics.total}</StatisticNumber>
              <StatisticLabel>Total contributions</StatisticLabel>
            </Statistic>
          </StatisticContainer>
        </div>

        {isReviewer(userDetails) ? <ReviewerTasks reviews={data.reviewerTasks} /> : null}
        {isContributor(userDetails) ? (
          <ContributorTasks drafts={data.contributorDraftTasks} reviews={data.contributorReviewTasks} />
        ) : null}
        {data.projects.length ? (
          <>
            <Heading3 $margin>Active projects</Heading3>
            <ProjectListing projects={data.projects} showLink />
          </>
        ) : null}
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
      };

      response.isSiteAdmin = isAdmin(userDetails);

      const projects = api.getSiteProjects();

      if (isReviewer(userDetails)) {
        response.reviewerTasks = await api.getTasks<CrowdsourcingReview>(0, {
          type: 'crowdsourcing-review',
          status: [0, 1, 2],
          all_tasks: true,
        });
      }

      if (isContributor(userDetails)) {
        response.contributorDraftTasks = await api.getTasks<CrowdsourcingTask>(0, {
          type: 'crowdsourcing-task',
          status: [0, 1],
          all_tasks: true,
        });
        response.contributorReviewTasks = await api.getTasks<CrowdsourcingTask>(0, {
          type: 'crowdsourcing-task',
          status: 2,
          all_tasks: true,
        });
      }

      response.projects = (await projects).projects;

      return response as UserHomepageType['data'];
    },
  }
);
