import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useBrowserLayoutEffect } from '../../../hooks/use-browser-layout-effect';
import { Button } from './Button';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const Portal = styled.div`
  position: fixed;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const ModalContainer = styled.div`
  position: fixed;
  display: flex;
  z-index: 101;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const Modal = styled.div`
  background: #fff;
  margin: auto;
  width: 400px;
  min-height: 100px;
  padding: 20px;
  border-radius: 4px;
`;

export const ConfirmButton: React.FC<{ message: string; defaultButton?: boolean; onClick: () => void }> = ({
  message,
  defaultButton,
  onClick,
  children,
}) => {
  const { t } = useTranslation();
  const portalEl = useRef<HTMLElement>();
  const [ready, setIsReady] = useState(false);
  const containerRef = useRef<any>();

  useBrowserLayoutEffect(() => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    portalEl.current = element;

    return () => {
      portalEl.current = undefined;
      document.body.removeChild(element);
    };
  }, []);

  return (
    <>
      {ready && portalEl.current
        ? createPortal(
            <>
              <Portal />
              <ModalContainer
                ref={containerRef}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (e.target !== containerRef.current) {
                    return;
                  }
                  setIsReady(false);
                }}
              >
                <Modal>
                  <h3>{message}</h3>
                  {defaultButton ? (
                    <Button
                      primary
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        onClick();
                        setIsReady(false);
                      }}
                    >
                      {t('Remove')}
                    </Button>
                  ) : (
                    <span
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        onClick();
                        setIsReady(false);
                      }}
                    >
                      {children}
                    </span>
                  )}
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsReady(false);
                    }}
                  >
                    Cancel
                  </Button>
                </Modal>
              </ModalContainer>
            </>,
            portalEl.current
          )
        : null}
      <span
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          setIsReady(true);
        }}
      >
        {children}
      </span>
    </>
  );
};
