import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import invariant from 'tiny-invariant';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import { SystemDescription, SystemMetadata, SystemName } from '../../../shared/atoms/SystemUI';
import { TimeAgo } from '../../../shared/atoms/TimeAgo';
import { ConfirmButton } from '../../../shared/capture-models/editor/atoms/ConfirmButton';
import { AutocompleteField } from '../../../shared/capture-models/editor/input-types/AutocompleteField/AutocompleteField';
import { useApi } from '../../../shared/hooks/use-api';
import { Button } from '../../../shared/navigation/Button';
import { HrefLink } from '../../../shared/utility/href-link';

export function ViewTermConfiguration() {
  const { t } = useTranslation();
  const api = useApi();
  const { id } = useParams<{ id: string }>();
  const { data: termConfiguration, error } = useQuery(['term-configuration', { id }], async () => {
    return await api.siteManager.getTermConfiguration(id as string);
  });
  const navigate = useNavigate();

  const [deleteTerm, deleteTermStatus] = useMutation(async () => {
    invariant(id, 'ID must be defined');
    await api.siteManager.deleteTermConfiguration(id);
    // navigate to list.
    navigate(`/configure/site/terms`);
  });

  if (deleteTermStatus.isLoading) {
    return <div>Deleting...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!termConfiguration) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <SystemListItem key={termConfiguration.id}>
        <SystemMetadata>
          <SystemName>
            <HrefLink href={`/configure/site/terms/${termConfiguration.id}`}>{termConfiguration.label}</HrefLink>
          </SystemName>
          <SystemDescription>{termConfiguration.description}</SystemDescription>
          <SystemDescription>
            <code>{termConfiguration.url_pattern}</code>
          </SystemDescription>
          {termConfiguration.attribution ? (
            <SystemDescription>
              <h4>Attribution</h4>
              <p>{termConfiguration.attribution}</p>
            </SystemDescription>
          ) : null}
          <SystemDescription>
            Created: <TimeAgo date={termConfiguration.created_at} />
          </SystemDescription>
        </SystemMetadata>
      </SystemListItem>

      <SystemListItem>
        <div>
          <h2>Paths</h2>
          <ul>
            <li>
              URI: <code>{termConfiguration.paths.uri}</code>
            </li>
            <li>
              Label: <code>{termConfiguration.paths.label}</code>
            </li>
            <li>
              Description: <code>{termConfiguration.paths.description}</code>
            </li>
            <li>
              Resource class: <code>{termConfiguration.paths.resource_class}</code>
            </li>
            <li>
              Language: <code>{termConfiguration.paths.language}</code>
            </li>
          </ul>
        </div>
      </SystemListItem>

      <SystemListItem>
        <div style={{ flex: 1, height: 500 }}>
          <h2>Preview</h2>
          <div style={{ width: '100%' }}>
            <AutocompleteField
              type={'autocomplete-field'}
              dataSource={`/s/${api.getSiteSlug()}/madoc/api/term-proxy/${termConfiguration.id}?q=%`}
              id={`1`}
              value={undefined}
              label={termConfiguration.label}
              updateValue={() => void 0}
              requestInitial={false}
            />
          </div>
        </div>
      </SystemListItem>

      <SystemListItem>
        <div>
          <ConfirmButton message="Are you sure you want to delete" onClick={deleteTerm}>
            <Button $error>Delete</Button>
          </ConfirmButton>
        </div>
      </SystemListItem>
    </div>
  );
}
