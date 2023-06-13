import React from 'react';
import styled, { css } from 'styled-components';
import { useLocalStorage } from '../hooks/use-local-storage';
import { DownArrowIcon } from '../icons/DownArrowIcon';
import { InfoIcon } from '../icons/InfoIcon';
import { ButtonIcon } from '../navigation/Button';

const MessageHeader = styled.div`
  background: #d3e0ff;
  color: #000;
  display: flex;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  align-items: center;
`;

const MessageBody = styled.div.attrs<{ $isOpen?: boolean }, { $isOpen?: boolean }>(props => ({
  'data-cy': 'info-message',
  $isOpen: props.$isOpen,
}))`
  background: #d3e0ff;
  color: #000;
  width: 100%;
  line-height: 1.35rem;
  white-space: pre-wrap;
  transition: max-height 0.5s;
  overflow: hidden;
`;

const MessageBodyInner = styled.div`
  border-top: 1px solid #a6bbf6;
  background: #c3d4ff;
  padding: 0.5rem 1rem 1rem;
`;

export const MessageContainer = styled.div`
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1em;

  display: grid;
  grid-template-rows: 2.8rem 0fr;
  transition: grid-template-rows 0.3s;
  align-items: stretch;

  &[data-open='true'] {
    grid-template-rows: 2.8rem 1fr;
  }
`;

export const Message: React.FC<{ id?: string; header?: string }> = ({ id, header, children }) => {
  const [isOpen, setIsOpen] = useLocalStorage(`message-collapse-${id || 'default'}`, true);

  return (
    <MessageContainer data-open={isOpen}>
      {header ? (
        <MessageHeader onClick={() => setIsOpen(o => !o)}>
          <InfoIcon style={{ fill: '#7f9cf8', fontSize: '1.25rem', marginRight: '0.5rem' }} />

          {header}

          <DownArrowIcon
            style={
              isOpen
                ? {
                    marginLeft: 'auto',
                    transform: 'rotate(0deg)',
                    fill: '#6c757d',
                    fontSize: '1.5rem',
                    transition: 'transform .3s',
                  }
                : {
                    marginLeft: 'auto',
                    transform: 'rotate(180deg)',
                    fill: '#6c757d',
                    fontSize: '1.5rem',
                    transition: 'transform .3s',
                  }
            }
          />
        </MessageHeader>
      ) : null}
      <MessageBody>
        <MessageBodyInner>{children}</MessageBodyInner>
      </MessageBody>
    </MessageContainer>
  );
};
