import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useFocusEffect } from "expo-router";
import { AppState, Platform } from "react-native";
import { endLocalSession } from "./session-lifecycle";
import * as SecureStore from "expo-secure-store";
import { createClient, processLock, type Session } from "@supabase/supabase-js";
import {
  apiOrigin,
  type Locale,
  type Shop,
  type Offering,
} from "@suqpage/contracts";
import { createUiText, languageNames, locales } from "../../../lib/i18n/core";
import am from "../../../lib/i18n/messages/am.json";
import om from "../../../lib/i18n/messages/om.json";
import so from "../../../lib/i18n/messages/so.json";
import ti from "../../../lib/i18n/messages/ti.json";
export { languageNames, locales };
export const API = apiOrigin(
  process.env.EXPO_PUBLIC_API_ORIGIN || "https://suqpage.com",
);
const memory = new Map<string, string>();
export const secure = {
  getItem: async (key: string) =>
    Platform.OS === "web"
      ? memory.get(key) || null
      : SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web") memory.set(key, value);
    else await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === "web") memory.delete(key);
    else await SecureStore.deleteItemAsync(key);
  },
};
const authUrl = process.env.EXPO_PUBLIC_SUPABASE_URL,
  authKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const auth =
  authUrl && authKey
    ? createClient(authUrl, authKey, {
        auth: {
          storage: secure,
          storageKey: "suqpage-owner-session",
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          lock: processLock,
        },
      })
    : null;
export class ApiFailure extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}
export async function request<T>(
  path: string,
  options: {
    body?: unknown;
    form?: FormData;
    token?: string;
    buyingToken?: string;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.buyingToken)
    headers["X-Suqpage-Buying-Session"] = options.buyingToken;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort);
  try {
    const r = await fetch(`${API}/api/mobile/v1/${path}`, {
      method: options.body !== undefined || options.form ? "POST" : "GET",
      headers,
      body:
        options.form ||
        (options.body !== undefined ? JSON.stringify(options.body) : undefined),
      signal: controller.signal,
    });
    const value = await r.json();
    if (!r.ok)
      throw new ApiFailure(
        value.error || "Please try again.",
        r.status,
        value.code,
      );
    return value as T;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
  }
}
export type BasketItem = {
  product: Offering;
  quantity: string;
  options: Record<string, string>;
};
type Runtime = {
  session: Session | null;
  ready: boolean;
  locale: Locale;
  setLocale: (v: Locale) => void;
  t: ReturnType<typeof createUiText>;
  basket: { shop: Shop; items: BasketItem[] } | null;
  setBasket: React.Dispatch<React.SetStateAction<Runtime["basket"]>>;
  signOut: () => Promise<void>;
  ownerRequest: <T>(
    path: string,
    body?: unknown,
    form?: FormData,
  ) => Promise<T>;
};
const Context = createContext<Runtime | null>(null);
export function RuntimeProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null),
    [ready, setReady] = useState(!auth),
    [locale, setLanguage] = useState<Locale>("en"),
    [basket, setBasket] = useState<Runtime["basket"]>(null);
  useEffect(() => {
    let active = true;
    secure.getItem("suqpage-language").then((v) => {
      if (active && locales.includes(v as Locale)) setLanguage(v as Locale);
    }).catch(() => {});
    auth?.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setReady(true);
      }
    }).catch(() => { if(active){setSession(null);setReady(true);} });
    const sub = auth?.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setReady(true);
    });
    const app = AppState.addEventListener("change", (s) => {
      if (s === "active") auth?.auth.startAutoRefresh();
      else auth?.auth.stopAutoRefresh();
    });
    return () => {
      active = false;
      sub?.data.subscription.unsubscribe();
      app.remove();
    };
  }, []);
  const ownerRequest = useCallback(
    async <T,>(path: string, body?: unknown, form?: FormData) => {
      if (!auth) throw new ApiFailure("Sign-in is not configured.", 503);
      const { data } = await auth.auth.getSession();
      if (!data.session) throw new ApiFailure("Sign in to Suqpage.", 401);
      return request<T>(path, { body, form, token: data.session.access_token });
    },
    [],
  );
  const signOut = () =>
    endLocalSession({
      signOut: async () => auth?.auth.signOut({ scope: "local" }),
      clearPrivateState: () => {
        setSession(null);
        setBasket(null);
      },
      removeStoredSession: () => secure.removeItem("suqpage-owner-session"),
    });

  return (
    <Context.Provider
      value={{
        session,
        ready,
        locale,
        setLocale: (v) => {
          setLanguage(v);
          void secure.setItem("suqpage-language", v).catch(() => {});
        },
        t: createUiText({ en: {}, am, om, so, ti }[locale]),
        basket,
        setBasket,
        signOut,
        ownerRequest,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const v = useContext(Context);
  if (!v) throw Error("Missing runtime");
  return v;
}
export function useLoad<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList = [],
  refreshOnFocus = false,
) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => { if(refreshOnFocus)setRevision(v=>v+1); }, [refreshOnFocus]));
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    setData(null);
    loader()
      .then((v) => {
        if (live) setData(v);
      })
      .catch((e) => {
        if (live)
          setError(e instanceof Error ? e.message : "Please try again.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [...deps, revision]);
  return {
    data,
    error,
    loading,
    reload: () => setRevision((v) => v + 1),
    setData,
  };
}
export const mediaUrl = (ref: string) =>
  /^(https?:|file:|blob:|data:)/.test(ref) ? ref : `${API}${ref}`;
