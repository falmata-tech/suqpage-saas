import React, { useState } from "react";
import { Text } from "react-native";
import { useApp } from "../src/runtime";
import { Screen, Card, Copy, Button, Status, openLink, colors } from "../src/ui";

export default function AccountDeletion() {
  const { t } = useApp();
  const [error, setError] = useState("");
  async function compose() {
    setError("");
    try {
      await openLink("mailto:falmata.dawano@gmail.com?subject=Suqpage%20account%20deletion%20request");
    } catch {
      setError(t("Could not open your email app. Send your request to the address below."));
    }
  }
  return <Screen>
    <Copy big>{t("Delete your Suqpage account")}</Copy>
    <Card>
      <Copy>{t("Send your request from the email you use to sign in. Include your page handle, if you have one.")}</Copy>
      <Copy muted>{t("Our team will verify your identity and confirm the data to be removed before deleting your account.")}</Copy>
      <Button label={t("Email deletion request")} onPress={() => void compose()} />
      <Status error={error} />
      <Text selectable style={{ color: colors.ink, fontSize: 16 }}>falmata.dawano@gmail.com</Text>
    </Card>
  </Screen>;
}
