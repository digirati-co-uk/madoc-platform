import React from 'react';
import styled, { css } from 'styled-components';
import { ArrowForwardIcon } from '../icons/ArrowForwardIcon';
import { HrefLink } from '../utility/href-link';

const SystemCallToActionLink = styled(HrefLink)`
  text-decoration: none;
`;

const SystemCallToActionIcon = styled.div`
  font-size: 2.4em;
  transition: transform 0.3s;

  svg {
    fill: rgba(0, 0, 0, 0.5);
    transition: fill 0.3s;
  }
`;

const SystemCallToActionContainer = styled.div<{ $maxWidth?: boolean }>`
  background-image: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
  border: 2px solid transparent;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.13);
  border-radius: 5px;
  padding: 1em 1.5em;
  display: flex;
  margin-bottom: 2em;
  text-decoration: none;

  ${props =>
    props.$maxWidth &&
    css`
      max-width: 800px;
      margin: 0 auto 2em auto;
    `}

  &:hover {
    border-color: #5a78e8;
    ${SystemCallToActionIcon} {
      transform: translateX(4px);
      svg {
        fill: #5a78e8;
      }
    }
  }
`;

const SystemCallToActionTitle = styled.div`
  color: #5a78e8;
  font-size: 1.4em;
  text-decoration: none;
`;

const SystemCallToActionDescription = styled.div`
  font-size: 0.9em;
  color: rgba(0, 0, 0, 0.5);
  text-decoration: none;
`;

const SystemCallToActionMetadata = styled.div`
  flex: 1 1 0px;
`;

export const SystemCallToAction: React.FC<{
  title: string;
  description?: string;
  href: string;
  maxWidth?: boolean;
}> = ({ title, description, href, maxWidth }) => {
  return (
    <SystemCallToActionLink href={href}>
      <SystemCallToActionContainer $maxWidth={maxWidth}>
        <SystemCallToActionMetadata>
          <SystemCallToActionTitle>{title}</SystemCallToActionTitle>
          <SystemCallToActionDescription>{description}</SystemCallToActionDescription>
        </SystemCallToActionMetadata>
        <SystemCallToActionIcon>
          <ArrowForwardIcon />
        </SystemCallToActionIcon>
      </SystemCallToActionContainer>
    </SystemCallToActionLink>
  );
};
