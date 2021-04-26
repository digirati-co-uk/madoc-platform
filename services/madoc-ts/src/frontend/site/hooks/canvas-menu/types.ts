export type CanvasMenuHook = {
  id: string;
  label: string;
  isLoaded: boolean;
  icon: JSX.Element;
  content: JSX.Element;
  isHidden?: boolean;
  isDisabled?: boolean;
  notifications?: number;
};
