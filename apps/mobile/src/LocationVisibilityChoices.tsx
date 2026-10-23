import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { Icon, colors } from "./ui";

export type LocationVisibilityMode = "area" | "storefront";

export default function LocationVisibilityChoices({
  value,
  t,
  onChange,
}: {
  value: LocationVisibilityMode;
  t: (key: string) => string;
  onChange: (value: LocationVisibilityMode) => void;
}) {
  const choices: { mode: LocationVisibilityMode; label: string; description?: string; icon: string }[] = [
    { mode: "area", label: t("Show my city"), description: t("The map shows your city, not your exact address."), icon: "list" },
    { mode: "storefront", label: t("Show on map"), icon: "pin" },
  ];

  return (
    <View style={styles.group} accessibilityLabel={t("Location visibility")}>
      <Text style={styles.legend}>{t("Location visibility")}</Text>
      <View style={styles.choices}>
        {choices.map((choice) => {
          const selected = value === choice.mode;
          return (
            <Pressable
              key={choice.mode}
              accessibilityRole="radio"
              accessibilityLabel={choice.description ? `${choice.label}. ${choice.description}` : choice.label}
              accessibilityState={{ checked: selected, disabled: false }}
              onPress={() => onChange(choice.mode)}
              style={({ pressed }) => [styles.choice, selected && styles.selected, pressed && styles.pressed]}
            >
              <View style={[styles.icon, selected && styles.selectedIcon]}>
                <Icon name={choice.icon} size={19} color={selected ? colors.brand : colors.muted} />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.label, selected && styles.selectedLabel]}>{choice.label}</Text>
                {choice.description ? <Text style={styles.description}>{choice.description}</Text> : null}
              </View>
              <View style={[styles.indicator, selected && styles.selectedIndicator]}>
                {selected ? <Icon name="check" size={13} color={colors.white} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8, minWidth: 0 },
  legend: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  choices: { flexDirection: "row", gap: 8 },
  choice: { flex: 1, minWidth: 0, minHeight: 56, paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", gap: 8 },
  selected: { borderColor: colors.brand, backgroundColor: colors.soft },
  pressed: { opacity: 0.82 },
  icon: { width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  selectedIcon: { backgroundColor: "#ffe5d6" },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  label: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 14, fontWeight: "600" },
  selectedLabel: { color: colors.brand, fontWeight: "700" },
  description: { color: colors.muted, fontSize: 11, lineHeight: 14 },
  indicator: { width: 19, height: 19, borderWidth: 1.5, borderColor: colors.muted, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  selectedIndicator: { borderColor: colors.brand, backgroundColor: colors.brand },
});
