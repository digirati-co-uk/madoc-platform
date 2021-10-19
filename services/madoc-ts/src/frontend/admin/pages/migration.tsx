import React from 'react';
import { AdminHeader } from '../molecules/AdminHeader';
import { WidePage } from '../../shared/atoms/WidePage';
import { useTranslation } from 'react-i18next';
import {
  ActivityAction,
  ActivityActions,
  ActivityContainer,
  ActivityDot,
  ActivityItem,
  ActivitySummary,
  ActivityTitle,
} from '../../shared/components/Activity';
import { HrefLink } from '../../shared/utility/href-link';
import { useMutation } from 'react-query';
import { useApi } from '../../shared/hooks/use-api';
import styled from 'styled-components';
import { Heading3 } from '../../shared/atoms/Heading3';
import { WarningMessage } from '../../shared/atoms/WarningMessage';

const green = 'Add';
const yellow = 'Update';
const red = 'Delete';
const blue = 'Move';

const InfoContainer = styled.div`
  line-height: 1.4;
  max-width: 800px;
  margin: 1em auto 4em auto;
  a {
    color: #5169dd;
    font-weight: 600;
  }

  code {
    background: #e5e7f1;
    border-radius: 3px;
    padding: 0.2em 0.4em;
  }
`;

export const Migration: React.FC = () => {
  const { t } = useTranslation();
  const api = useApi();

  // 1. Database integrity
  // 2. Freeze changes in Omeka
  // 3. Set up new SMTP environment variables
  // 4. Updating services + environment variables
  // 5. Enable migration-mode (freeze things)

  const [databaseIntegrity, databaseIntegrityStatus] = useMutation(async (type: string) => {
    return api.request<{ issues: string[] }>(`/api/madoc/system/migrate-check`, {
      method: 'POST',
      body: {
        type: 'database-integrity',
      },
    });
  });
  const [smtpCheck, smtpCheckStatus] = useMutation(async (type: string) => {
    return api.request<{ issues: string[] }>(`/api/madoc/system/migrate-check`, {
      method: 'POST',
      body: {
        type: 'smtp-check',
      },
    });
  });

  return (
    <>
      <AdminHeader breadcrumbs={[{ label: 'Site admin', link: '/', active: true }]} title={'Migration guide'} />
      <WidePage>
        <InfoContainer>
          <WarningMessage>
            Version 2.0 is not yet released. You should still prepare and ensure the SMTP and database integrity steps
            below pass. When version 2.0 is released, you will be able to enter migration mode and update the tags.
          </WarningMessage>
          <Heading3>What has changed?</Heading3>
          <p>
            This installation of Madoc is currently running on the v2 development branch. This has evolved over the past
            months with new features and additions on top of the existing Omeka-S platform.
          </p>
          <p>
            For the 2.0 milestone we have removed Omeka-S as a dependency, and incorporated the remaining functionality
            into this admin panel. This includes:
            <ul>
              <li>
                <HrefLink href={'/global/sites'}>Creating new sites</HrefLink>
              </li>
              <li>
                <HrefLink href={'/global/users'}>Managing users</HrefLink>
              </li>
              <li>
                <HrefLink href={'/site/invitations'}>Creating invitations</HrefLink>
              </li>
              <li>
                <HrefLink href={'/site/permissions'}>Assigning users site permissions</HrefLink>
              </li>
              <li>
                <HrefLink href={'/system/themes'}>Site themes</HrefLink>
              </li>
              <li>
                <HrefLink href={'/configure/site/system'}>Site configuration</HrefLink>
              </li>
            </ul>
          </p>
          <h4>Database integrity</h4>
          <p>
            The data that currently exists in <strong>MySQL</strong> will need migrated into <strong>PostgreSQL</strong>
            . Once you upgrade to 2.0 you will no longer need the <strong>MySQL</strong> server configured. The{' '}
            <strong>Database Integrity</strong> step will make sure every <strong>site</strong>, <strong>user</strong>{' '}
            and <strong>site permission</strong> is migrated.
          </p>
          <h4>SMTP server</h4>
          <p>
            The second change is how Madoc sends emails. Previously Omeka sent emails to users to verify their accounts
            and to reset their passwords. This has been migrated and new environment variables have been created to
            configure this correctly.
            <ul>
              <li>
                <code>SMTP_HOST</code> - The host of an SMTP server
              </li>
              <li>
                <code>SMTP_PORT</code> - The port for your SMTP server
              </li>
              <li>
                <code>SMTP_SECURITY</code> - The security that should be used (default: tls)
              </li>
              <li>
                <code>SMTP_USER</code> - The user credential for connecting to the server
              </li>
              <li>
                <code>SMTP_PASSWORD</code> - The password credential for connecting to the server
              </li>
              <li>
                <code>MAIL_FROM_USER</code> - The email address that will be in the "from" field when sending emails.
              </li>
            </ul>
          </p>
          <p>Once you have added those environment variables, you can verify with the flow below.</p>
          <h4>Docker compose / service changes</h4>
          <p>
            At this point you should prepare changes required in your <code>docker-compose.yaml</code> or equivalent
            service definition. Broadly speaking the following has changed:
            <ul>
              <li>
                <strong>Gateway</strong> <code>ghcr.io/digirati-co-uk/madoc-api-gateway</code>
                <ul>
                  <li>
                    <code>TYK_GW_STORAGE_HOST</code> environment variable no longer required
                  </li>
                  <li>
                    <code>TYK_GW_SECRET</code> environment variable no longer required
                  </li>
                  <li>
                    <code>JWT_SERVICES</code> environment variable no longer required
                  </li>
                  <li>
                    Link to <code>gateway-redis</code> no longer required
                  </li>
                  <li>
                    Link to <code>madoc</code> no longer required (service removed)
                  </li>
                  <li>
                    <code>policies.json</code> no longer supported
                  </li>
                  <li>
                    <code>tyk.conf</code> no longer supported
                  </li>
                  <li>
                    <code>openssl-certs</code> volume no longer required
                  </li>
                  <li>
                    No longer depends on <code>certs</code> container (service removed)
                  </li>
                  <li>
                    No longer depends on <code>gateway-redis</code>
                  </li>
                </ul>
              </li>
              <li>
                <strong>Madoc</strong> <code>ghcr.io/digirati-co-uk/madoc-omeka</code>
                <ul>
                  <li>Service removed</li>
                </ul>
              </li>
              <li>
                <strong>Certs</strong> <code>ghcr.io/digirati-co-uk/madoc-certs</code>
                <ul>
                  <li>Service removed</li>
                </ul>
              </li>
              <li>
                <strong>MySQL Database</strong> <code>ghcr.io/digirati-co-uk/madoc-database</code>
                <ul>
                  <li>Service removed</li>
                </ul>
              </li>
              <li>
                <strong>Madoc TS</strong> <code>ghcr.io/digirati-co-uk/madoc-ts</code>
                <ul>
                  <li>
                    <code>OMEKA__DATABASE_HOST</code> environment variable removed
                  </li>
                  <li>
                    <code>OMEKA__DATABASE_NAME</code> environment variable removed
                  </li>
                  <li>
                    <code>OMEKA__DATABASE_USER</code> environment variable removed
                  </li>
                  <li>
                    <code>OMEKA__DATABASE_PASSWORD</code> environment variable removed
                  </li>
                  <li>
                    <code>OMEKA__DATABASE_PORT</code> environment variable removed
                  </li>
                  <li>
                    <code>OMEKA__URL</code> environment variable removed
                  </li>
                  <li>
                    <code>OMEKA_FILE_DIRECTORY</code> environment variable renamed to{' '}
                    <code>STORAGE_FILE_DIRECTORY</code>
                  </li>
                  <li>
                    <code>MIGRATE</code> environment variable removed
                  </li>
                  <li>
                    No longer depends on <code>certs</code> container (service removed)
                  </li>
                  <li>
                    No longer links to <code>madoc-database</code> container (service removed)
                  </li>
                  <li>
                    No longer links to <code>madoc</code> container (service removed)
                  </li>
                </ul>
              </li>
            </ul>
          </p>
          <h4>Freeze changes in Omeka</h4>
          <p>
            The next step is to stop Omeka for managing sites, users and site permissions. You can find alternative
            links above for the management. At this point you should be prepared to update your Madoc site with the
            changes described.
          </p>
          <h4>Migration mode</h4>
          <p>
            Once you are ready to migrate, you can put the site into migration mode. This is an optional step, but will
            put the site into a maintenance mode. Madoc will no longer be accessible and a splash screen will be
            displayed in place of the main site.
          </p>
          <h4>Update to Madoc 2.0</h4>
          <p>
            At this point you can update all of your <code>image: [name]</code> definitions in your docker-compose to
            point to the tag <code>2.0</code>. This tag will be stable and any changes will be bugfixes only. There may
            be new features - but these will be disabled by default. A changelog can be found in the main GitHub
            repository.
          </p>
          <p>
            Once you have updated the tags, you can restart the services. This screen will not longer be available in
            the 2.0 release.
          </p>
        </InfoContainer>
        <ActivityContainer>
          <ActivityItem>
            <ActivityDot
              $action={
                databaseIntegrityStatus.isIdle
                  ? blue
                  : databaseIntegrityStatus.isLoading
                  ? yellow
                  : databaseIntegrityStatus.isSuccess
                  ? databaseIntegrityStatus.data?.issues.length
                    ? red
                    : green
                  : red
              }
            />
            <ActivityTitle>Database integrity</ActivityTitle>
            <ActivitySummary>
              Make sure that your database is migrated so that when the Omeka database is removed, there is no data
              lost.
            </ActivitySummary>
            <ActivitySummary>
              {databaseIntegrityStatus.isError ? 'Unknown error running migration check' : null}
              {databaseIntegrityStatus.data?.issues.length ? (
                <div>
                  <h4>We found the following issues</h4>
                  <ul>
                    {databaseIntegrityStatus.data?.issues.map((issue, i) => {
                      return <li key={i}>{issue}</li>;
                    })}
                  </ul>
                </div>
              ) : null}
            </ActivitySummary>
            <ActivityActions>
              {databaseIntegrityStatus.isSuccess && databaseIntegrityStatus.data?.issues.length === 0 ? (
                <ActivityAction $disabled>Success</ActivityAction>
              ) : (
                <ActivityAction onClick={() => databaseIntegrity()} $disabled={databaseIntegrityStatus.isLoading}>
                  Run integrity check
                </ActivityAction>
              )}
            </ActivityActions>
          </ActivityItem>

          <ActivityItem>
            <ActivityDot
              $action={
                smtpCheckStatus.isIdle
                  ? blue
                  : smtpCheckStatus.isLoading
                  ? yellow
                  : smtpCheckStatus.isSuccess
                  ? smtpCheckStatus.data?.issues.length
                    ? red
                    : green
                  : red
              }
            />
            <ActivityTitle>Setup new SMTP environment</ActivityTitle>
            <ActivitySummary>[todo - description of changes]</ActivitySummary>
            <ActivitySummary>
              {smtpCheckStatus.isError ? 'Unknown error running migration check' : null}
              {smtpCheckStatus.data?.issues.length ? (
                <div>
                  <h4>We found the following issues</h4>
                  <ul>
                    {smtpCheckStatus.data?.issues.map((issue, i) => {
                      return <li key={i}>{issue}</li>;
                    })}
                  </ul>
                </div>
              ) : null}
            </ActivitySummary>
            <ActivityActions>
              {smtpCheckStatus.isSuccess && smtpCheckStatus.data?.issues.length === 0 ? (
                <ActivityAction $disabled>Success</ActivityAction>
              ) : (
                <ActivityAction onClick={() => smtpCheck()} $disabled={smtpCheckStatus.isLoading}>
                  Test SMTP
                </ActivityAction>
              )}
            </ActivityActions>
          </ActivityItem>

          <ActivityItem>
            <ActivityDot $action={red} />
            <ActivityTitle>Docker-compose / service changes</ActivityTitle>
            <ActivitySummary>
              Once you you have verified the database integrity and the SMTP environment, you should prepare a new
              docker-compose with the changes, ready to be applied when you do the migration.
            </ActivitySummary>
          </ActivityItem>

          <ActivityItem>
            <ActivityDot $action={red} />
            <ActivityTitle>Freeze changes in Omeka</ActivityTitle>
            <ActivitySummary>
              Click to freeze changes in Omeka. This will prevent you from using the Omeka Admin interface.
            </ActivitySummary>
            <ActivityActions>
              <ActivityAction $disabled>Freeze Omeka</ActivityAction>
            </ActivityActions>
          </ActivityItem>

          <ActivityItem>
            <ActivityDot $action={red} />
            <ActivityTitle>Migration mode</ActivityTitle>
            <ActivitySummary>
              When you are ready, you can put madoc into a migration mode to prevent any corruption.
            </ActivitySummary>
            <ActivityActions>
              <ActivityAction $disabled>Enter migration mode</ActivityAction>
            </ActivityActions>
          </ActivityItem>

          <ActivityItem>
            <ActivityDot $action={red} />
            <ActivityTitle>Update to Madoc 2.0</ActivityTitle>
            <ActivitySummary>
              Once all of the other steps have been completed, you are ready to update and point to the latest tags.
            </ActivitySummary>
          </ActivityItem>
        </ActivityContainer>
      </WidePage>
    </>
  );
};
