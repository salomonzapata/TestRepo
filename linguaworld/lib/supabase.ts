import "react-native-url-polyfill/auto";
import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// Secure storage adapter for native platforms
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === "web" ? undefined : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});

// ─── Auth helpers ────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "linguaworld://auth/callback",
    },
  });
  return { data, error };
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: "linguaworld://auth/callback",
    },
  });
  return { data, error };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

// ─── World helpers ────────────────────────────────────────────────────────────

export async function createWorld(world: {
  user_id: string;
  name: string;
  description: string;
  genre: string;
  target_language: string;
  native_language: string;
  lore: string;
  opening_narrative: string;
}) {
  return supabase.from("worlds").insert(world).select().single();
}

export async function getWorldsByUser(userId: string) {
  return supabase
    .from("worlds")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function getWorld(worldId: string) {
  return supabase.from("worlds").select("*").eq("id", worldId).single();
}

// ─── Quest helpers ────────────────────────────────────────────────────────────

export async function saveQuest(quest: {
  world_id: string;
  title: string;
  narrative: string;
  choices: object;
  vocabulary_focus: object;
  grammar_focus: string;
  difficulty: number;
  xp_reward: number;
}) {
  return supabase.from("quests").insert(quest).select().single();
}

export async function getQuestsByWorld(worldId: string) {
  return supabase
    .from("quests")
    .select("*")
    .eq("world_id", worldId)
    .order("created_at", { ascending: true });
}

export async function markQuestComplete(questId: string, userId: string) {
  return supabase
    .from("user_quest_progress")
    .upsert({ quest_id: questId, user_id: userId, completed: true });
}

// ─── Progress helpers ─────────────────────────────────────────────────────────

export async function getUserProgress(userId: string, worldId: string) {
  return supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("world_id", worldId)
    .single();
}

export async function upsertUserProgress(progress: {
  user_id: string;
  world_id: string;
  xp: number;
  streak: number;
  last_active_date: string;
}) {
  return supabase.from("user_progress").upsert(progress);
}

// ─── NPC helpers ──────────────────────────────────────────────────────────────

export async function getNPCsByWorld(worldId: string) {
  return supabase.from("npcs").select("*").eq("world_id", worldId);
}

export async function saveNPC(npc: {
  world_id: string;
  name: string;
  role: string;
  personality: string;
  avatar_emoji: string;
  language_level: string;
}) {
  return supabase.from("npcs").insert(npc).select().single();
}

// ─── Dialogue history ─────────────────────────────────────────────────────────

export async function saveDialogueMessage(message: {
  user_id: string;
  npc_id: string;
  role: "user" | "npc";
  content: string;
  translation?: string;
  corrections?: object;
}) {
  return supabase.from("dialogue_history").insert(message);
}

export async function getDialogueHistory(userId: string, npcId: string) {
  return supabase
    .from("dialogue_history")
    .select("*")
    .eq("user_id", userId)
    .eq("npc_id", npcId)
    .order("created_at", { ascending: true })
    .limit(50);
}
