import styled from 'styled-components';
import React, { useState } from 'react';
import { NotStartedIcon } from './NotStartedIcon';
import { ProgressIcon } from './ProgressIcon';
import { TickIcon } from './TickIcon';
import { ErrorIcon } from './ErrorIcon';

export const StatusWrapper = styled.div<{ open?: boolean }>`
  display: flex;
  cursor: pointer;
  align-items: center;
  border-radius: 3px;
  transition: margin-right 0.3s, padding-right 0.3s, background-color 0.3s;
  background: ${props => (props.open ? '#eee' : '#fff')};
  margin: 0 ${props => (props.open ? '10px' : '0')} 0 4px;
  padding: 4px ${props => (props.open ? '10px' : '4px')} 4px 4px;
`;

export const StatusText = styled.div<{ open?: boolean }>`
  font-size: 11px;
  font-weight: bold;
  line-height: 14px;
  white-space: nowrap;
  transition: max-width 0.3s, margin-left 0.3s;
  overflow: hidden;
  color: #444;
  max-width: ${props => (props.open ? '120px' : '0')};
  margin-left: ${props => (props.open ? '3px' : '0')};
`;

export const StatusIcon: React.FC<{ status: number }> = ({ status }) => {
  switch (status) {
    case -1:
      return <ErrorIcon />;
    case 0:
      return <NotStartedIcon />;
    case 1:
      return <NotStartedIcon accepted />;
    case 2:
      return <ProgressIcon />;
    case 3:
      return <TickIcon />;
    default:
      return <ProgressIcon />;
  }
};

export const Status: React.FC<{ status: number; text?: string; isOpen?: boolean; interactive?: boolean }> = ({
  interactive = true,
  status,
  text,
  isOpen = false,
}) => {
  const [open, setOpen] = useState(isOpen);

  return (
    <StatusWrapper open={open} title={text} onClick={interactive ? () => setOpen(o => !o) : undefined}>
      <StatusIcon status={status} />
      {text ? <StatusText open={open}>{text}</StatusText> : null}
    </StatusWrapper>
  );
};
