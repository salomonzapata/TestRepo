import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "@/lib/store";
import { FlashCard } from "@/components/lessons/FlashCard";
import { Card } from "@/components/ui/Card";
import { VocabularyItem } from "@/types";

export default function LessonsScreen() {
  const { quests, activeWorld } = useAppStore();
  const [activeTab, setActiveTab] = useState<"vocabulary" | "grammar">("vocabulary");
  const [flashMode, setFlashMode] = useState(false);
  const [flashIndex, setFlashIndex] = useState(0);

  // Aggregate all vocabulary from completed and active quests
  const allVocab: VocabularyItem[] = quests.flatMap((q) => q.vocabularyFocus ?? []);
  const grammarPoints = quests
    .filter((q) => q.grammarFocus)
    .map((q) => ({ title: q.title, focus: q.grammarFocus }));

  if (!activeWorld) {
    return (
      <LinearGradient colors={["#0f0a1e", "#1a1230"]} className="flex-1">
        <SafeAreaView className="flex-1 items-center justify-center px-6">
          <Text className="text-text-secondary text-center">
            Create a world to start learning.
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (flashMode && allVocab.length > 0) {
    return (
      <LinearGradient colors={["#0f0a1e", "#1a1230"]} className="flex-1">
        <SafeAreaView className="flex-1 px-4">
          <View className="flex-row items-center justify-between py-4">
            <TouchableOpacity onPress={() => setFlashMode(false)}>
              <Text className="text-mystic-light">✕ Exit</Text>
            </TouchableOpacity>
            <Text className="text-text-muted text-sm">
              {flashIndex + 1} / {allVocab.length}
            </Text>
          </View>

          <View className="flex-1 justify-center gap-6">
            <FlashCard
              item={allVocab[flashIndex]}
              targetLanguage={activeWorld.targetLanguage}
            />

            {/* Progress dots */}
            <View className="flex-row justify-center gap-1">
              {allVocab.map((_, i) => (
                <View
                  key={i}
                  className={`h-1 rounded-full ${
                    i === flashIndex ? "w-4 bg-mystic" : "w-1 bg-surface-3"
                  }`}
                />
              ))}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setFlashIndex((i) => Math.max(0, i - 1))}
                disabled={flashIndex === 0}
                className={`flex-1 bg-surface-2 border border-border rounded-xl py-3 items-center ${flashIndex === 0 ? "opacity-30" : ""}`}
              >
                <Text className="text-text-primary">← Prev</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setFlashIndex((i) => Math.min(allVocab.length - 1, i + 1))
                }
                disabled={flashIndex === allVocab.length - 1}
                className={`flex-1 bg-mystic rounded-xl py-3 items-center ${flashIndex === allVocab.length - 1 ? "opacity-30" : ""}`}
              >
                <Text className="text-white font-bold">Next →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f0a1e", "#1a1230"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View>
            <Text className="text-text-muted text-xs uppercase tracking-widest">
              {activeWorld.name}
            </Text>
            <Text className="text-text-primary text-2xl font-bold">Lessons</Text>
          </View>

          {/* Tabs */}
          <View className="flex-row bg-surface-2 rounded-xl p-1">
            {(["vocabulary", "grammar"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg items-center ${
                  activeTab === tab ? "bg-mystic" : ""
                }`}
              >
                <Text
                  className={`text-sm font-bold capitalize ${
                    activeTab === tab ? "text-white" : "text-text-muted"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Vocabulary tab */}
          {activeTab === "vocabulary" && (
            <View className="gap-4">
              {allVocab.length === 0 ? (
                <Text className="text-text-secondary text-center py-8">
                  Complete quests to unlock vocabulary
                </Text>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setFlashIndex(0);
                      setFlashMode(true);
                    }}
                    className="bg-mystic/20 border border-mystic/50 rounded-xl p-4 flex-row items-center justify-between"
                  >
                    <View>
                      <Text className="text-glow font-bold">Flashcard Review</Text>
                      <Text className="text-text-muted text-xs">
                        {allVocab.length} words to practice
                      </Text>
                    </View>
                    <Text className="text-3xl">🃏</Text>
                  </TouchableOpacity>

                  <View className="gap-2">
                    {allVocab.map((v, i) => (
                      <Card key={i}>
                        <View className="flex-row items-start gap-3">
                          <Text className="text-glow font-bold text-base w-28" numberOfLines={1}>
                            {v.word}
                          </Text>
                          <View className="flex-1">
                            <Text className="text-text-secondary text-sm">{v.translation}</Text>
                            <Text className="text-text-muted text-xs mt-0.5 italic">
                              {v.partOfSpeech}
                            </Text>
                          </View>
                        </View>
                      </Card>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}

          {/* Grammar tab */}
          {activeTab === "grammar" && (
            <View className="gap-3">
              {grammarPoints.length === 0 ? (
                <Text className="text-text-secondary text-center py-8">
                  Complete quests to unlock grammar lessons
                </Text>
              ) : (
                grammarPoints.map((g, i) => (
                  <Card key={i}>
                    <Text className="text-rune text-xs font-bold uppercase tracking-widest mb-1">
                      From: {g.title}
                    </Text>
                    <Text className="text-text-secondary text-sm leading-relaxed">
                      {g.focus}
                    </Text>
                  </Card>
                ))
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
