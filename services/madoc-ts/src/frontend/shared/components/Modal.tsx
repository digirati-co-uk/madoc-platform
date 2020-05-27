import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  InnerModalContainer,
  ModalBackground,
  ModalBody,
  ModalCloseIcon,
  ModalContainer,
  ModalHeader,
  ModalHeaderTitle,
} from '../atoms/Modal';
import { createPortal } from 'react-dom';

export const ModalButton: React.FC<{
  title: string;
  onClose?: () => void;
  render: (opts: { close: () => void }) => JSX.Element;
}> = ({ title, render, onClose, children }) => {
  const portalEl = useRef<HTMLElement>();
  const [ready, setIsReady] = useState(false);
  const containerRef = useRef<any>();

  useLayoutEffect(() => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    portalEl.current = element;

    return () => {
      portalEl.current = undefined;
      document.body.removeChild(element);
    };
  }, []);

  const closeModal = () => {
    setIsReady(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {ready && portalEl.current
        ? createPortal(
            <>
              <ModalBackground />
              <ModalContainer
                ref={containerRef}
                onClick={e => {
                  if (e.target !== containerRef.current) {
                    return;
                  }
                  setIsReady(false);
                }}
              >
                <InnerModalContainer>
                  <ModalHeader>
                    <ModalHeaderTitle>{title}</ModalHeaderTitle>
                    <ModalCloseIcon onClick={closeModal} />
                  </ModalHeader>
                  <ModalBody>{render({ close: closeModal })}</ModalBody>
                </InnerModalContainer>
              </ModalContainer>
            </>,
            portalEl.current
          )
        : null}
      <span onClick={() => setIsReady(true)}>{children}</span>
    </>
  );
};
