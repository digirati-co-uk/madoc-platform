export type CanvasMenuHook = {
  id: string;
  label: string;
  isLoaded: boolean;
  icon: React.ReactNode;
  content: React.ReactNode;
  isHidden?: boolean;
  isDisabled?: boolean;
  notifications?: number;
};
