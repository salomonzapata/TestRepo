import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

export default function DialogueScreen() {
  const { npcs, activeWorld } = useAppStore();

  if (!activeWorld || npcs.length === 0) {
    return (
      <LinearGradient colors={["#0f0a1e", "#1a1230"]} className="flex-1">
        <SafeAreaView className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4">💬</Text>
          <Text className="text-text-secondary text-center">
            Create a world to meet its inhabitants.
          </Text>
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
            <Text className="text-text-primary text-2xl font-bold">Inhabitants</Text>
            <Text className="text-text-secondary text-sm mt-1">
              Practice {activeWorld.targetLanguage} with the people of your world
            </Text>
          </View>

          {npcs.map((npc) => (
            <TouchableOpacity
              key={npc.id}
              onPress={() => router.push(`/(app)/npc/${npc.id}`)}
              activeOpacity={0.85}
            >
              <Card glow>
                <View className="flex-row items-center gap-4">
                  <View className="w-16 h-16 bg-surface-3 rounded-2xl items-center justify-center">
                    <Text className="text-4xl">{npc.avatarEmoji}</Text>
                  </View>
                  <View className="flex-1 gap-1">
                    <Text className="text-text-primary text-lg font-bold">{npc.name}</Text>
                    <Text className="text-text-secondary text-sm">{npc.role}</Text>
                    <Text className="text-text-muted text-xs" numberOfLines={1}>
                      {npc.personality}
                    </Text>
                  </View>
                  <View className="items-center gap-1">
                    <View
                      className={`rounded-full px-2 py-0.5 ${
                        npc.knownLanguageLevel === "beginner"
                          ? "bg-sage/20"
                          : npc.knownLanguageLevel === "intermediate"
                          ? "bg-gold/20"
                          : "bg-ember/20"
                      }`}
                    >
                      <Text
                        className={`text-xs capitalize font-bold ${
                          npc.knownLanguageLevel === "beginner"
                            ? "text-sage"
                            : npc.knownLanguageLevel === "intermediate"
                            ? "text-gold"
                            : "text-ember"
                        }`}
                      >
                        {npc.knownLanguageLevel}
                      </Text>
                    </View>
                    <Text className="text-mystic-light text-lg">→</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
