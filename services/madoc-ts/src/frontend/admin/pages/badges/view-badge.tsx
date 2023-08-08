import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../../types/badges';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import { ConfirmButton } from '../../../shared/capture-models/editor/atoms/ConfirmButton';
import { LocaleString } from '../../../shared/components/LocaleString';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { Button } from '../../../shared/navigation/Button';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { Heading1, Subheading1 } from '../../../shared/typography/Heading1';

export function ViewBadge() {
  const { data } = useData<Badge>(ViewBadge);
  const api = useApi();
  const navigate = useNavigate();
  const [deleteBadge, deleteBadgeStatus] = useMutation(async () => {
    if (data) {
      await api.siteManager.deleteBadge(data.id);
      navigate('/configure/site/badges');
    }
  });

  if (!data || deleteBadgeStatus.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <SystemListItem>
        <div>
          <LocaleString as={Heading1}>{data.label}</LocaleString>
          <LocaleString as={Subheading1}>{data.description}</LocaleString>
          <h3>Tiers</h3>
          <div style={{ display: 'flex' }}>
            {data.tier_colors ? (
              data.tier_colors.map((color, index) => {
                return (
                  <div key={index} style={{ '--award-tier': color, width: 100, margin: 20 } as any}>
                    <div dangerouslySetInnerHTML={{ __html: data.svg }} />
                  </div>
                );
              })
            ) : (
              <div style={{ '--award-tier': '#000', width: 100 } as any}>
                <div dangerouslySetInnerHTML={{ __html: data.svg }} />
              </div>
            )}
          </div>
        </div>
      </SystemListItem>
      <SystemListItem>
        <div>
          <ConfirmButton message="Are you sure you want to delete" onClick={deleteBadge}>
            <Button $error>Delete</Button>
          </ConfirmButton>
        </div>
      </SystemListItem>
    </>
  );
}

serverRendererFor(ViewBadge, {
  getKey: params => ['view-badge', { id: params.id }],
  getData: async (key, vars, api) => {
    return api.siteManager.getBadge(vars.id);
  },
});
