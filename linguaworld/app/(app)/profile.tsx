import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "@/lib/store";
import { signOut } from "@/lib/supabase";
import { XPBar } from "@/components/ui/XPBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getLanguageByCode } from "@/constants/languages";
import { getLevelFromXp } from "@/constants/worlds";

export default function ProfileScreen() {
  const { session, activeWorld, progress, quests, npcs, setSession, setActiveWorld } = useAppStore();
  const user = session?.user;

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          setSession(null);
          setActiveWorld(null);
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const targetLang = activeWorld ? getLanguageByCode(activeWorld.targetLanguage) : null;
  const nativeLang = activeWorld ? getLanguageByCode(activeWorld.nativeLanguage) : null;
  const level = progress ? getLevelFromXp(progress.xp) : 1;
  const completedQuests = quests.filter((q) => q.completed).length;

  return (
    <LinearGradient colors={["#0f0a1e", "#1a1230"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, gap: 16 }}>
          {/* Profile header */}
          <View className="items-center gap-3 py-4">
            <View className="w-20 h-20 bg-arcane border-2 border-mystic rounded-full items-center justify-center">
              <Text className="text-4xl">
                {user?.user_metadata?.avatar_url ? "👤" : "🧙"}
              </Text>
            </View>
            <View className="items-center gap-1">
              <Text className="text-text-primary text-xl font-bold">
                {user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Adventurer"}
              </Text>
              <Text className="text-text-muted text-sm">{user?.email}</Text>
            </View>
          </View>

          {/* World summary */}
          {activeWorld && (
            <Card glow>
              <Text className="text-rune text-xs font-bold uppercase tracking-widest mb-3">
                Active World
              </Text>
              <View className="gap-2">
                <Text className="text-text-primary font-bold text-lg">{activeWorld.name}</Text>
                {targetLang && nativeLang && (
                  <Text className="text-text-secondary text-sm">
                    {nativeLang.flag} {nativeLang.name} → {targetLang.flag} {targetLang.name}
                  </Text>
                )}
                {progress && <XPBar xp={progress.xp} />}
              </View>
            </Card>
          )}

          {/* Stats grid */}
          <View className="flex-row gap-3">
            {[
              { label: "Level", value: level, emoji: "⭐" },
              { label: "Streak", value: progress?.streak ?? 0, emoji: "🔥" },
              { label: "Quests", value: completedQuests, emoji: "⚔️" },
              { label: "NPCs Met", value: npcs.length, emoji: "💬" },
            ].map((stat) => (
              <Card key={stat.label} className="flex-1 items-center gap-1">
                <Text className="text-xl">{stat.emoji}</Text>
                <Text className="text-text-primary font-bold text-lg">{stat.value}</Text>
                <Text className="text-text-muted text-xs">{stat.label}</Text>
              </Card>
            ))}
          </View>

          {/* Vocabulary mastered */}
          {quests.length > 0 && (
            <Card>
              <Text className="text-rune text-xs font-bold uppercase tracking-widest mb-2">
                Vocabulary Learned
              </Text>
              <Text className="text-text-primary text-3xl font-bold">
                {quests.reduce((acc, q) => acc + (q.vocabularyFocus?.length ?? 0), 0)}
              </Text>
              <Text className="text-text-muted text-xs">words encountered across all quests</Text>
            </Card>
          )}

          {/* Switch world */}
          <Button
            onPress={() => router.push("/(app)/onboarding")}
            variant="ghost"
            fullWidth
            icon={<Text>✨</Text>}
          >
            Create New World
          </Button>

          <Button onPress={handleSignOut} variant="danger" fullWidth>
            Sign Out
          </Button>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
