import { Job } from 'node-schedule';
import { RequestError } from './errors/request-error';

export class CronJobs {
  jobs: Array<{ id: string; name: string; job: Job }> = [];

  addJob(id: string, name: string, job: Job) {
    this.jobs.push({ id, name, job });

    return this;
  }

  cancelAllJobs() {
    for (const job of this.jobs) {
      job.job.cancel();
    }
  }

  runAllJobs() {
    for (const job of this.jobs) {
      job.job.invoke();
    }
  }

  runJob(id: string) {
    const job = this.jobs.find(j => j.id === id);

    if (!job) {
      throw new RequestError('Invalid job');
    }

    job.job.invoke();
  }
}
