import { useMessages } from "next-intl";
import { createUiText, type UiMessages, type UiText } from "./core";
/** Call only for platform-owned display text, not merchant/user strings. */
export function useUiText(): UiText {
  return createUiText(useMessages() as UiMessages);
}
