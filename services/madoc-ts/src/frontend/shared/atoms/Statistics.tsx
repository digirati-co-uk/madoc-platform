import styled from 'styled-components';

export const StatisticLabel = styled.div`
  font-size: 0.9em;
`;

export const StatisticNumber = styled.div`
  font-size: 3em;
`;

export const Statistic = styled.div`
  margin: 1em;
  border-radius: 5px;
  background: #fff;
  text-align: center;
  border: 1px solid #4e82df;
  padding: 0.75em 2em;
  color: #333;
  
  &:hover {
    background-color: #4e82df;
    color: #fff;
  }
`;

export const StatisticContainer = styled.div`
  display: flex;
  margin: 0 auto;
  width: auto;
  align-items: center;
  justify-content: center;
  padding: 2em;
`;
