"use client";
import RouteRecovery from "@/components/RouteRecovery";

export default function ErrorPage({retry}: {error: Error & {digest?: string}; retry: () => void}) {
  return <RouteRecovery retry={retry}/>;
}
