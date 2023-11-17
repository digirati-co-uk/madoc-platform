import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { PublicUserProfile } from '../../../extensions/site-manager/types';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import { MetaDataDisplay } from '../../shared/components/MetaDataDisplay';
import { useSite } from '../../shared/hooks/use-site';
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

const manuallyDisplayed = ['gravitar', 'bio', 'institution', 'status'];

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
      : metadata.subject && metadata.subject.type === 'manifest' && metadata.project
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
    const site = useSite();

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
            <img src={`/s/${site.slug}/madoc/api/users/${data.user.id}/image`} alt="" />
          </ProfileImage>
          <div style={{ display: 'flex' }}>
            <Heading1 style={{ width: 'auto' }}>{data.user.name}</Heading1>
            {data.user.automated ? (
              <Tag style={{ alignSelf: 'center', marginLeft: '.5em', marginRight: 'auto' }}>
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
                  <HrefLink href="/dashboard/settings">{t('Edit profile')}</HrefLink>
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
