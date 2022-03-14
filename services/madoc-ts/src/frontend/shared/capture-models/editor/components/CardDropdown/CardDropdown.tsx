import React, { useState } from 'react';
import { RoundedCard, RoundedCardProps } from '../RoundedCard/RoundedCard';
import styled from 'styled-components';

type CardDropdownProps = RoundedCardProps & {
  openInitially?: boolean;
  cards: Array<RoundedCardProps>;
  hideCount?: boolean;
};

const CardDropdownContainer = styled.div``;

const CardListWrapper = styled.div<{ isOpen: boolean }>`
  padding: 0 1em;
  max-height: ${props => (props.isOpen ? '500px' : '0')};
  transition: max-height 0.3s;
  overflow: hidden;
  margin-top: -1em;
`;

export const CardDropdown: React.FC<CardDropdownProps> = ({
  cards,
  hideCount,
  onClick,
  openInitially = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(openInitially);
  return (
    <CardDropdownContainer>
      <RoundedCard
        count={hideCount ? undefined : cards.length}
        onClick={() => {
          setIsOpen(o => !o);
          if (onClick) {
            onClick();
          }
        }}
        {...props}
      />
      <CardListWrapper isOpen={isOpen}>
        {cards.map((card, key) => (
          <RoundedCard size="small" key={key} {...card} />
        ))}
      </CardListWrapper>
    </CardDropdownContainer>
  );
};
