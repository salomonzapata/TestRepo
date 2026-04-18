import { useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "@/lib/store";
import { generateQuest, generateVocabularyQuiz } from "@/lib/claude";
import { saveQuest } from "@/lib/supabase";
import { QuestCard } from "@/components/quest/QuestCard";
import { Button } from "@/components/ui/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export default function QuestsScreen() {
  const { quests, activeWorld, session, addQuest } = useAppStore();
  const [generating, setGenerating] = useState(false);

  const completed = quests.filter((q) => q.completed);
  const active = quests.filter((q) => !q.completed);

  const generateNewQuest = async () => {
    if (!activeWorld || !session?.user) return;
    setGenerating(true);
    try {
      const lastQuest = quests[quests.length - 1];
      const questData = await generateQuest({
        worldLore: activeWorld.lore,
        worldName: activeWorld.name,
        targetLanguage: activeWorld.targetLanguage,
        nativeLanguage: activeWorld.nativeLanguage,
        difficulty: Math.min(5, (lastQuest?.difficulty ?? 0) + 1) as 1 | 2 | 3 | 4 | 5,
        previousQuestSummary: lastQuest?.title,
        userName: session.user.user_metadata?.full_name ?? "Adventurer",
      });

      const { data } = await saveQuest({
        world_id: activeWorld.id,
        title: questData.title,
        narrative: questData.narrative,
        choices: questData.choices,
        vocabulary_focus: questData.vocabularyFocus,
        grammar_focus: questData.grammarFocus,
        difficulty: questData.difficulty,
        xp_reward: questData.xpReward,
      });

      if (data) {
        addQuest({ ...questData, id: data.id, worldId: activeWorld.id, completed: false });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (!activeWorld) {
    return (
      <LinearGradient colors={["#0f0a1e", "#1a1230"]} className="flex-1">
        <SafeAreaView className="flex-1 items-center justify-center px-6">
          <Text className="text-text-secondary text-center">
            Create a world first to unlock quests.
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f0a1e", "#1a1230"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, gap: 16 }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-text-muted text-xs uppercase tracking-widest">
                {activeWorld.name}
              </Text>
              <Text className="text-text-primary text-2xl font-bold">Quests</Text>
            </View>
            <View className="items-end">
              <Text className="text-text-secondary text-sm">
                {completed.length}/{quests.length} done
              </Text>
            </View>
          </View>

          {active.length > 0 && (
            <View className="gap-3">
              <Text className="text-mystic-light text-sm font-bold uppercase tracking-widest">
                Active
              </Text>
              {active.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onPress={() => router.push(`/(app)/quest/${quest.id}`)}
                />
              ))}
            </View>
          )}

          <Button
            onPress={generateNewQuest}
            loading={generating}
            variant={active.length === 0 ? "primary" : "ghost"}
            fullWidth
            icon={<Text>⚔️</Text>}
          >
            {generating ? "Generating quest..." : "Generate Next Quest"}
          </Button>

          {completed.length > 0 && (
            <View className="gap-3">
              <Text className="text-text-muted text-sm font-bold uppercase tracking-widest">
                Completed
              </Text>
              {completed.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onPress={() => {}}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
