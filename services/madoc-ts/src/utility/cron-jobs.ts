import { Job } from 'node-schedule';

export class CronJobs {
  jobs: Job[] = [];

  addJob(job: Job) {
    this.jobs.push(job);

    return this;
  }

  cancelAllJobs() {
    for (const job of this.jobs) {
      job.cancel();
    }
  }

  runAllJobs() {
    for (const job of this.jobs) {
      job.invoke();
    }
  }
}
