import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/use-api';
import { useUser } from '../hooks/use-site';
import {
  RESOURCE_STATUS_COMPLETED,
  RESOURCE_STATUS_IN_PROGRESS,
  RESOURCE_STATUS_SUBMITTED,
} from '../../../utility/resource-status';

interface CanvasStatusProps {
  status: number;
  floating?: boolean;
}

const STATUS_BACKGROUND_CLASS = 'h-[10px] bg-[#ced8ea]';
const FLOATING_STATUS_BACKGROUND_CLASS =
  'absolute bottom-[10px] left-[10px] right-[10px] z-[3] h-[10px] rounded-[3px] bg-[#ced8ea] shadow-[0_1px_3px_rgb(0_0_0_/_30%)]';
const STATUS_ITEM_CLASSES: Record<number, string> = {
  [RESOURCE_STATUS_IN_PROGRESS]: 'w-[10%] bg-[#5b82d8]',
  [RESOURCE_STATUS_SUBMITTED]: 'w-[65%] bg-[#bf7b47]',
  [RESOURCE_STATUS_COMPLETED]: 'w-full bg-[#6da961]',
};

function getStatusItemClass(status: number) {
  return STATUS_ITEM_CLASSES[status] || '';
}

function getStatusTooltip(status: number, t: (key: string) => string) {
  switch (status) {
    case RESOURCE_STATUS_COMPLETED:
      return t('Completed');
    case RESOURCE_STATUS_SUBMITTED:
      return t('Submitted');
    case RESOURCE_STATUS_IN_PROGRESS:
      return t('In progress');
    default:
      return t('Available');
  }
}

export function CanvasStatus({ status, floating }: CanvasStatusProps) {
  const { t } = useTranslation();
  const api = useApi();
  const user = useUser();
  const statusItemClass = getStatusItemClass(status);

  if (!statusItemClass) {
    return null;
  }

  const tooltip = getStatusTooltip(status, t);
  const backgroundClass = floating ? FLOATING_STATUS_BACKGROUND_CLASS : STATUS_BACKGROUND_CLASS;

  return (
    <>
      <div className={backgroundClass}>
        <div
          className={`h-[10px] ${statusItemClass}`}
          data-tooltip-id={`status-${status}`}
          data-tooltip-content={tooltip}
        />
      </div>
      {api.getIsServer() || !user || user.site_role === 'viewer' || user.site_role === 'editor' ? null : (
        <ReactTooltip place="bottom" variant="dark" id={`status-${status}`} />
      )}
    </>
  );
}
