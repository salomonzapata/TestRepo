import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useRef, useState } from "react";
import { VocabularyItem } from "@/types";
import * as Speech from "expo-speech";

type FlashCardProps = {
  item: VocabularyItem;
  targetLanguage: string;
};

export function FlashCard({ item, targetLanguage }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flip = () => {
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
    setFlipped((v) => !v);
  };

  const speak = () => {
    Speech.speak(item.word, { language: targetLanguage, rate: 0.8 });
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <View className="items-center justify-center" style={{ height: 240 }}>
      {/* Front */}
      <Animated.View
        className="absolute w-full"
        style={{ transform: [{ rotateY: frontRotate }], backfaceVisibility: "hidden" }}
      >
        <TouchableOpacity
          onPress={flip}
          activeOpacity={0.9}
          className="bg-surface-2 border border-mystic/50 rounded-3xl p-8 items-center justify-center gap-4"
          style={{ minHeight: 200 }}
        >
          <Text className="text-4xl font-bold text-text-primary text-center">{item.word}</Text>
          {item.partOfSpeech && (
            <View className="bg-arcane/40 rounded-full px-3 py-1">
              <Text className="text-mystic-light text-xs">{item.partOfSpeech}</Text>
            </View>
          )}
          <TouchableOpacity onPress={speak} className="mt-2">
            <Text className="text-2xl">🔊</Text>
          </TouchableOpacity>
          <Text className="text-text-muted text-xs mt-2">Tap to reveal</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Back */}
      <Animated.View
        className="absolute w-full"
        style={{ transform: [{ rotateY: backRotate }], backfaceVisibility: "hidden" }}
      >
        <TouchableOpacity
          onPress={flip}
          activeOpacity={0.9}
          className="bg-arcane border border-mystic rounded-3xl p-6 items-center justify-center gap-3"
          style={{ minHeight: 200 }}
        >
          <Text className="text-2xl font-bold text-glow text-center">{item.translation}</Text>
          <View className="h-px w-16 bg-mystic/40 my-1" />
          <Text className="text-text-secondary text-sm text-center italic">
            "{item.exampleSentence}"
          </Text>
          <Text className="text-text-muted text-xs text-center">
            {item.exampleTranslation}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
