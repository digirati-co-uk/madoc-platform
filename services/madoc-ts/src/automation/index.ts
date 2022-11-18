import { ApiClient } from '../gateway/api';
import { BaseTask } from '../gateway/tasks/base-task';
import { siteBots } from './bot-definitions';
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

  const allBots = await api.asUser({ siteId, userId }).getAutomatedUsers();
  const user = allBots.users.find(u => u.id === userId);
  if (!user) {
    return;
  }

  // @todo add in configuration check to make sure this bot is the correct type.
  //   For now ALL automated user will be ALL bots in the list above.
  const botData = siteBots.find(t => t.type === user.config?.bot?.type);
  if (botData) {
    for (const Bot of bots) {
      if (Bot.type === botData.type) {
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
  }
}
