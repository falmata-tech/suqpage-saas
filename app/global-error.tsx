"use client";
import RouteRecovery, {useRecoveryText} from "@/components/RouteRecovery";

export default function GlobalError({retry}: {error: Error & {digest?: string}; retry: () => void}) {
  const {locale} = useRecoveryText();
  return <html lang={locale}><head><title>AfricMade</title></head><body style={{margin: 0}}><RouteRecovery retry={retry}/></body></html>;
}
