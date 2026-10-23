import {
  selectionKey,
  MAX_INQUIRY_SELECTIONS,
} from "../../../lib/product-inquiry";
import React, { useRef, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { Shop } from "@suqpage/contracts";
import { useApp, useLoad, request } from "../src/runtime";
import { Screen, Copy, LinkedText, Card, Button, Chip, Status, s } from "../src/ui";
import Gallery from "../src/Gallery";
import ProductSupply from '../src/ProductSupply';
import {visibleCatalogProduct} from '../src/catalog-products';
import {CatalogSafety} from '../src/CatalogSafety';
import {useBusinessInquiry} from '../src/use-business-inquiry';
import ResourceLoading from '../src/ResourceLoading';
export default function Product() {
  const { handle, id } = useLocalSearchParams<{ handle: string; id: string }>(),
    { t } = useApp();
  const load = useLoad(
    () => request<Shop>("shops/" + encodeURIComponent(handle)),
    [handle],
  );
  const identity=JSON.stringify([handle,id]);
  const emptySelection=()=>({identity,options:{} as Record<string,string>,notice:''});
  const [selection,setSelection]=useState(emptySelection);
  const currentSelection=selection.identity===identity?selection:emptySelection();
  if(selection.identity!==identity)setSelection(currentSelection);
  const{options,notice}=currentSelection;
  const setOptions=(change:React.SetStateAction<Record<string,string>>)=>setSelection(current=>current.identity===identity?{...current,options:typeof change==='function'?change(current.options):change}:current);
  const setNotice=(value:string)=>setSelection(current=>current.identity===identity?{...current,notice:value}:current);
  const shop = load.data,
    product = shop?.products.find((p) => p.id === Number(id)&&visibleCatalogProduct(p));
  const ready =
    !load.loading&&!load.error&&product &&
    ["available", "limited"].includes(product.availability) &&
    product.options.every((o) => o.values.includes(options[o.name]));
  const authority=useRef({identity,shop,product,options,ready});
  authority.current={identity,shop,product,options,ready};
  const inquiry=useBusinessInquiry(shop);
  function inquire(single: boolean) {
    const current=authority.current;
    if(current.identity!==identity||!current.ready||!current.shop||!current.product)return;
    const{shop,product,options}=current;
    const item = { product, quantity: "", options };
    if (single) {
      router.push({
        pathname: "/inquiry",
        params: {
          handle,
          id: String(product.id),
          options: JSON.stringify(options),
        },
      });
      return;
    }
    if(!inquiry.ready)return;
    const remaining = inquiry.items.filter(
      (i) =>
        selectionKey(i.product.id, i.options) !==
        selectionKey(product.id, options),
    );
    if (remaining.length >= MAX_INQUIRY_SELECTIONS) {
      setNotice(t("Use up to 20 items per inquiry."));
      return;
    }
    inquiry.setItems(()=>[...remaining,item]);
    setNotice(t("Added to inquiry list"));
  }
  return (
    <Screen>
      <ResourceLoading load={load} variant="product"/>
      <Status error={inquiry.error} retry={inquiry.retry}/>
      {shop && product ? (
        <CatalogSafety business={shop} productId={product.id}>
          <Gallery media={product.media} />
          {shop.isDemo&&<Copy muted>{t("Example product")}</Copy>}
          <Copy big>{product.name}</Copy>
          <Copy muted>{shop.name}</Copy>
          <ProductSupply kind={product.kind} availability={product.availability}/>
          {product.priceMinor !== null && (
            <Copy big>{(product.priceMinor / 100).toLocaleString()} ETB</Copy>
          )}
          <LinkedText>{product.description}</LinkedText>
          {product.options.map((o) => (
            <Card key={o.name}>
              <Copy>{o.name}</Copy>
              <View style={s.wrap}>
                {o.values.map((v) => (
                  <Chip
                    key={v}
                    label={v}
                    selected={options[o.name] === v}
                    onPress={() => setOptions((s) => ({ ...s, [o.name]: v }))}
                  />
                ))}
              </View>
            </Card>
          ))}
          <Button
            accentColor={shop.accentColor}
            disabled={!ready}
            label={t("Inquire about this item only")}
            onPress={() => inquire(true)}
          />
          <Button
            accentColor={shop.accentColor}
            disabled={!ready||!inquiry.ready}
            secondary
            label={t("Add to inquiry list")}
            icon="plus"
            onPress={() => inquire(false)}
          />
          {Boolean(notice) && <Copy>{notice}</Copy>}
        </CatalogSafety>
      ) : (
        shop && <Copy>{t("Currently unavailable")}</Copy>
      )}
    </Screen>
  );
}
