import React from 'react';
import styled, { css } from 'styled-components';
import { useLocalStorage } from '../hooks/use-local-storage';
import { DownArrowIcon } from '../icons/DownArrowIcon';
import { ButtonIcon } from './Button';

export const MessageHeader = styled.div`
  background: #d3e0ff;
  color: #0d2047;
  padding: 0.5em 1em;
  font-weight: bold;
  cursor: pointer;
`;

export const MessageBody = styled.div.attrs<{ $isOpen?: boolean }, { $isOpen?: boolean }>(props => ({
  'data-cy': 'info-message',
  $isOpen: props.$isOpen,
}))`
  background: #d3e0ff;
  color: #0d2047;
  width: 100%;
  line-height: 1.9em;
  white-space: pre-wrap;
  max-height: 0px;
  transition: max-height 0.5s;
  overflow: hidden;
  ${props =>
    props.$isOpen &&
    css`
      max-height: 500px;
    `}
`;

const MessageBodyInner = styled.div`
  padding: 0.5em 1em;
`;

export const MessageContainer = styled.div`
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 1em;
`;

export const Message: React.FC<{ id?: string; header?: string }> = ({ id, header, children }) => {
  const [isOpen, setIsOpen] = useLocalStorage(`message-collapse-${id || 'default'}`, true);

  return (
    <MessageContainer>
      {header ? (
        <MessageHeader onClick={() => setIsOpen(o => !o)}>
          {header}

          <ButtonIcon style={{ float: 'right' }}>
            <DownArrowIcon
              style={
                isOpen
                  ? {
                      transform: 'rotate(0deg)',
                      fill: '#6c757d',
                      width: '22px',
                      height: '23px',
                      transition: 'transform .3s',
                    }
                  : {
                      transform: 'rotate(180deg)',
                      fill: '#6c757d',
                      width: '22px',
                      height: '23px',
                      transition: 'transform .3s',
                    }
              }
            />
          </ButtonIcon>
        </MessageHeader>
      ) : null}
      <MessageBody $isOpen={isOpen}>
        <MessageBodyInner>{children}</MessageBodyInner>
      </MessageBody>
    </MessageContainer>
  );
};
