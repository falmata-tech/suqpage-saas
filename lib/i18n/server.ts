import { getMessages } from "next-intl/server";
import { createUiText, type UiMessages, type UiText } from "./core";
export async function getUiText(): Promise<UiText> {
  return createUiText(await getMessages() as UiMessages);
}
