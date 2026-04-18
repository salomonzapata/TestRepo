import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/lib/store";

export default function AppLayout() {
  const session = useAppStore((s) => s.session);

  useEffect(() => {
    if (!session) router.replace("/(auth)/login");
  }, [session]);

  if (!session) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1a1230",
          borderTopColor: "#3d2878",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#a855f7",
        tabBarInactiveTintColor: "#6b5f8a",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "World",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🌍</Text>,
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: "Quests",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚔️</Text>,
        }}
      />
      <Tabs.Screen
        name="dialogue"
        options={{
          title: "NPCs",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💬</Text>,
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: "Lessons",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📖</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
      {/* Hidden screens (not shown in tab bar) */}
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="quest/[id]" options={{ href: null }} />
      <Tabs.Screen name="npc/[npcId]" options={{ href: null }} />
    </Tabs>
  );
}
