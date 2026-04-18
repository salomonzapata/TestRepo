import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "@/lib/store";
import { markQuestComplete, upsertUserProgress } from "@/lib/supabase";
import { generateQuest, generateVocabularyQuiz } from "@/lib/claude";
import { saveQuest } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FlashCard } from "@/components/lessons/FlashCard";
import { QuestChoice } from "@/types";

type Phase = "narrative" | "vocabulary" | "choices" | "consequence" | "quiz";

export default function QuestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quests, activeWorld, session, progress, addXp, markQuestComplete: markComplete, addQuest } = useAppStore();

  const quest = quests.find((q) => q.id === id);
  const [phase, setPhase] = useState<Phase>("narrative");
  const [selectedChoice, setSelectedChoice] = useState<QuestChoice | null>(null);
  const [quizItems, setQuizItems] = useState<any[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [flashIndex, setFlashIndex] = useState(0);
  const [generatingNext, setGeneratingNext] = useState(false);

  if (!quest || !activeWorld) {
    return (
      <View className="flex-1 bg-void items-center justify-center">
        <Text className="text-text-secondary">Quest not found</Text>
      </View>
    );
  }

  const handleChoice = async (choice: QuestChoice) => {
    setSelectedChoice(choice);
    setPhase("consequence");

    // Mark complete & award XP
    await markQuestComplete(quest.id, session!.user.id);
    markComplete(quest.id);
    addXp(quest.xpReward);

    if (progress) {
      await upsertUserProgress({
        user_id: session!.user.id,
        world_id: activeWorld.id,
        xp: progress.xp + quest.xpReward,
        streak: progress.streak,
        last_active_date: new Date().toISOString(),
      });
    }
  };

  const handleStartQuiz = async () => {
    const items = await generateVocabularyQuiz({
      vocabularyItems: quest.vocabularyFocus,
      targetLanguage: activeWorld.targetLanguage,
      nativeLanguage: activeWorld.nativeLanguage,
    });
    setQuizItems(items);
    setPhase("quiz");
  };

  const handleNextQuest = async () => {
    setGeneratingNext(true);
    try {
      const questData = await generateQuest({
        worldLore: activeWorld.lore,
        worldName: activeWorld.name,
        targetLanguage: activeWorld.targetLanguage,
        nativeLanguage: activeWorld.nativeLanguage,
        difficulty: Math.min(5, quest.difficulty + 1) as 1 | 2 | 3 | 4 | 5,
        previousQuestSummary: `${quest.title}: ${selectedChoice?.consequence}`,
        userName: session!.user.user_metadata?.full_name ?? "Adventurer",
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
        router.replace(`/(app)/quest/${data.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingNext(false);
    }
  };

  return (
    <LinearGradient colors={["#0f0a1e", "#1a1230"]} className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-mystic-light text-lg">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-text-primary font-bold" numberOfLines={1}>
              {quest.title}
            </Text>
            <Text className="text-text-muted text-xs">{activeWorld.name}</Text>
          </View>
          <Text className="text-gold text-sm font-bold">+{quest.xpReward} XP</Text>
        </View>

        <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ gap: 16 }}>
          {/* NARRATIVE */}
          {phase === "narrative" && (
            <>
              <Text className="text-text-secondary text-base leading-loose">{quest.narrative}</Text>
              {quest.vocabularyFocus.length > 0 && (
                <Card>
                  <Text className="text-rune text-xs font-bold uppercase tracking-widest mb-3">
                    Key Vocabulary
                  </Text>
                  <View className="gap-2">
                    {quest.vocabularyFocus.map((v, i) => (
                      <View key={i} className="flex-row items-start gap-2">
                        <Text className="text-glow font-bold text-sm w-24">{v.word}</Text>
                        <Text className="text-text-secondary text-sm flex-1">{v.translation}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              )}
              <Button onPress={() => setPhase("vocabulary")} fullWidth>
                Practice Words First
              </Button>
              <Button onPress={() => setPhase("choices")} variant="ghost" fullWidth>
                Skip to Choices
              </Button>
            </>
          )}

          {/* VOCABULARY FLASHCARDS */}
          {phase === "vocabulary" && (
            <>
              <Text className="text-text-muted text-xs text-center uppercase tracking-widest">
                Word {flashIndex + 1} of {quest.vocabularyFocus.length}
              </Text>
              <FlashCard
                item={quest.vocabularyFocus[flashIndex]}
                targetLanguage={activeWorld.targetLanguage}
              />
              <View className="flex-row gap-3">
                {flashIndex > 0 && (
                  <Button onPress={() => setFlashIndex((i) => i - 1)} variant="ghost">
                    ← Prev
                  </Button>
                )}
                <View className="flex-1">
                  {flashIndex < quest.vocabularyFocus.length - 1 ? (
                    <Button onPress={() => setFlashIndex((i) => i + 1)} fullWidth>
                      Next →
                    </Button>
                  ) : (
                    <Button onPress={() => setPhase("choices")} fullWidth>
                      Make Your Choice
                    </Button>
                  )}
                </View>
              </View>
            </>
          )}

          {/* CHOICES */}
          {phase === "choices" && (
            <>
              <Text className="text-text-secondary text-base leading-loose">{quest.narrative}</Text>
              <Text className="text-glow text-sm font-bold uppercase tracking-widest text-center">
                What do you say?
              </Text>
              <View className="gap-3">
                {quest.choices.map((choice) => (
                  <TouchableOpacity
                    key={choice.id}
                    onPress={() => handleChoice(choice)}
                    activeOpacity={0.85}
                  >
                    <Card glow className="gap-2">
                      <Text className="text-text-primary text-lg font-bold">
                        {choice.text}
                      </Text>
                      {choice.transliteration && (
                        <Text className="text-text-muted text-sm italic">
                          {choice.transliteration}
                        </Text>
                      )}
                      <Text className="text-text-secondary text-sm">{choice.translation}</Text>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* CONSEQUENCE */}
          {phase === "consequence" && selectedChoice && (
            <>
              <View className="items-center gap-2 py-4">
                <Text className="text-4xl">⚔️</Text>
                <Text className="text-gold font-bold text-lg">+{quest.xpReward} XP</Text>
                <Text className="text-text-muted text-xs">Quest Complete</Text>
              </View>
              <Card glow>
                <Text className="text-rune text-xs font-bold uppercase tracking-widest mb-2">
                  You said:
                </Text>
                <Text className="text-text-primary text-lg font-bold">{selectedChoice.text}</Text>
                {selectedChoice.transliteration && (
                  <Text className="text-text-muted text-sm italic mt-1">
                    {selectedChoice.transliteration}
                  </Text>
                )}
              </Card>
              <Text className="text-text-secondary text-base leading-loose">
                {selectedChoice.consequence}
              </Text>
              <Button onPress={handleStartQuiz} fullWidth>
                Test Your Vocabulary
              </Button>
              <Button onPress={handleNextQuest} loading={generatingNext} variant="ghost" fullWidth>
                {generatingNext ? "Generating next quest..." : "Continue Adventure →"}
              </Button>
            </>
          )}

          {/* QUIZ */}
          {phase === "quiz" && quizItems.length > 0 && (
            <>
              {quizIndex < quizItems.length ? (
                <QuizQuestion
                  item={quizItems[quizIndex]}
                  onAnswer={(ans) => {
                    setQuizAnswer(ans);
                    setTimeout(() => {
                      setQuizAnswer(null);
                      setQuizIndex((i) => i + 1);
                    }, 1200);
                  }}
                  selectedAnswer={quizAnswer}
                />
              ) : (
                <View className="items-center gap-4 py-8">
                  <Text className="text-5xl">🏆</Text>
                  <Text className="text-glow text-2xl font-bold">Quiz Complete!</Text>
                  <Button onPress={handleNextQuest} loading={generatingNext} fullWidth>
                    Continue Adventure →
                  </Button>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function QuizQuestion({
  item,
  onAnswer,
  selectedAnswer,
}: {
  item: any;
  onAnswer: (ans: string) => void;
  selectedAnswer: string | null;
}) {
  const options = [item.answer, ...item.distractors].sort(() => Math.random() - 0.5);

  return (
    <View className="gap-4">
      <Text className="text-text-muted text-xs uppercase tracking-widest text-center">
        {item.type === "translate" ? "Translate" : "Fill in the blank"}
      </Text>
      <Text className="text-text-primary text-xl font-bold text-center leading-relaxed">
        {item.question}
      </Text>
      <View className="gap-3">
        {options.map((opt: string) => {
          const isSelected = selectedAnswer === opt;
          const isCorrect = opt === item.answer;
          let bg = "bg-surface-2 border-border";
          if (selectedAnswer) {
            if (isCorrect) bg = "bg-sage/20 border-sage";
            else if (isSelected) bg = "bg-red-500/20 border-red-400";
          }
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => !selectedAnswer && onAnswer(opt)}
              disabled={!!selectedAnswer}
              activeOpacity={0.85}
              className={`border rounded-xl px-4 py-3 ${bg}`}
            >
              <Text className="text-text-primary text-base text-center">{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
