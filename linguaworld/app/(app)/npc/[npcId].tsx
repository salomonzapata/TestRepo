import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useAppStore } from "@/lib/store";
import { getNPCDialogueResponse } from "@/lib/claude";
import { saveDialogueMessage, getDialogueHistory } from "@/lib/supabase";
import { DialogueBubble } from "@/components/dialogue/DialogueBubble";
import { DialogueMessage } from "@/types";

export default function NPCDialogueScreen() {
  const { npcId } = useLocalSearchParams<{ npcId: string }>();
  const { npcs, activeWorld, session } = useAppStore();
  const npc = npcs.find((n) => n.id === npcId);

  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    loadHistory();
  }, [npcId]);

  const loadHistory = async () => {
    if (!session?.user || !npcId) return;
    const { data } = await getDialogueHistory(session.user.id, npcId);
    if (data) {
      setMessages(
        data.map((d) => ({
          id: d.id,
          role: d.role as "user" | "npc",
          content: d.content,
          translation: d.translation,
          corrections: d.corrections,
          timestamp: d.created_at,
        }))
      );
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !npc || !activeWorld || !session?.user) return;

    const userMsg: DialogueMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setHint(null);

    try {
      const response = await getNPCDialogueResponse({
        npc: {
          name: npc.name,
          role: npc.role,
          personality: npc.personality,
          knownLanguageLevel: npc.knownLanguageLevel,
        },
        worldContext: activeWorld.lore.slice(0, 300),
        conversationHistory: messages.slice(-8).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        userMessage: input.trim(),
        targetLanguage: activeWorld.targetLanguage,
        nativeLanguage: activeWorld.nativeLanguage,
        userLevel: 3,
      });

      const npcMsg: DialogueMessage = {
        id: (Date.now() + 1).toString(),
        role: "npc",
        content: response.npcReply,
        translation: response.npcReplyTranslation,
        corrections: response.userCorrections,
        timestamp: new Date().toISOString(),
      };

      // Add corrections to user message
      if (response.userCorrections?.length) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsg.id ? { ...m, corrections: response.userCorrections } : m
          )
        );
      }

      setMessages((prev) => [...prev, npcMsg]);
      if (response.hint) setHint(response.hint);

      // TTS
      Speech.speak(response.npcReply, {
        language: activeWorld.targetLanguage,
        rate: 0.85,
      });

      // Persist
      await Promise.all([
        saveDialogueMessage({
          user_id: session.user.id,
          npc_id: npcId,
          role: "user",
          content: userMsg.content,
          corrections: response.userCorrections,
        }),
        saveDialogueMessage({
          user_id: session.user.id,
          npc_id: npcId,
          role: "npc",
          content: response.npcReply,
          translation: response.npcReplyTranslation,
        }),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!npc || !activeWorld) {
    return (
      <View className="flex-1 bg-void items-center justify-center">
        <Text className="text-text-secondary">NPC not found</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#0f0a1e", "#1a1230"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center px-4 py-3 border-b border-border gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-mystic-light text-lg">←</Text>
            </TouchableOpacity>
            <Text className="text-3xl">{npc.avatarEmoji}</Text>
            <View className="flex-1">
              <Text className="text-text-primary font-bold">{npc.name}</Text>
              <Text className="text-text-muted text-xs">{npc.role}</Text>
            </View>
            <View className="bg-surface-2 rounded-full px-2 py-1">
              <Text className="text-text-muted text-xs capitalize">
                {npc.knownLanguageLevel}
              </Text>
            </View>
          </View>

          {/* Messages */}
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DialogueBubble
                message={item}
                npcName={item.role === "npc" ? npc.name : undefined}
                npcEmoji={item.role === "npc" ? npc.avatarEmoji : undefined}
              />
            )}
            contentContainerStyle={{ padding: 16, gap: 4 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListHeaderComponent={
              messages.length === 0 ? (
                <View className="items-center gap-3 py-8">
                  <Text className="text-5xl">{npc.avatarEmoji}</Text>
                  <Text className="text-text-primary font-bold text-lg">{npc.name}</Text>
                  <Text className="text-text-secondary text-sm text-center">{npc.personality}</Text>
                  <Text className="text-text-muted text-xs text-center">
                    Speak in {activeWorld.targetLanguage}. Tap a message to see the translation.
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              loading ? (
                <View className="items-start pl-2 py-2">
                  <View className="bg-surface-2 border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                    <Text className="text-text-muted text-sm">
                      {npc.name} is thinking...
                    </Text>
                  </View>
                </View>
              ) : hint ? (
                <View className="bg-gold/10 border border-gold/30 rounded-xl px-3 py-2 mx-2 mb-2">
                  <Text className="text-gold-light text-xs">💡 {hint}</Text>
                </View>
              ) : null
            }
          />

          {/* Input */}
          <View className="px-4 pb-4 pt-2 border-t border-border flex-row gap-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={`Reply in ${activeWorld.targetLanguage}...`}
              placeholderTextColor="#6b5f8a"
              className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-3 text-text-primary text-base"
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              editable={!loading}
              multiline
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={loading || !input.trim()}
              className={`bg-mystic rounded-xl w-12 items-center justify-center ${loading || !input.trim() ? "opacity-40" : ""}`}
            >
              <Text className="text-white text-xl">→</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
