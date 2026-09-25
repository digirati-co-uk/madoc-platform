import * as React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { HrefLink } from '../utility/href-link';
import { Tag } from '../capture-models/editor/atoms/Tag';

const error = '#a90e21';
const statuses = ['#AAA', '#4a67e4', '#ffb187', '#71c873'];

const TaskItemStatus = styled.div<{ $status?: number }>`
  background: ${props => {
    switch (props.$status) {
      case -1:
        return error;
      case 0:
      case 1:
      case 2:
      case 3:
        return statuses[props.$status];
      case undefined:
        return statuses[0];
      default:
        return statuses[2];
    }
  }};
  width: 4px;
  border-radius: 3px;
  margin-right: 0.5em;
`;

const TaskItemBody = styled.div`
  flex: 1 1 0px;
  min-width: 0;
`;

const TaskItemThumbnail = styled.div`
  width: 2.8em;
  height: 2.8em;
  border-radius: 3px;
  overflow: hidden;

  img {
    width: 2.8em;
    height: 2.8em;
    object-fit: cover;
    object-position: 50% 50%;
  }
`;

const TaskItemLabel = styled.div`
  font-size: 0.85em;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const TaskItemType = styled.div`
  font-size: 0.7em;
`;

export const TaskItem: React.FC<{
  onClick?: () => void;
  selected?: boolean;
  label: string | any;
  type: string;
  user?: { name: string; link: string; automated?: boolean };
  status: number;
  thumbnail?: string;
  $onDark?: boolean;
}> = props => {
  const { t } = useTranslation();

  return (
    <div
      className={`mb-[0.5em] flex cursor-pointer justify-stretch rounded-[3px] bg-white p-[0.4em] tracking-[-0.2px] shadow-sm hover:border-[var(--madoc-accent)] ${
        props.$onDark ? 'border-2 border-transparent' : 'border border-[#ddd]'
      } ${props.selected ? '!border-[var(--madoc-accent)]' : ''}`}
      onClick={props.onClick}
      data-cy="task-list-item"
    >
      <TaskItemStatus $status={props.status} />
      <TaskItemBody>
        <TaskItemLabel title={props.label}>{props.label}</TaskItemLabel>
        <TaskItemType>{props.type}</TaskItemType>
        {props.user ? (
          <div className="text-[0.7em] text-[#999] [&_a]:text-[var(--madoc-accent-link)]">
            {t('assigned to')} <HrefLink href={props.user.link}>{props.user.name}</HrefLink>
            {props.user.automated ? <Tag style={{ marginLeft: '0.5em' }}>bot</Tag> : null}
          </div>
        ) : null}
      </TaskItemBody>
      {props.thumbnail ? (
        <TaskItemThumbnail>
          <img src={props.thumbnail} alt={t('task thumbnail')} />
        </TaskItemThumbnail>
      ) : null}
    </div>
  );
};
