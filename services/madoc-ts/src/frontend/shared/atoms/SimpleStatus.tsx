import React from 'react';
import styled, { css } from 'styled-components';

interface SimpleStatusProps {
  status: number;
  status_text: string;
  onClick?: (e: any) => void;
}

export const baseTab = css`
  padding: 0.25em 0.8em;
  border-radius: 4px;
  font-size: 0.8em;
  display: inline-block;
  align-self: center;
`;

const Assigned = styled.div`
  ${baseTab};
  background: #ffffff;
  color: #8a5f9d;
  border: 2px solid #8a5f9d;
`;
const Request = styled.div`
  ${baseTab};
  color: #2e6ba9;
  border: 2px solid #2e6ba9;
`;

const Progress = styled.div`
  ${baseTab};
  color: #2e6ba9;
  border: 2px solid #2e6ba9;
`;

const Review = styled.div`
  ${baseTab};
  color: #7d6352;
  border: 2px solid #7d6352;
`;

const Approved = styled.div`
  ${baseTab};
  color: #417525;
  border: 2px solid #417525;
`;

const Rejected = styled.div`
  ${baseTab};
  color: #a61a02;
  border: 2px solid #a61a02;
`;

export function SimpleStatus(props: SimpleStatusProps) {
  switch (props.status) {
    case 4:
      return <Request onClick={props.onClick}>{props.status_text}</Request>;
    case 3:
      return <Approved onClick={props.onClick}>{props.status_text}</Approved>;
    case 2:
      return <Review onClick={props.onClick}>{props.status_text}</Review>;
    case 1:
      return <Progress onClick={props.onClick}>{props.status_text}</Progress>;
    case 0:
      return <Assigned onClick={props.onClick}>{props.status_text}</Assigned>;
    default:
    case -1:
      return <Rejected onClick={props.onClick}>{props.status_text}</Rejected>;
  }
}
