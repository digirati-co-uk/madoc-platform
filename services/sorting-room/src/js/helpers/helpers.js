export const hasPropertyChanged = (propertyName, state, lastState) => {
  // console.log('hasPropertyChanged', propertyName);
  // First time this state has been looked at
  if (state === null || state === lastState) return false;
  if (lastState === null && state[propertyName] !== null) return true;
  else if (lastState !== null && state[propertyName] !== null &&
    state[propertyName] !== lastState[propertyName]) return true;
  return false;
};

export const hasPropertyChangedNonZero = (propertyName, state, lastState) => {
  // First time this state has been looked at
  if (state === null || state === lastState) return false;
  if (lastState === null && state[propertyName] !== null && state[propertyName].length) return true;
  else if (lastState !== null && state[propertyName] !== null && state[propertyName].length &&
    state[propertyName] !== lastState[propertyName]) return true;
  return false;
};
