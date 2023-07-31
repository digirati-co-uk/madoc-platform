import { useTranslation } from 'react-i18next';
import { useRecentUserTasks } from '../../../shared/hooks/use-recent-user-tasks';
import { ContinueSubmission } from '../../components/ContinueSubmission';

export function ProjectContinueSubmissions() {
  const { t } = useTranslation();
  const recentTasks = useRecentUserTasks(2, true);

  if (!recentTasks || !recentTasks.length) {
    return null;
  }

  return (
    <div className="my-5">
      <h3 className="text-xl font-semibold mb-4">{t('Continue where you left off')}</h3>
      <div className="grid grid-cols-2 gap-4">
        {recentTasks.map((task, idx) => (
          <ContinueSubmission key={idx} task={task.task} next={task.next} />
        ))}
      </div>
    </div>
  );
}
