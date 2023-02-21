import { InternationalString } from '@iiif/presentation-3';
import React from 'react';
import styled from 'styled-components';
import { LocaleString } from './LocaleString';

export interface RichSelectionGridProps {
  items: Array<{
    id: string;
    label: InternationalString;
    description?: InternationalString;
  }>;
  selected: string[];
  onSelect: (id: string) => void;
}

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  justify-content: space-between;
  background-color: inherit;
  grid-gap: 0.875em;
  width: 100%;
  flex-wrap: wrap;
  margin-bottom: 1em;
`;

const Title = styled.div`
  font-size: 1.2em;
  text-align: center;
  margin-bottom: 1em;
`;

const Description = styled.div`
  color: #999;
  font-size: 0.875em;
  text-align: center;
`;

const Item = styled.div`
  background: #fff;
  padding: 1.8em;
  border-radius: 5px;
  border: 2px solid #eee;
  cursor: pointer;

  &:hover {
    border-color: #ccc;
  }

  &[data-selected='true'] {
    background: #f5f5ff;
    border-color: #454aff;

    &:hover {
      border-color: #6c84fa;
    }

    ${Description} {
      color: #6f78b9;
    }
  }
`;

const EmptyItem = styled.div`
  background: transparent;
`;

export function RichSelectionGrid(props: RichSelectionGridProps) {
  return (
    <Container>
      {props.items.map(item => (
        <Item
          key={item.id}
          data-selected={props.selected.indexOf(item.id) !== -1}
          onClick={() => props.onSelect(item.id)}
        >
          <LocaleString as={Title}>{item.label}</LocaleString>
          <LocaleString as={Description}>{item.description || { none: [''] }}</LocaleString>
        </Item>
      ))}
      {props.items.length < 5 ? (
        <>
          <EmptyItem />
          <EmptyItem />
          <EmptyItem />
          <EmptyItem />
          <EmptyItem />
        </>
      ) : null}
    </Container>
  );
}
