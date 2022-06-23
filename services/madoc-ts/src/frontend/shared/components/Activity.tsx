import React from 'react';
import styled, { css } from 'styled-components';
import { ChangeDiscoveryActivity } from '../../../activity-streams/change-discovery-types';
import { parseUrn } from '../../../utility/parse-urn';
import { TimeAgo } from '../atoms/TimeAgo';
import { HrefLink } from '../utility/href-link';

export const ActivityContainer = styled.div`
  position: relative;
  background: #fff;
  padding-left: 3em;
  border-radius: 5px;
  z-index: 1;
  max-width: 800px;
  margin-top: 1em;
  margin-left: auto;
  margin-right: auto;
  padding-top: 1em;
  padding-bottom: 1em;

  &:after {
    top: 0;
    left: 1.5em;
    position: absolute;
    content: '';
    height: 100%;
    width: 3px;
    background: #d2d8e8;
    z-index: 2;
  }
`;

const colors: any = {
  Move: '#5b82d8',
  Create: '#6da961',
  Add: '#6da961',
  Update: '#bf7b47',
  Delete: '#a90e21',
  Remove: '#a90e21',
};

const ActivityDot = styled.div<{ $action?: string }>`
  height: 15px;
  width: 15px;
  margin-top: 0.2em;
  margin-left: -6px;
  position: absolute;
  left: 1.5em;
  border-radius: 50%;
  display: block;
  border: 3px solid #fff;
  background: ${props => (props.$action && colors[props.$action] ? colors[props.$action] : colors.Move)};
  overflow: hidden;
  z-index: 3;
`;

const ActivityItem = styled.div`
  background: #fff;
  padding: 0.5em;
  margin-bottom: 1em;
`;

const ActivityTitle = styled.div`
  font-weight: bold;
  font-size: 0.9em;
`;

const ActivitySummary = styled.div`
  color: #333;
  font-size: 0.8em;
`;

const ActivityLink = styled.a`
  font-size: 0.8em;
  color: #999;
`;

export const ActivityActions = styled.div`
  display: flex;
  padding: 0.5em 0;
  font-size: 0.7em;
`;

export const ActivityAction = styled.a<{ $disabled?: boolean }>`
  margin-right: 1em;
  padding: 0.4em 0.8em;
  background: #e4e7f1;
  border-radius: 3px;
  color: #333;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background: #cfd4e5;
  }

  ${props =>
    props.$disabled &&
    css`
      opacity: 0.8;
      pointer-events: none;
    `}
`;

const ActivityTime = styled.div`
  color: #666;
  font-size: 0.7em;
  margin-bottom: 0.5em;
`;

export const Activity: React.FC<{
  activity: ChangeDiscoveryActivity;
  actions: Array<{ link: string; external?: boolean; label: string }>;
}> = ({ activity, actions }) => {
  const isMadoc = activity.object.canonical && activity.object.canonical.startsWith('urn:madoc');
  const parsed = isMadoc ? parseUrn(activity.object.canonical as string) : null;

  return (
    <ActivityItem>
      <ActivityDot $action={activity.type} />
      <ActivityTitle>
        {activity.type} {activity.object.type}
      </ActivityTitle>
      <ActivityTime>
        <TimeAgo date={new Date(activity.endTime)} />
      </ActivityTime>
      {activity.summary ? <ActivitySummary>{activity.summary}</ActivitySummary> : null}
      <ActivityLink target="_blank" href={activity.object.id}>
        {(activity.object as any).name || activity.object.id}
      </ActivityLink>
      <ActivityActions>
        {parsed && parsed.type === 'manifest' ? (
          <ActivityAction as={HrefLink} href={`/manifests/${parsed.id}`}>
            View in madoc
          </ActivityAction>
        ) : null}

        {actions.map((action, k) => (
          <ActivityAction as={action.external ? 'a' : HrefLink} key={k} href={action.link}>
            {action.label}
          </ActivityAction>
        ))}
      </ActivityActions>
    </ActivityItem>
  );
};
