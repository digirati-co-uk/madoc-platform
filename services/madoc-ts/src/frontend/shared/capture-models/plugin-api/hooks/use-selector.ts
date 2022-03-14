import { BaseSelector, InjectedSelectorProps } from '../../types/selector-types';
import { useSelectors } from './use-selectors';

export function useSelector<T extends BaseSelector>(
  selectorProps: T | undefined,
  contentType: string,
  customOptions: {
    updateSelector?: any;
    selectorPreview?: any;
    updateSelectorPreview?: (value: any) => void;
    readOnly?: boolean;
    defaultState?: any;
    isTopLevel?: boolean;
    isAdjacent?: boolean;
    onClick?: (selector: T & InjectedSelectorProps<T['state']>) => void;
    hidden?: boolean;
  }
) {
  const selectors = useSelectors(selectorProps ? [selectorProps] : [], contentType, customOptions);

  if (!selectors.length) {
    return null;
  }

  return selectors[0];
}
