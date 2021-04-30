import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const listJobs: RouteMiddleware = async context => {
  userWithScope(context, ['site.admin']);

  context.response.body = {
    jobs: context.cron.jobs.map(job => ({
      id: job.id,
      name: job.name,
      next: job.job.nextInvocation(),
    })),
  };
};

export const runJob: RouteMiddleware = async context => {
  userWithScope(context, ['site.admin']);

  context.cron.runJob(context.params.jobId);

  context.response.status = 200;
};
