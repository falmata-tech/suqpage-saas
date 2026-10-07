import React from "react";
import { View } from "react-native";
import { OwnerNavigation } from "../../src/chrome";
import { router, useLocalSearchParams } from "expo-router";
import type { OwnerHome } from "@suqpage/contracts";
import { useApp, useLoad } from "../../src/runtime";
import { Screen, Copy, Button, Card, Photo, Status } from "../../src/ui";
import { Setup, PageEditor, ProductEditor } from "../../src/owner-forms";
import { BusinessForm, Settings } from "../../src/owner-business";
import { Inquiries, SupportList, OwnerChat } from "../../src/owner-inbox";
export default function OwnerScreen() {
  const { section: screen, id, view } = useLocalSearchParams<{
      section: string;
      id?: string;
      view?: string;
    }>(),
    { session, t, ownerRequest } = useApp();
  const load = useLoad(
    () =>
      session && screen !== "setup"
        ? ownerRequest<OwnerHome>("owner/home")
        : Promise.resolve(null),
    [screen, id, session?.user.id],
    ["products","inquiries","support"].includes(screen),
  );
  if (!session)
    return (
      <Screen>
        <Copy>{t("Sign in to Suqpage.")}</Copy>
        <Button
          label={t("Sign in")}
          onPress={() => router.replace("/account")}
        />
      </Screen>
    );
  if (screen === "setup")
    return (
      <Screen>
        <Setup />
      </Screen>
    );
  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <Status {...load} retry={load.reload} />
        {load.data && (
          <>
            {screen === "page" ? (
              <PageEditor home={load.data} reload={load.reload} initialPreview={view === "preview" || (view !== "edit" && load.data.shop.status === "draft")} />
            ) : screen === "business" ? (
              <BusinessForm />
            ) : screen === "settings" ? (
              <Settings home={load.data} />
            ) : screen === "product" ? (
              <ProductEditor
                home={load.data}
                id={id}
                onSaved={() =>
                  router.replace({
                    pathname: "/owner/[section]",
                    params: { section: "products" },
                  })
                }
              />
            ) : screen === "inquiries" ? (
              <Inquiries />
            ) : screen === "support" ? (
              <SupportList />
            ) : screen === "chat" && id ? (
              <OwnerChat id={id} />
            ) : screen === "products" ? (
              <>
                <Copy big>{t("Products & services")}</Copy>
                <Button
                  label={t("Add product or service")}
                  icon="plus"
                  onPress={() =>
                    router.push({
                      pathname: "/owner/[section]",
                      params: { section: "product" },
                    })
                  }
                />
                {load.data.shop.products.map((p) => (
                  <Card key={p.id}>
                    <Photo
                      refPath={
                        p.media.find((m) => m.kind === "image")?.ref || ""
                      }
                      privateImage
                      height={150}
                    />
                    <Copy>{p.name}</Copy>
                    <Copy muted>{t(p.published ? "Published" : "Draft")}</Copy>
                    <Button
                      secondary
                      label={t("Edit")}
                      onPress={() =>
                        router.push({
                          pathname: "/owner/[section]",
                          params: { section: "product", id: p.id },
                        })
                      }
                    />
                  </Card>
                ))}
              </>
            ) : (
              <Copy>{t("Page not found.")}</Copy>
            )}
          </>
        )}
      </Screen>
      <OwnerNavigation
        active={
          ["products", "product"].includes(screen)
            ? "products"
            : ["page", "inquiries"].includes(screen)
              ? screen
              : "more"
        }
      />
    </View>
  );
}
