import React from 'react';
import styled, { css } from 'styled-components';

interface SimpleStatusProps {
  status: number;
  status_text: string;
}

export const baseTab = css`
  padding: 0.25em 0.8em;
  border-radius: 3px;
  font-size: 0.8em;
  display: inline-block;
  align-self: center;
`;

const Progress = styled.div`
  ${baseTab};
  background: #ffffff;
  color: #377cc4;
  border: 1px solid #377cc4;
`;

const Review = styled.div`
  ${baseTab};
  background: #ffffff;
  color: #ab8e23;
  border: 1px solid #ab8e23;
`;

const Approved = styled.div`
  ${baseTab};
  background: #ffffff;
  color: #5fa739;
  border: 1px solid #5fa739;
`;

const Rejected = styled.div`
  ${baseTab};
  background: #ffffff;
  color: #a55717;
  border: 1px solid #a55717;
`;

export function SimpleStatus(props: SimpleStatusProps) {
  switch (props.status) {
    case 3:
      return <Approved>{props.status_text}</Approved>;
    case 2:
      return <Review>{props.status_text}</Review>;
    case 1:
      return <Progress>{props.status_text}</Progress>;
    default:
    case -1:
      return <Rejected>{props.status_text}</Rejected>;
  }
}
