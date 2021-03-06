import { useTranslation } from 'react-i18next';
import { ItemStructureListItem } from '../../../types/schemas/item-structure-list';
import React from 'react';
import { HrefLink } from '../utility/href-link';
import { CroppedImage } from '../atoms/Images';
import { LocaleString } from './LocaleString';
import styled, { css } from 'styled-components';

const SnippetStructureContainer = styled.div<{ $alignment?: 'left' | 'right' }>`
  max-width: 200px;
  ${props =>
    props.$alignment === 'left' &&
    css`
      margin-right: auto;
    `}
  ${props =>
    props.$alignment === 'right' &&
    css`
      margin-left: auto;
    `}
`;

export const SnippetStructure: React.FC<{
  label?: string;
  link: string;
  hideLabel?: boolean;
  alignment?: 'left' | 'right';
  item: ItemStructureListItem;
}> = props => {
  const { t } = useTranslation();
  return (
    <SnippetStructureContainer $alignment={props.alignment}>
      <HrefLink href={props.link}>
        {props.item ? (
          <CroppedImage $size="small">
            <img alt={props.label ? props.label : t('Image thumbnail')} src={props.item.thumbnail} />
          </CroppedImage>
        ) : null}
        {props.hideLabel ? null : <>{props.label ? props.label : <LocaleString>{props.item.label}</LocaleString>}</>}
      </HrefLink>
    </SnippetStructureContainer>
  );
};
