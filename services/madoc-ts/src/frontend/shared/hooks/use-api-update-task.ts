// import { useMutation } from 'react-query';
// import { useNavigate } from 'react-router-dom';
// import { useApi } from '../../shared/hooks/use-api';
// import { useManifestTask } from './use-manifest-task';
// import { useRelativeLinks } from './use-relative-links';
// import { useRouteContext } from './use-route-context';
// import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
//
// export function useApiUpdateTask() {
//   // update task
//   const { refetch } = useManifestTask();
//
//   const api = useApi();
//   const navigate = useNavigate();
//
//   //get capture model
//
//   // Mutations.
//   const [getCaptureModel, captureModel] = useMutation(async () => {
//     if (captureModelId) {
//       return await api.crowdsourcing.getCaptureModel(captureModelId);
//     }
//   });
//
//   const [updateTask, response] = useMutation(async (uid: string | undefined, task: Partial<CrowdsourcingTask>) => {
//     return api.updateTask<CrowdsourcingTask>(uid, task);
//   });
//
//   return {
//     getCaptureModel,
//     captureModel,
//     updateTask,
//     response,
//   };
// }
