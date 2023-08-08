import React, { useCallback, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import styled, { css } from 'styled-components';
import { ModelTranslation } from '../../../utility/model-translation';
import { Tag } from '../../atoms/Tag';
import { useTranslation } from 'react-i18next';
import { useSelectorHelper } from '../../stores/selectors/selector-helper';
import { useCaptureModelVisualSettings } from '../CaptureModelVisualSettings/CaptureModelVisualSettings';

type FieldHeaderProps = {
  labelFor?: string;
  label: string;
  selectorLabel?: string;
  showTerm?: boolean;
  term?: string;
  description?: string;
  selectorId?: string;
  selectorComponent?: any;
  onSelectorClose?: () => void;
  onSelectorOpen?: () => void;
  required?: boolean;
};

const textSize = `0.875rem`;
const lineHeight = `1.35rem`;

export const FieldHeaderWrapper = styled.div`
  font-family: -apple-system, 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans',
    'Helvetica Neue', 'Icons16', sans-serif;
  font-size: ${textSize};
  line-height: ${lineHeight};
  margin: 0.3rem 0;
`;

const FieldHeaderTop = styled.div`
  display: flex;
`;

const FieldHeaderLeft = styled.div`
  flex: 1 1 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const FieldHeaderTitle = styled.label`
  letter-spacing: -0.25px;
  font-weight: 500;
  font-size: 1rem;
  margin-top: 0.5rem;
  .ui.tiny.label {
    margin-left: 0.5em;
  }
`;

export const FieldHelp = styled.div`
  display: inline-block;

  border-radius: 50%;
  width: 1.2em;
  height: 1.2em;
  line-height: 1.2em;
  font-size: 0.9em;
  margin-bottom: 0.2em;
  text-align: center;
  background: #eee;
  color: #555;
  margin-left: 0.5em;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  &:hover {
    background: #aaa7de;
    color: #fff;
  }
`;

export const FieldHelpInner = styled.div`
  white-space: pre-wrap;
`;

const FieldHeaderSubtitle = styled.label`
  letter-spacing: -0.25px;
  color: #555;
  font-size: ${textSize};
  line-height: ${lineHeight};
  padding-bottom: 0.3em;
  display: block;
`;

const FieldHeaderRight = styled.div`
  display: flex;
  flex-direction: column;
`;

const FieldHeaderIcon = styled.div<{ open?: boolean }>`
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-top: auto;
  background: transparent;
  color: #6041e2;
  transition: transform 0.5s, background-color 0.5s, color 0.5s;
  transform: translateY(0);
  &:hover {
    background: #eee;
  }

  &[data-is-required='true'] {
    :after {
      content: '*';
    }
  }
  &[data-is-invalid='true'] {
    color: #de1010;
  }
  ${props =>
    props.open
      ? css`
          color: #fff;
          background: #aaa7de;
          &:hover {
            background: #aaa7de;
          }
        `
      : ``}
`;

const FieldHeaderBottom = styled.div<{ open?: boolean }>`
  transition: max-height 0.3s;
  overflow: hidden;
  height: auto;
  ${props => (props.open ? `max-height: 500px;` : `max-height: 0;`)}
`;

const FieldHeaderBottomInner = styled.div`
  background: #aaa7de;
  color: #fff;
  padding: 0.7rem;
  margin-bottom: 0.5rem;
`;

export const FieldHeader: React.FC<FieldHeaderProps> = ({
  description,
  term,
  selectorComponent,
  showTerm,
  labelFor,
  label,
  onSelectorClose,
  onSelectorOpen,
  selectorLabel,
  selectorId,
  required,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const helper = useSelectorHelper();
  const settings = useCaptureModelVisualSettings();
  const isSelectorRequired = selectorComponent && selectorComponent.props?.required;
  const isSelectorValue = selectorComponent && selectorComponent.props.state;
  const isSelectorInvalid = isSelectorRequired && !isSelectorValue;

  const toggleSelector = useCallback(() => {
    if (open) {
      setOpen(false);
      if (onSelectorClose) {
        onSelectorClose();
      }
    } else {
      setOpen(true);
      if (onSelectorOpen) {
        onSelectorOpen();
      }
    }
  }, [onSelectorClose, onSelectorOpen, open]);

  return (
    <FieldHeaderWrapper>
      <FieldHeaderTop>
        <FieldHeaderLeft>
          <FieldHeaderTitle htmlFor={labelFor}>
            {label ? (
              <ModelTranslation>{label}</ModelTranslation>
            ) : (
              <span style={{ opacity: 0.5 }}>{t('Untitled')}</span>
            )}{' '}
            {showTerm && term ? <Tag size="tiny">{term}</Tag> : null}
            {required ? <span>*</span> : null}
            {description && settings.descriptionTooltip ? <FieldHelp data-tooltip-id={labelFor}>?</FieldHelp> : null}
          </FieldHeaderTitle>
          {description ? (
            settings.descriptionTooltip ? (
              <Tooltip id={labelFor}>
                <FieldHelpInner>
                  <ModelTranslation>{description}</ModelTranslation>
                </FieldHelpInner>
              </Tooltip>
            ) : (
              <FieldHeaderSubtitle htmlFor={labelFor}>
                <FieldHelpInner>
                  <ModelTranslation>{description}</ModelTranslation>
                </FieldHelpInner>
              </FieldHeaderSubtitle>
            )
          ) : null}
        </FieldHeaderLeft>
        {selectorComponent ? (
          <FieldHeaderRight
            onClick={toggleSelector}
            onMouseEnter={() => (selectorId ? helper.highlight(selectorId) : null)}
            onMouseLeave={() => (selectorId ? helper.clearHighlight(selectorId) : null)}
          >
            <FieldHeaderIcon data-is-required={isSelectorRequired} data-is-invalid={isSelectorInvalid} open={open}>
              {selectorLabel || t('Define region')}
            </FieldHeaderIcon>
          </FieldHeaderRight>
        ) : null}
      </FieldHeaderTop>
      {selectorComponent ? (
        <FieldHeaderBottom open={open}>
          <FieldHeaderBottomInner>{selectorComponent ? selectorComponent : null}</FieldHeaderBottomInner>
        </FieldHeaderBottom>
      ) : null}
    </FieldHeaderWrapper>
  );
};
