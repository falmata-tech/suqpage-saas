import serverMessageKeys from './server-message-keys.json';
import type {UiMessages} from './core';
const excluded = new Set(serverMessageKeys);
export function clientMessages(messages: UiMessages): UiMessages {
  return Object.fromEntries(Object.entries(messages).filter(([key]) => !excluded.has(key)));
}
