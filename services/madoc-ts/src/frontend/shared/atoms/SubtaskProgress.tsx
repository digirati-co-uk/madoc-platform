import styled from 'styled-components';
import React from 'react';

const SubtaskProgressContainer = styled.div`
  width: 100%;
  margin: 0.5em;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  display: flex;
  overflow: hidden;
`;

const SubtaskProgressBar = styled.div`
  background: #feb240;
  height: 6px;
`;

const SubtaskProgressDoneBar = styled.div`
  background: #33a94b;
  height: 6px;
`;

export const SubtaskProgress: React.FC<{ total: number; done: number; progress: number }> = ({
  total,
  progress,
  done,
}) => {
  return (
    <SubtaskProgressContainer>
      <SubtaskProgressDoneBar style={{ width: `${(done / total) * 100}%` }} />
      <SubtaskProgressBar style={{ width: `${(progress / total) * 100}%` }} />
    </SubtaskProgressContainer>
  );
};
