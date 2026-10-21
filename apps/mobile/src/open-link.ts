import { Linking, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { followLink } from "./link-policy";
import { PUBLIC_ORIGIN } from "./public-origin";

export function openLink(url: string): Promise<void> {
  return followLink(url, {
    native: Platform.OS !== "web",
    appOrigin: PUBLIC_ORIGIN,
    openHandler: destination => Linking.openURL(destination),
    openWebsite: destination => WebBrowser.openBrowserAsync(destination, {
      toolbarColor: "#ffffff",
      controlsColor: "#c43a00",
      dismissButtonStyle: "close",
      showTitle: true,
      enableBarCollapsing: false,
      createTask: false,
      showInRecents: false,
      windowName: "_blank",
      windowFeatures: { noopener: true, noreferrer: true },
    }),
  });
}
