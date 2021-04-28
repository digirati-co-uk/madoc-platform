import { useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { useApi } from '../../shared/hooks/use-api';

export function useIndexResource(id: number, type: string, totalItems = 0, after?: (task?: BaseTask) => Promise<void>) {
  const [percent, setPercent] = useState(0);
  const totalCanvases = totalItems;

  const api = useApi();
  const [indexContext, { isLoading }] = useMutation(async () => {
    await api.wrapTask(
      api.batchIndexResources([{ id: Number(id), type }], { recursive: true }),
      async task => {
        if (after) {
          await after(task);
        }
        return task;
      },
      {
        progress: remaining => {
          if (totalCanvases) {
            setPercent(Math.floor(((totalCanvases - remaining) / totalCanvases) * 100));
          }
        },
      }
    );
  });

  return [indexContext, { isLoading, percent }] as const;
}

export function useIndexResources(
  resources: Array<{ id: number; type?: string }>,
  after?: (task?: BaseTask) => Promise<void>
) {
  const [percent, setPercent] = useState(0);
  const total = useRef(0);
  const filtered = resources.filter(r => r.type === 'manifest');

  const api = useApi();
  const [indexContext, { isLoading }] = useMutation(async () => {
    total.current = 0;
    await api.wrapTask(
      api.batchIndexResources(filtered as any, { recursive: true }),
      async task => {
        if (after) {
          await after(task);
        }
        return task;
      },
      {
        progress: remaining => {
          if (!total.current) {
            total.current = remaining;
          }
          if (total.current) {
            setPercent(Math.floor(((total.current - remaining) / total.current) * 100));
          }
        },
      }
    );
  });

  return [indexContext, { isLoading, percent }] as const;
}
