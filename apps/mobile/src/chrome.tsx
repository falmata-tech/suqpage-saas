import React, { useState, useEffect } from "react";
import {registerOverlay} from './overlay-visibility';
import {useTransportUnread} from './use-transport-unread';
import {TRANSPORT_COPY} from "../../../lib/i18n/transport-copy";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { SvgXml } from "react-native-svg";
import { useApp, languageNames, locales, API } from "./runtime";
import { Brand, Icon, colors, useOpenLink } from "./ui";
import { categoryArt } from "./category-art";
export function CategoryArt({
  name,
  size = 32,
}: {
  name: string;
  size?: number;
}) {
  return (
    <SvgXml
      xml={categoryArt[name] || categoryArt.grid}
      width={size}
      height={size}
    />
  );
}
export function IconButton({
  label,
  icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[c.iconButton, disabled && { opacity: 0.35 }]}
    >
      <Icon name={icon} />
    </Pressable>
  );
}
export function Sheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useApp();
  // A hidden sheet must release its portal/focus boundary, including on web.
  useEffect(()=>{if(visible)return registerOverlay();},[visible]);
  if (!visible) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={c.backdrop}>
        <Pressable
          accessibilityLabel={t("Close")}
          accessibilityRole="button"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          accessibilityViewIsModal
          style={[
            c.sheet,
            { paddingBottom: Math.max(20, insets.bottom), paddingTop: 14 },
          ]}
        >
          <View style={c.sheetHeading}>
            <Text style={c.title}>{title}</Text>
            <IconButton label={t("Close")} icon="close" onPress={onClose} />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 12 }}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
export function LanguageOptions() {
  const { locale, setLocale } = useApp();
  return (
    <View style={{ gap: 4 }}>
      {locales.map((l) => (
        <Pressable
          key={l}
          accessibilityRole="radio"
          accessibilityState={{ checked: locale === l }}
          onPress={() => setLocale(l)}
          style={c.menuRow}
        >
          <Text style={c.menuText}>{languageNames[l]}</Text>
          {locale === l && <Icon name="check" color={colors.brand} />}
        </Pressable>
      ))}
    </View>
  );
}
export function AppHeader({ back = false }: { back?: boolean }) {
  const { t, locale } = useApp();
  const [language, setLanguage] = useState(false);
  const { top } = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: top, backgroundColor: "white" }}>
      <View style={c.header}>
        {back && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("Back")}
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
            style={{ padding: 8 }}
          >
            <Icon name="back" size={21} />
          </Pressable>
        )}
        <Brand />
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("Language")}
          onPress={() => setLanguage(true)}
          style={c.language}
        >
          <Text numberOfLines={1} style={{ fontSize: 12, color: colors.ink }}>
            {languageNames[locale]}
          </Text>
          <Icon name="down" size={15} />
        </Pressable>
      </View>
      <Sheet
        visible={language}
        title={t("Language")}
        onClose={() => setLanguage(false)}
      >
        <LanguageOptions />
      </Sheet>
    </View>
  );
}
export function MoreSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { t, session } = useApp();
  const openLink = useOpenLink();
  return (
    <Sheet visible={visible} title={t("More")} onClose={onClose}>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          onClose();
          router.navigate("/account");
        }}
        style={c.menuRow}
      >
        <Icon name="user" />
        <Text style={[c.menuText, { flex: 1 }]}>
          {t(session ? "Dashboard" : "Sign in")}
        </Text>
        <Icon name="arrow" size={18} />
      </Pressable>
      <Text style={c.sectionLabel}>{t("Language")}</Text>
      <LanguageOptions />
      <Text style={c.sectionLabel}>{t("Information")}</Text>
      {[
        ["Privacy", "/privacy"],
        ["Terms", "/terms"],
      ].map(([label, path]) => (
        <Pressable
          key={path}
          accessibilityRole="link"
          onPress={() => void openLink(API + path)}
          style={c.menuRow}
        >
          <Text style={c.menuText}>{t(label)}</Text>
          <Icon name="arrow" size={18} />
        </Pressable>
      ))}
    </Sheet>
  );
}
export function BuyingLauncher({ compact = false }: { compact?: boolean }) {
  const { t } = useApp();
  const unread=useTransportUnread();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t(TRANSPORT_COPY.launcherTitle)} ${t(TRANSPORT_COPY.launcherSubtitle)}`}
      onPress={() => router.push("/buying")}
      style={[c.buying, compact && { padding: 12 }]}
    >
      <Icon name="chat" color="white" size={22} />
      {unread>0&&<Text accessibilityElementsHidden style={{position:'absolute',right:4,top:3,backgroundColor:'white',color:colors.brand,borderRadius:12,minWidth:20,paddingHorizontal:5,fontSize:12,fontWeight:'700',textAlign:'center'}}>{unread>99?'99+':unread}</Text>}
      {!compact && (
        <View style={{ flexShrink: 1, minWidth: 0, gap: 2 }}>
          <Text style={c.buyingText}>{t(TRANSPORT_COPY.launcherTitle)}</Text>
          <Text style={c.buyingSmall}>{t(TRANSPORT_COPY.launcherSubtitle)}</Text>
        </View>
      )}
    </Pressable>
  );
}
export const c = StyleSheet.create({
  header: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  language: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    maxWidth: 126,
    minHeight: 40,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 7,
    backgroundColor: "white",
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#13232d70",
  },
  sheet: {
    backgroundColor: "white",
    maxHeight: "85%",
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    gap: 12,
  },
  sheetHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.ink },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "space-between",
    minHeight: 48,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  menuText: { fontSize: 16, color: colors.ink },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
    marginTop: 12,
  },
  buying: {
    maxWidth: 280,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.brand,
    borderRadius: 7,
    padding: 11,
    boxShadow: "0 3px 12px #0002",
  },
  buyingText: { fontSize: 13, fontWeight: "700", color: "white" },
  buyingSmall: { fontSize: 11, fontWeight: "500", color: "white" },
});

export function OwnerNavigation({ active = "overview" }: { active?: string }) {
  const { t, signOut } = useApp(),
    { bottom } = useSafeAreaInsets();
  const [more, setMore] = useState(false);
  function go(screen: string) {
    setMore(false);
    if (screen === "overview") router.navigate("/account");
    else router.navigate({ pathname: "/owner/[section]", params: { section: screen } });
  }
  return (
    <>
      <View
        style={{
          paddingBottom: bottom,
          flexDirection: "row",
          borderTopWidth: 1,
          borderColor: colors.line,
          backgroundColor: "white",
        }}
      >
        {[
          ["overview", "Profile", "user"],
          ["products", "Items", "menu"],
          ["support", "Support", "chat"],
          ["inquiries", "Inquiries", "chat"],
          ["more", "More", "user"],
        ].map(([screen, label, icon]) => (
          <Pressable
            key={screen}
            accessibilityRole="tab"
            accessibilityLabel={t(label)}
            accessibilityState={{ selected: active === screen }}
            onPress={() => (screen === "more" ? setMore(true) : go(screen))}
            style={{
              flex: 1,
              minHeight: 60,
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              borderTopWidth: 3,
              borderColor: active === screen ? colors.brand : "transparent",
            }}
          >
            <Icon
              name={icon}
              size={21}
              color={active === screen ? colors.brand : colors.muted}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: active === screen ? colors.brand : colors.muted,
              }}
            >
              {t(label)}
            </Text>
          </Pressable>
        ))}
      </View>
      <Sheet visible={more} title={t("More")} onClose={() => setMore(false)}>
        {[
          ["overview", "Profile"],
          ["support", "Support"],

        ].map(([screen, label]) => (
          <Pressable
            key={screen}
            accessibilityRole="button"
            onPress={() => go(screen)}
            style={c.menuRow}
          >
            <Text style={c.menuText}>{t(label)}</Text>
            <Icon name="arrow" size={18} />
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setMore(false);
            router.navigate("/");
          }}
          style={c.menuRow}
        >
          <Text style={c.menuText}>{t("Market")}</Text>
          <Icon name="map" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setMore(false);
            void signOut().then(() => router.replace("/account"));
          }}
          style={c.menuRow}
        >
          <Text style={c.menuText}>{t("Sign out")}</Text>
        </Pressable>
      </Sheet>
    </>
  );
}
