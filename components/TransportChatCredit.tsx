"use client";

import {useUiText} from "@/lib/i18n/ui";
import styles from "./TransportSupport.module.css";

/** A presentation credit while the managed-chat integration is still planned. */
export default function TransportChatCredit() {
  const t=useUiText();
  return <footer className={styles.chatCredit}>
    <span>{t("Powered by")}</span>{" "}
    <a href="https://cargochatter.com/" target="_blank" rel="noopener noreferrer">CargoChatter</a>
  </footer>;
}
