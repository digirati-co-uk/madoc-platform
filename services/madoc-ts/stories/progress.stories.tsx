import * as React from 'react';
import { SubtaskProgress } from '../src/frontend/shared/atoms/SubtaskProgress';

export default { title: 'Progress bar' };

export const example = () => {
  return <SubtaskProgress total={100} done={34} progress={20} />;
};

export const notStarted = () => {
  return <SubtaskProgress total={100} done={0} progress={0} />;
};

export const onlyProgress = () => {
  return <SubtaskProgress total={100} done={0} progress={20} />;
};

export const allDone = () => {
  return <SubtaskProgress total={100} done={100} progress={0} />;
};
