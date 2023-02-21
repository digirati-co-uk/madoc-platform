import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  height: 1.4em;
  display: flex;
  flex-direction: row;
  background: #eee;
  margin: 10px 0;
  border-radius: 3px;
  overflow: hidden;
`;

const Bar = styled.div`
  height: 30px;
  transition: width 0.5s;
  background: #eee;
`;
export function RootStatistics(
  props: Partial<{
    error: number;
    not_started: number;
    accepted: number;
    progress: number;
    done: number;
  }>
) {
  const totals = Object.entries(props || {}).reduce((acc, [, value]) => acc + (value || 0), 0);
  return (
    <Container>
      {props?.error ? (
        <Bar
          style={{
            background: 'red',
            width: `${(props?.error / (totals || 1)) * 100}%`,
          }}
        />
      ) : null}
      {props?.done ? (
        <Bar
          style={{
            background: 'green',
            width: `${(props?.done / (totals || 1)) * 100}%`,
          }}
        />
      ) : null}
      {props?.accepted ? (
        <Bar
          style={{
            background: 'orange',
            width: `${(props?.accepted / (totals || 1)) * 100}%`,
          }}
        />
      ) : null}
      {props?.progress ? (
        <Bar
          style={{
            background: 'yellow',
            width: `${(props?.progress / (totals || 1)) * 100}%`,
          }}
        />
      ) : null}
      {props?.not_started ? (
        <Bar
          style={{
            background: '#eee',
            width: `${(props?.not_started / (totals || 1)) * 100}%`,
          }}
        />
      ) : null}
    </Container>
  );
}
