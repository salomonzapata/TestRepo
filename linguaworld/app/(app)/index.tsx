import { useEffect, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "@/lib/store";
import { getWorldsByUser } from "@/lib/supabase";
import { useWorld } from "@/lib/hooks/useWorld";
import { XPBar } from "@/components/ui/XPBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { getLanguageByCode } from "@/constants/languages";
import { getLevelFromXp } from "@/constants/worlds";

export default function HomeScreen() {
  const { session, activeWorld, progress, quests, npcs } = useAppStore();
  const { loadWorld } = useWorld();
  const [loading, setLoading] = useState(true);
  const [worlds, setWorlds] = useState<any[]>([]);

  useEffect(() => {
    if (!session?.user) return;
    loadUserWorlds();
  }, [session]);

  const loadUserWorlds = async () => {
    setLoading(true);
    try {
      const { data } = await getWorldsByUser(session!.user.id);
      if (data) setWorlds(data);
      if (data && data.length > 0 && !activeWorld) {
        await loadWorld(data[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingOverlay message="Loading your realm..." />;

  if (!activeWorld) {
    return (
      <LinearGradient colors={["#0f0a1e", "#1a1230"]} className="flex-1">
        <SafeAreaView className="flex-1 px-6 justify-center items-center gap-8">
          <Text className="text-7xl">🌌</Text>
          <View className="items-center gap-3">
            <Text className="text-text-primary text-2xl font-bold text-center">
              No worlds yet
            </Text>
            <Text className="text-text-secondary text-base text-center">
              Create your first immersive world to begin your language journey
            </Text>
          </View>
          <Button onPress={() => router.push("/(app)/onboarding")} fullWidth>
            Create Your World
          </Button>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const targetLang = getLanguageByCode(activeWorld.targetLanguage);
  const activeQuests = quests.filter((q) => !q.completed);
  const level = progress ? getLevelFromXp(progress.xp) : 1;

  return (
    <LinearGradient colors={["#0f0a1e", "#1a1230"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, gap: 16 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="text-text-muted text-xs uppercase tracking-widest">
                Your Realm
              </Text>
              <Text className="text-text-primary text-2xl font-bold">{activeWorld.name}</Text>
            </View>
            <View className="items-end gap-1">
              <Text className="text-gold text-sm font-bold">Level {level}</Text>
              {targetLang && (
                <Text className="text-text-secondary text-xs">
                  {targetLang.flag} {targetLang.name}
                </Text>
              )}
            </View>
          </View>

          {/* XP Bar */}
          {progress && (
            <Card>
              <View className="gap-3">
                <XPBar xp={progress.xp} />
                <View className="flex-row items-center gap-4">
                  <View className="items-center">
                    <Text className="text-text-primary font-bold">{progress.streak}</Text>
                    <Text className="text-text-muted text-xs">🔥 Streak</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-text-primary font-bold">{quests.filter((q) => q.completed).length}</Text>
                    <Text className="text-text-muted text-xs">⚔️ Quests</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-text-primary font-bold">{npcs.length}</Text>
                    <Text className="text-text-muted text-xs">💬 NPCs</Text>
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* Opening narrative / lore */}
          <Card glow>
            <Text className="text-rune text-xs font-bold uppercase tracking-widest mb-2">
              World Lore
            </Text>
            <Text className="text-text-secondary text-sm leading-relaxed" numberOfLines={4}>
              {activeWorld.lore}
            </Text>
            <TouchableOpacity className="mt-2">
              <Text className="text-mystic-light text-xs">Read more →</Text>
            </TouchableOpacity>
          </Card>

          {/* Active quest callout */}
          {activeQuests.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push(`/(app)/quest/${activeQuests[0].id}`)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#2d1b5e", "#3d2878"]}
                className="rounded-2xl p-4 border border-mystic/60"
              >
                <Text className="text-mystic-light text-xs font-bold uppercase tracking-widest mb-1">
                  Continue Quest
                </Text>
                <Text className="text-text-primary text-lg font-bold">
                  {activeQuests[0].title}
                </Text>
                <Text className="text-text-secondary text-sm mt-1" numberOfLines={2}>
                  {activeQuests[0].narrative.slice(0, 100)}...
                </Text>
                <View className="flex-row items-center justify-between mt-3">
                  <Text className="text-gold text-sm font-bold">
                    +{activeQuests[0].xpReward} XP
                  </Text>
                  <Text className="text-mystic-light text-sm">Begin →</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* NPCs preview */}
          {npcs.length > 0 && (
            <View className="gap-3">
              <Text className="text-text-primary font-bold text-lg">Inhabitants</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {npcs.map((npc) => (
                    <TouchableOpacity
                      key={npc.id}
                      onPress={() => router.push(`/(app)/npc/${npc.id}`)}
                      activeOpacity={0.85}
                    >
                      <Card className="items-center gap-2 w-28">
                        <Text className="text-4xl">{npc.avatarEmoji}</Text>
                        <Text className="text-text-primary text-xs font-bold text-center">
                          {npc.name}
                        </Text>
                        <Text className="text-text-muted text-xs text-center" numberOfLines={1}>
                          {npc.role}
                        </Text>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Other worlds */}
          <Button
            onPress={() => router.push("/(app)/onboarding")}
            variant="ghost"
            fullWidth
            icon={<Text>✨</Text>}
          >
            Create New World
          </Button>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
