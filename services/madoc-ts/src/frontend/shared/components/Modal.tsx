import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  InnerModalContainer,
  ModalBackground,
  ModalBody,
  ModalCloseIcon,
  ModalContainer,
  ModalFooter,
  ModalHeader,
  ModalHeaderTitle,
} from '../atoms/Modal';
import { createPortal } from 'react-dom';

export const ModalButton: React.FC<{
  title: string;
  button?: boolean;
  as?: any;
  onClose?: () => void;
  render: (opts: { close: () => void }) => JSX.Element | null;
  renderFooter?: (opts: { close: () => void }) => JSX.Element;
  className?: string;
  autoHeight?: boolean;
  footerAlignRight?: boolean;
  modalSize?: 'lg' | 'md' | 'sm';
  disabled?: boolean;
}> = ({
  as,
  className,
  disabled,
  button,
  title,
  render,
  renderFooter,
  onClose,
  modalSize,
  autoHeight,
  footerAlignRight,
  children,
}) => {
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

  const Component = as ? as : button ? 'button' : 'span';

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
                  closeModal();
                }}
              >
                <InnerModalContainer size={modalSize}>
                  <ModalHeader>
                    <ModalHeaderTitle>{title}</ModalHeaderTitle>
                    <ModalCloseIcon onClick={closeModal} />
                  </ModalHeader>
                  <ModalBody>{render({ close: closeModal })}</ModalBody>
                  {renderFooter ? (
                    <ModalFooter $footerAlignRight={footerAlignRight}>
                      {renderFooter({ close: closeModal })}
                    </ModalFooter>
                  ) : null}
                </InnerModalContainer>
              </ModalContainer>
            </>,
            portalEl.current
          )
        : null}
      <Component className={className} disabled={disabled} onClick={() => setIsReady(true)}>
        {children}
      </Component>
    </>
  );
};
