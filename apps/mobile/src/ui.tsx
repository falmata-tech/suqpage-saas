import { storefrontAccent } from "../../../lib/storefront-accent";
import React from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  type TextInputProps,
  Alert,
  type TextProps,
} from "react-native";
import { openLink } from "./open-link";
import { descriptionLinks } from "./link-policy";
export { openLink } from "./open-link";
import Svg, { Path } from "react-native-svg";
import { useApp, mediaUrl, API } from "./runtime";
export const colors = {
  ink: "#22282b",
  muted: "#63737a",
  brand: "#c43a00",
  soft: "#fff1e9",
  line: "#dbe2e3",
  background: "#f7f9f8",
  white: "#fff",
};
export function Icon({
  name,
  size = 22,
  color = colors.ink,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const paths: Record<string, string> = {
    back: "m15 5-7 7 7 7 M8 12h13",
    down: "m5 9 7 7 7-7",
    menu: "M4 5h16 M4 12h16 M4 19h16",
    grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    pin: "M12 22s8-8 8-13a8 8 0 1 0-16 0c0 5 8 13 8 13 M15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
    panel: "M3 3h18v18H3z M8 3v18 M12 9l3 3-3 3",
    minus: "M4 12h16",
    target:
      "M12 2v4 M12 18v4 M2 12h4 M18 12h4 M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    play: "m9 5 11 7-11 7V5",
    pause: "M8 5v14 M16 5v14",
    search: "m21 21-5-5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
    map: "m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6 M9 3v15 M15 6v15",
    star: "m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6",
    user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 22v-3a8 8 0 0 1 16 0v3",
    info: "M12 11v6 M12 7v1 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    chat: "M21 11a9 9 0 0 1-9 9H3l2-4a9 9 0 1 1 16-5",
    arrow: "m8 4 8 8-8 8",
    check: "m4 12 5 5L20 5",
    plus: "M12 4v16 M4 12h16",
    close: "m5 5 14 14 M19 5 5 19",
    shop: "M4 9v12h16V9 M2 9l3-7h14l3 7H2 M9 21v-8h6v8",
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={paths[name] || paths.arrow}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
export function Brand() {
  return (
    <View style={[s.row, { gap: 4 }]}>
      <Image
        source={require("../assets/icon.png")}
        style={{ width: 28, height: 32 }}
      />
      <Text
        style={{
          fontWeight: "900",
          fontSize: 22,
          color: colors.ink,
          letterSpacing: -0.7,
          fontFamily: Platform.select({
            ios: "Helvetica Neue",
            android: "sans-serif",
            web: "Arial",
          }),
        }}
      >
        suq<Text style={{ color: colors.brand }}>page</Text>
      </Text>
    </View>
  );
}
export function Copy({
  children,
  muted = false,
  big = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
  big?: boolean;
}) {
  return (
    <Text
      style={{
        color: muted ? colors.muted : colors.ink,
        fontSize: big ? 24 : 16,
        fontWeight: big ? "700" : "400",
        lineHeight: big ? 31 : 24,
      }}
    >
      {children}
    </Text>
  );
}
export function Button({
  accentColor,
  label,
  onPress,
  secondary = false,
  disabled = false,
  icon,
}: {
  accentColor?: string;
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: string;
}) {
  const accent = storefrontAccent(accentColor);
  const textColor = accent ? secondary ? accent.ink : accent.on : secondary ? colors.ink : "white";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary ? s.secondary : null,
        accent ? { backgroundColor: secondary ? "white" : accent.accent, borderColor: accent.edge, borderWidth: 1 } : null,
        { opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
      ]}
    >
      {icon && <Icon name={icon} color={textColor} />}
      <Text style={[s.buttonText, { color: textColor }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Chip({
  label,
  onPress,
  selected = false,
}: {
  label: string;
  onPress: () => void;
  selected?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        s.chip,
        selected && { backgroundColor: colors.soft, borderColor: colors.brand },
      ]}
    >
      <Text
        style={{
          color: selected ? colors.brand : colors.ink,
          fontWeight: selected ? "700" : "500",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontWeight: "600", color: colors.ink, fontSize: 14 }}>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[
          s.input,
          props.multiline && { minHeight: 105, textAlignVertical: "top" },
        ]}
        {...props}
      />
    </View>
  );
}
export function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <KeyboardAvoidingView
      style={s.fill}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.screen}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </KeyboardAvoidingView>
  );
}
export function Card({ children }: { children: React.ReactNode }) {
  return <View style={s.card}>{children}</View>;
}
export function Status({
  loading,
  error,
  retry,
}: {
  loading?: boolean;
  error?: string;
  retry?: () => void;
}) {
  const { t } = useApp();
  if (loading)
    return (
      <ActivityIndicator
        accessibilityLabel={t("Loading")}
        color={colors.brand}
        style={{ padding: 30 }}
      />
    );
  return error ? (
    <Card>
      <Text accessibilityRole="alert" style={{ color: "#992d11" }}>
        {t(error)}
      </Text>
      {retry && <Button label={t("Try again")} onPress={retry} secondary />}
    </Card>
  ) : null;
}
export function Photo({
  refPath,
  height = 180,
  privateImage = false,
}: {
  refPath: string;
  height?: number;
  privateImage?: boolean;
}) {
  const { session } = useApp();
  const privateRef =
    privateImage &&
    (refPath.startsWith("/api/page-drafts/") ||
      refPath.startsWith("/media/product-private-"));
  const [source, setSource] = React.useState<string | null>(null);
  React.useEffect(() => {
    let active = true;
    let blob: string | undefined;
    setSource(null);
    if (privateRef && Platform.OS === "web" && session)
      fetch(
        `${API}/api/mobile/v1/owner/media?ref=${encodeURIComponent(refPath)}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      )
        .then((r) => (r.ok ? r.blob() : Promise.reject()))
        .then((b) => {
          blob = URL.createObjectURL(b);
          if (active) setSource(blob);
          else URL.revokeObjectURL(blob);
        })
        .catch(() => {});
    return () => {
      active = false;
      if (blob) URL.revokeObjectURL(blob);
    };
  }, [refPath, privateRef, session?.access_token]);
  if (!refPath || (privateRef && Platform.OS === "web" && !source))
    return (
      <View
        style={{
          height,
          backgroundColor: colors.soft,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="shop" size={40} />
      </View>
    );
  return (
    <Image
      accessibilityIgnoresInvertColors
      source={{
        uri:
          source ||
          (privateRef
            ? `${API}/api/mobile/v1/owner/media?ref=${encodeURIComponent(refPath)}`
            : mediaUrl(refPath)),
        ...(privateRef && session
          ? { headers: { Authorization: `Bearer ${session.access_token}` } }
          : {}),
      }}
      style={{
        height,
        width: "100%",
        borderRadius: 6,
        backgroundColor: colors.line,
      }}
      resizeMode="cover"
    />
  );
}
/** Safe default for taps without a screen-specific error handler. */
export function useOpenLink() {
  const { t } = useApp();
  return async (url: string) => {
    try { await openLink(url); return true; }
    catch {
      if (Platform.OS === "web") globalThis.alert(t("Could not open link"));
      else Alert.alert(t("Could not open link"), t("Try again"), [{ text: t("Close") }]);
      return false;
    }
  };
}
export function LinkedText({ children, style, ...props }: Omit<TextProps, "children"> & { children: string }) {
  const open = useOpenLink();
  return <Text {...props} style={[{ fontSize: 16, lineHeight: 24, color: colors.ink }, style]}>
    {descriptionLinks(children).map((part, index) => part.url
      ? <Text key={index} accessibilityRole="link" onPress={() => void open(part.url!)} style={{ color: colors.brand, textDecorationLine: "underline" }}>{part.text}</Text>
      : part.text)}
  </Text>;
}
export const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  screen: {
    padding: 18,
    gap: 18,
    paddingBottom: 36,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    padding: 16,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    gap: 12,
  },
  button: {
    minHeight: 48,
    backgroundColor: colors.brand,
    borderRadius: 7,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.line,
  },
  buttonText: { fontSize: 15, fontWeight: "700", textAlign: "center" },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 15,
    minHeight: 42,
    justifyContent: "center",
    backgroundColor: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#bac8cb",
    borderRadius: 10,
    padding: 12,
    minHeight: 48,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: "white",
  },
  link: { color: colors.brand, fontSize: 16, fontWeight: "600" },
});
