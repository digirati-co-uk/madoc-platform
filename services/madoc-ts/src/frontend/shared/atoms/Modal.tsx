import styled from 'styled-components';
import * as React from 'react';
import { CloseIcon } from './CloseIcon';

export const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  background: rgba(0, 0, 0, 0.4);
`;

export const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  display: flex;
`;

export const InnerModalContainer = styled.div`
  max-width: 600px;
  width: 100%;
  min-height: 350px;
  display: flex;
  margin: auto;
  flex-direction: column;
  max-height: 80vh;
`;

export const ModalHeader = styled.div`
  background: #000;
  width: 100%;
  color: #fff;
  padding: 1em;
  display: flex;
`;

export const ModalHeaderTitle = styled.div`
  color: #fff;
  font-size: 1.2em;
  flex: 1 1 0px;
`;

export const ModalCloseIcon = styled(CloseIcon)`
  fill: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  &:hover {
    fill: rgba(255, 255, 255, 1);
  }
`;

export const ModalBody = styled.div`
  background: #fff;
  flex: 1 1 0px;
  padding: 1em;
  overflow-y: auto;
`;
