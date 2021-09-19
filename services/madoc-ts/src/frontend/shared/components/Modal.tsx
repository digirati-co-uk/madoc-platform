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
  ModalResizeIcon,
} from '../layout/Modal';
import { createPortal } from 'react-dom';

export const ModalButton: React.FC<{
  ref?: any;
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
  openByDefault?: boolean;
  style?: any;

  onKeyDown?: (e: React.KeyboardEvent<HTMLAnchorElement>) => void;
  tabIndex?: number;
  role?: string;
  $disabled?: boolean;
}> = React.forwardRef(function ModalButton(
  {
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
    openByDefault = false,
    style,
    onKeyDown,
    tabIndex,
    role,
  },
  ref
) {
  const portalEl = useRef<HTMLElement>();
  const [ready, setIsReady] = useState(false);
  const [expanded, setIsExpanded] = useState(false);
  const containerRef = useRef<any>();

  useLayoutEffect(() => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    portalEl.current = element;

    if (openByDefault) {
      setIsReady(true);
    }

    return () => {
      portalEl.current = undefined;
      document.body.removeChild(element);
    };
  }, []);

  const closeModal = () => {
    setIsReady(false);
    setIsExpanded(false);
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
                <InnerModalContainer $expanded={expanded} size={modalSize} data-cy="modal">
                  <ModalHeader>
                    <ModalHeaderTitle>{title}</ModalHeaderTitle>
                    <ModalResizeIcon onClick={() => setIsExpanded(e => !e)} />
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
      <Component
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        role={role}
        ref={ref}
        className={className}
        disabled={disabled}
        onClick={() => setIsReady(true)}
        style={style}
      >
        {children}
      </Component>
    </>
  );
});
