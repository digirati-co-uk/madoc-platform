import { ApiClient } from '../gateway/api';
import { BaseTask } from '../gateway/tasks/base-task';
import { AutomaticReviewBot } from './bots/AutomaticReviewBot';

export const bots = [AutomaticReviewBot];

export async function execBot(
  userId: number,
  // @todo this should be required.
  siteId: number | undefined,
  api: ApiClient,
  task: BaseTask,
  event: string
) {
  const { user } = await api.getUser(userId);
  if (!user.automated) {
    return;
  }

  // @todo add in configuration check to make sure this bot is the correct type.
  //   For now ALL automated user will be ALL bots in the list above.

  for (const Bot of bots) {
    const tasks = Bot.getTaskEvents();
    const events = tasks[task.type] || [];
    if (events.indexOf(event) !== -1) {
      // @todo this might be better is the API actually used a signed JWT
      const botApi = api.asUser({ userId: user.id, userName: user.name, siteId }, {}, true);
      const bot = new Bot(user, botApi);
      await bot.handleTaskEvent(task as any, event);
    }
  }
}
