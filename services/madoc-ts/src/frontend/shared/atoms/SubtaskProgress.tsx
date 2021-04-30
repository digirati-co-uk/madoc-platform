import styled from 'styled-components';
import React from 'react';
import { TickIcon } from './TickIcon';
import { useTranslation } from 'react-i18next';
import ReactTooltip from 'react-tooltip';

const SubtaskProgressContainer = styled.div`
  margin: 0.5em;
  height: 1em;
  background: #ddd;
  border-radius: 0.5em;
  display: flex;
  overflow: hidden;
`;

const SubtaskProgressBar = styled.div`
  background: #feb240;
  height: 1em;
  cursor: pointer;
`;

const SubtaskProgressDoneBar = styled.div`
  background: #33a94b;
  height: 1em;
  cursor: pointer;
`;

const AllDone = styled.div`
  position: relative;
  font-size: 0.9em;
  background: #87d496;
  border: 1px solid #33a94b;
  padding: 0.5em 1em 0.5em 3em;
  color: #165823;
`;

const WhiteTick = styled(TickIcon)`
  position: absolute;
  left: 1em;
  top: 0.45em;
  polygon {
    fill: #165823;
  }
`;

export const SubtaskProgress: React.FC<{ total: number; done: number; progress: number; tooltip?: boolean }> = ({
  total,
  progress,
  done,
  tooltip = true,
}) => {
  const { t } = useTranslation();

  if (total === 0) {
    return null;
  }

  if (total === done) {
    return (
      <AllDone>
        <WhiteTick />
        {t('All sub-tasks have been completed.')}
      </AllDone>
    );
  }

  return (
    <SubtaskProgressContainer>
      <SubtaskProgressDoneBar
        data-tip={`${((done / total) * 100).toFixed(2)}% done`}
        style={{ width: `${(done / total) * 100}%` }}
      />
      <SubtaskProgressBar
        data-tip={`${((progress / total) * 100).toFixed(2)}% in progress`}
        style={{ width: `${(progress / total) * 100}%` }}
      />
      {tooltip ? <ReactTooltip place="bottom" type="dark" effect="solid" /> : null}
    </SubtaskProgressContainer>
  );
};
