import { View, Text } from "react-native";
import { getXpToNextLevel, getLevelFromXp } from "@/constants/worlds";

type XPBarProps = {
  xp: number;
};

export function XPBar({ xp }: XPBarProps) {
  const level = getLevelFromXp(xp);
  const { current, needed } = getXpToNextLevel(xp);
  const progress = Math.min(current / needed, 1);

  return (
    <View className="gap-1">
      <View className="flex-row justify-between items-center">
        <Text className="text-gold text-xs font-bold">Level {level}</Text>
        <Text className="text-text-muted text-xs">
          {current} / {needed} XP
        </Text>
      </View>
      <View className="h-2 bg-surface-3 rounded-full overflow-hidden">
        <View
          className="h-full bg-gold rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </View>
    </View>
  );
}
