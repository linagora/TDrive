import * as cron from "node-cron";
import uuid from "node-uuid";

import { TdriveService } from "../../framework";
import { CronAPI, CronJob, CronExpression, CronTask } from "./api";

export default class CronService extends TdriveService<CronAPI> implements CronAPI {
  name = "cron";
  version = "1";
  private tasks = new Array<CronTask>();

  api(): CronAPI {
    return this;
  }

  schedule(expression: CronExpression, job: CronJob, description?: string): CronTask {
    this.logger.debug(`Submit new job with name ${description}`);
    const task: CronTask = {
      id: uuid.v4(),
      description: description || "",
      startDate: Date.now(),
      lastRun: 0,
      nbErrors: 0,
      nbRuns: 0,
      task: cron.schedule(expression, () => {
        task.lastRun = Date.now();
        task.nbRuns++;
        this.logger.debug(`Running job ${description || "untitled"}`);
        try {
          job();
        } catch (err) {
          this.logger.error("Error while running job", err);
          task.nbErrors++;
          task.lastError = err;
        }
      }),
      stop: () => {
        task.task.stop();
      },
      start: () => {
        task.task.start();
      },
    };

    this.tasks.push(task);

    return task;
  }

  getTasks(): CronTask[] {
    return this.tasks;
  }
}
