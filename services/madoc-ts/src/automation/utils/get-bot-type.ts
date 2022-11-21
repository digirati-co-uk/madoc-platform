import { siteBots } from '../bot-definitions';

export function getBotType(type?: string) {
  return type ? siteBots.find(t => t.type === type)?.metadata.label : '';
}
