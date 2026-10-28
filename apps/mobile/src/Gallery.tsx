import React, { useState, useRef } from "react";
import { View, ScrollView, Pressable, Platform, Text, useWindowDimensions } from "react-native";
import type { Media } from "@africmade/contracts";
import YouTubeVideo from "./YouTubeVideo";
import { Photo, Button, Copy, Icon, colors, s } from "./ui";
import { useApp } from "./runtime";
export default function Gallery({
  media,
  privateImage = false,
}: {
  media: Media[];
  privateImage?: boolean;
}) {
  const { t } = useApp(),
    { width } = useWindowDimensions(),
    w = Math.min(width - 36, 724);
  const scroll = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const select = (i: number) => {
    setIndex(i);
    scroll.current?.scrollTo({ x: i * w, animated: true });
  };
  if (!media.length) return (
    <View
      testID="offering-gallery-empty"
      accessible
      accessibilityRole="text"
      accessibilityLabel={t("No photo yet")}
      style={{
        minHeight: 270,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 16,
        backgroundColor: colors.soft,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 20,
      }}
    >
      <Icon name="package" size={32} color={colors.muted} />
      <Text style={{ color: colors.muted, fontSize: 15, fontWeight: "600" }}>
        {t("No photo yet")}
      </Text>
    </View>
  );
  return (
    <View style={{ gap: 10 }}>
      <ScrollView
        ref={scroll}
        testID="offering-gallery"
        focusable={Platform.OS === "web" ? true : undefined}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / w))
        }
      >
        {media.map((m, i) => (
          <View key={m.ref} style={{ width: w }}>
            {m.kind === "image" ? (
              <Photo refPath={m.ref} height={270} privateImage={privateImage} />
            ) : (
              <YouTubeVideo video={m.ref} allowSocial poster={media.find(item=>item.kind === "image")?.ref} privateImage={privateImage} active={index === i} height={270} />
            )}
          </View>
        ))}
      </ScrollView>
      {media.length > 1 && (
        <>
          <View style={[s.row, { justifyContent: "space-between" }]}>
            <Button
              secondary
              label={t("Previous")}
              disabled={index === 0}
              onPress={() => select(index - 1)}
            />
            <Copy>
              {index + 1} / {media.length}
            </Copy>
            <Button
              secondary
              label={t("Next")}
              disabled={index >= media.length - 1}
              onPress={() => select(index + 1)}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {media.map((m, i) => (
              <Pressable
                key={m.ref}
                accessibilityRole="button"
                accessibilityLabel={t(
                  m.kind === "image" ? "Photo {number}" : "Video {number}",
                  { number: i + 1 },
                )}
                accessibilityState={{ selected: index === i }}
                onPress={() => select(i)}
                style={{
                  width: 62,
                  borderWidth: 2,
                  borderColor: i === index ? "#ce3900" : "transparent",
                  borderRadius: 15,
                }}
              >
                {m.kind === "video" && !m.ref.startsWith("youtube:") ? <View style={{height:55,alignItems:"center",justifyContent:"center",backgroundColor:colors.background}}><Icon name="play" size={23}/></View> : <Photo
                  privateImage={privateImage}
                  refPath={
                    m.kind === "image"
                      ? m.ref
                      : `https://i.ytimg.com/vi/${m.ref.replace("youtube:", "")}/default.jpg`
                  }
                  height={55}
                />}
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
