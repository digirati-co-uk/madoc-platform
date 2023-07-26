import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { PublicUserProfile } from '../../../extensions/site-manager/types';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import { MetaDataDisplay } from '../../shared/components/MetaDataDisplay';
import { BuildingIcon } from '../../shared/icons/BuildingIcon';
import { EditIcon } from '../../shared/icons/EditIcon';
import { TableContainer, TableRow, TableRowLabel } from '../../shared/layout/Table';
import { useData } from '../../shared/hooks/use-data';
import { LocaleString, useApi, useUser } from '../../shared/plugins/public-api';
import { Heading1 } from '../../shared/typography/Heading1';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { HrefLink } from '../../shared/utility/href-link';
import { UniversalComponent } from '../../types';
import { Tag } from '../../shared/capture-models/editor/atoms/Tag';
import { getBotType } from '../../../automation/utils/get-bot-type';
import { MailIcon } from '../../shared/icons/MailIcon';
import { useTaskMetadata } from '../hooks/use-task-metadata';

type ViewUserType = {
  query: any;
  variables: { id: number };
  params: { id: string };
  data: PublicUserProfile;
  context: any;
};

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
`;

const ProfileStatusBadge = styled.div`
  background: #e0f9ff;
  border: 1px solid #d5eefc;
  color: rgba(0, 0, 0, 0.6);
  padding: 0.35em 1.2em;
  align-items: center;
  font-size: 0.75em;
  align-self: center;
  margin-left: 1em;
  height: 2.5em;
  display: flex;
  border-radius: 1.25em;
`;

const ProfileName = styled(Heading1)`
  margin: 1em 0;
  margin-bottom: 0.5em;
`;

const ProfileRole = styled.div`
  color: #666;
`;

const ProfileActions = styled.div`
  display: flex;
  //background: #eee;
  margin-bottom: 1em;
  margin-top: 1em;

  & > * {
    padding: 0 1em;
    border-right: 1px solid #ccc;

    &:last-child {
      border-right: none;
    }

    &:first-child {
      padding-left: 0;
    }
  }
`;

const ProfileBio = styled.div`
  margin-bottom: 1em;
  white-space: pre-wrap;
  max-width: 600px;
`;

const ProfileContainer = styled.div`
  display: flex;
`;

const ProfileDetails = styled.div`
  flex: 1;
  overflow: hidden;
`;

const ProfileSidebar = styled.div`
  width: 380px;
  background: #f9f9f9;
  padding: 1em 2em;
  margin-left: 1em;
  border-radius: 4px;
`;

// const ProfileStat = styled.div`
//   margin-bottom: 0.5em;
//   display: flex;
//   align-items: center;
// `;

const ProfileStatValue = styled.span`
  font-size: 1.2em;
  text-align: right;
`;

const ProfileAction = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5em;
`;

const ProfileStatLabel = styled.span`
  font-size: 0.875em;
  color: #333;
  align-self: center;
`;

const ProfileStats = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 1em;
  margin-bottom: 3em;
  grid-template-areas: 'value' 'label';
`;

const manuallyDisplayed = ['bio', 'institution', 'status'];

const ContributionThumb = styled.div`
  background: #eee;

  img,
  svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

function ContributionSnippet({ task, first }: { task: CrowdsourcingTask; first: boolean }) {
  const metadata = useTaskMetadata(task);

  const resourceLink =
    metadata.subject && metadata.subject.parent && metadata.project
      ? `/projects/${metadata.project.slug}/manifests/${metadata.subject.parent.id}/c/${metadata.subject.id}`
      : metadata.subject && metadata.subject.type === 'manifest'
      ? `/projects/${metadata.project.slug}/manifests/${metadata.subject.id}`
      : null;

  return (
    <div style={{ background: '#fff', margin: '2em 0', display: 'flex' }}>
      <HrefLink href={resourceLink || '#'}>
        <ContributionThumb style={{ width: 128, height: 128 }}>
          {metadata.selectorThumbnail && metadata.selectorThumbnail.svg ? (
            <div dangerouslySetInnerHTML={{ __html: metadata.selectorThumbnail.svg }} />
          ) : metadata.subject && metadata.subject.thumbnail ? (
            <img src={metadata.subject.thumbnail} />
          ) : null}
        </ContributionThumb>
      </HrefLink>
      <div style={{ flex: 1, marginLeft: '1em' }}>
        {metadata.subject ? (
          <>
            <h4 style={{ marginTop: 0 }}>
              {metadata.subject.parent ? (
                <>
                  <LocaleString>{metadata.subject.parent.label}</LocaleString>
                  {' - '}
                </>
              ) : null}
              <LocaleString>{metadata.subject.label}</LocaleString>
            </h4>
          </>
        ) : (
          <h4>{task.name}</h4>
        )}
        {metadata.project ? (
          <>
            <div>
              Project:{' '}
              <HrefLink href={`/projects/${metadata.project.slug}`}>
                <LocaleString>{metadata.project.label}</LocaleString>
              </HrefLink>
            </div>
          </>
        ) : null}

        {resourceLink ? (
          <div style={{ marginTop: '1em' }}>
            <HrefLink href={resourceLink}>View resource</HrefLink>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const ViewUser: UniversalComponent<ViewUserType> = createUniversalComponent<ViewUserType>(
  () => {
    const { t } = useTranslation();
    const { data } = useData(ViewUser);
    const user = useUser();

    const isSelf = user && user.id === data?.user.id;

    if (!data) {
      return <div>Loading...</div>;
    }

    const infoKeys = Object.keys(data.info).filter(key => {
      return !manuallyDisplayed.includes(key);
    });

    return (
      <>
        <ProfileHeader>
          <ProfileImage>
            <img src="data:image/png;base64,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" />
          </ProfileImage>
          <div style={{ display: 'flex' }}>
            <h1>{data.user.name}</h1>
            {data.user.automated ? (
              <Tag style={{ alignSelf: 'center', marginLeft: '.5em' }}>
                {getBotType(data.user.config?.bot?.type) || 'bot'}
              </Tag>
            ) : null}
            {data.info.status ? <ProfileStatusBadge>{data.info.status}</ProfileStatusBadge> : null}
          </div>
        </ProfileHeader>

        <ProfileContainer>
          <ProfileDetails>
            {data.info.bio ? <ProfileBio>{data.info.bio}</ProfileBio> : null}
            <ProfileActions>
              <ProfileRole>{data.user.site_role}</ProfileRole>
              {data.user.email ? (
                <ProfileAction>
                  <MailIcon />
                  <a href={`mailto:${data.user.email}`}>{data.user.email}</a>
                </ProfileAction>
              ) : null}
              {data.info.institution ? (
                <ProfileAction>
                  <BuildingIcon /> {data.info.institution}
                </ProfileAction>
              ) : null}
              {isSelf ? (
                <ProfileAction>
                  <EditIcon />
                  <HrefLink href="/dashboard/settings">Edit profile</HrefLink>
                </ProfileAction>
              ) : null}
            </ProfileActions>

            {infoKeys.length ? (
              <div style={{ background: '#f9f9f9', borderRadius: 5, marginBottom: '1em', maxWidth: 600 }}>
                <MetaDataDisplay
                  labelStyle="bold"
                  labelWidth={12}
                  variation="table"
                  bordered
                  metadata={infoKeys.map(infoKey => {
                    const info = data.info[infoKey];
                    const label = (data.infoLabels || {})[infoKey] || infoKey;
                    return {
                      label: { en: [label] },
                      value: { en: [info] },
                    };
                  })}
                />
              </div>
            ) : null}

            {data.recentTasks && data.recentTasks.length ? (
              <div>
                <h3>Recent contributions</h3>
                {data.recentTasks.map((task, i) => (
                  <div key={task.id}>
                    <ContributionSnippet task={task as any} first={i === 3} />
                  </div>
                ))}
              </div>
            ) : null}
          </ProfileDetails>
          {data.statistics?.crowdsourcing || data.statistics?.reviews ? (
            <ProfileSidebar>
              <div style={{ position: 'sticky', top: '1em' }}>
                {data.statistics?.crowdsourcing ? (
                  <>
                    <h3>{t('Contributions')}</h3>
                    <ProfileStats>
                      <>
                        <ProfileStatValue>{data.statistics.crowdsourcing.statuses['1']}</ProfileStatValue>
                        <ProfileStatLabel>{t('Accepted')}</ProfileStatLabel>
                      </>
                      <>
                        <ProfileStatValue>{data.statistics.crowdsourcing.statuses['2']}</ProfileStatValue>
                        <ProfileStatLabel>{t('In review')}</ProfileStatLabel>
                      </>
                      <>
                        <ProfileStatValue>{data.statistics.crowdsourcing.statuses['3']}</ProfileStatValue>
                        <ProfileStatLabel>{t('Completed')}</ProfileStatLabel>
                      </>
                      <>
                        <ProfileStatValue>{data.statistics.crowdsourcing.total}</ProfileStatValue>
                        <ProfileStatLabel>{t('Total')}</ProfileStatLabel>
                      </>
                    </ProfileStats>
                  </>
                ) : null}
                {data.statistics?.reviews ? (
                  <>
                    <h3>{t('Reviews')}</h3>
                    <ProfileStats>
                      <>
                        <ProfileStatValue>{data.statistics.reviews.statuses['1']}</ProfileStatValue>
                        <ProfileStatLabel>{t('Pending')}</ProfileStatLabel>
                      </>
                      <>
                        <ProfileStatValue>{data.statistics.reviews.statuses['2']}</ProfileStatValue>
                        <ProfileStatLabel>{t('In review')}</ProfileStatLabel>
                      </>
                      <>
                        <ProfileStatValue>{data.statistics.reviews.statuses['3']}</ProfileStatValue>
                        <ProfileStatLabel>{t('Completed')}</ProfileStatLabel>
                      </>
                      <>
                        <ProfileStatValue>{data.statistics.reviews.total}</ProfileStatValue>
                        <ProfileStatLabel>{t('Total')}</ProfileStatLabel>
                      </>
                    </ProfileStats>
                  </>
                ) : null}
              </div>
            </ProfileSidebar>
          ) : null}
        </ProfileContainer>
      </>
    );
  },
  {
    getKey: params => {
      return ['GetUser', { id: Number(params.id) }];
    },
    getData: (key, vars, api) => {
      return api.getUser(vars.id);
    },
  }
);
