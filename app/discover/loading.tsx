
import { useUiText } from "@/lib/i18n/ui";
export default function Loading() {
  const t = useUiText();
  return <div className="public-route-loading" role="status"><span>{t("Opening the market...")}</span></div>;
}
