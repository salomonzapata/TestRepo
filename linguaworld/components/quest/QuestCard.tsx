import { View, Text, TouchableOpacity } from "react-native";
import { Quest } from "@/types";
import { Card } from "@/components/ui/Card";

type QuestCardProps = {
  quest: Quest;
  onPress: () => void;
};

const difficultyStars = (d: number) => "★".repeat(d) + "☆".repeat(5 - d);

const difficultyColor = (d: number) => {
  if (d <= 1) return "text-sage";
  if (d <= 2) return "text-rune";
  if (d <= 3) return "text-gold";
  if (d <= 4) return "text-ember";
  return "text-red-400";
};

export function QuestCard({ quest, onPress }: QuestCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={quest.completed}>
      <Card glow={!quest.completed} className={quest.completed ? "opacity-50" : ""}>
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-2">
              {quest.completed ? (
                <View className="bg-sage/20 rounded-full px-2 py-0.5">
                  <Text className="text-sage text-xs font-bold">✓ Complete</Text>
                </View>
              ) : (
                <View className="bg-mystic/20 rounded-full px-2 py-0.5">
                  <Text className="text-mystic-light text-xs font-bold">Active Quest</Text>
                </View>
              )}
              <Text className={`text-xs font-bold ${difficultyColor(quest.difficulty)}`}>
                {difficultyStars(quest.difficulty)}
              </Text>
            </View>

            <Text className="text-text-primary text-lg font-bold mb-1">{quest.title}</Text>
            <Text className="text-text-secondary text-sm" numberOfLines={2}>
              {quest.narrative.split("\n")[0]}
            </Text>
          </View>

          <View className="items-center gap-1">
            <Text className="text-2xl">⚔️</Text>
            <Text className="text-gold text-xs font-bold">+{quest.xpReward} XP</Text>
          </View>
        </View>

        {quest.grammarFocus && (
          <View className="mt-3 pt-3 border-t border-border flex-row items-center gap-2">
            <Text className="text-rune text-xs">📖</Text>
            <Text className="text-text-muted text-xs flex-1" numberOfLines={1}>
              {quest.grammarFocus}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}
