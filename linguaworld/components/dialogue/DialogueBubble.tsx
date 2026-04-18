import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { DialogueMessage, LanguageCorrection } from "@/types";

type DialogueBubbleProps = {
  message: DialogueMessage;
  npcName?: string;
  npcEmoji?: string;
};

export function DialogueBubble({ message, npcName, npcEmoji }: DialogueBubbleProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const isUser = message.role === "user";

  return (
    <View className={`mb-3 ${isUser ? "items-end" : "items-start"}`}>
      {/* NPC label */}
      {!isUser && npcName && (
        <View className="flex-row items-center gap-1 mb-1 ml-1">
          <Text className="text-base">{npcEmoji}</Text>
          <Text className="text-text-muted text-xs">{npcName}</Text>
        </View>
      )}

      {/* Bubble */}
      <TouchableOpacity
        activeOpacity={message.translation ? 0.8 : 1}
        onPress={() => message.translation && setShowTranslation((v) => !v)}
        className={`
          max-w-[80%] px-4 py-3 rounded-2xl
          ${isUser
            ? "bg-mystic rounded-tr-sm"
            : "bg-surface-2 border border-border rounded-tl-sm"
          }
        `}
      >
        <Text
          className={`text-base leading-relaxed ${isUser ? "text-white" : "text-text-primary"}`}
        >
          {message.content}
        </Text>

        {/* Translation toggle */}
        {message.translation && (
          <View className={`mt-2 pt-2 border-t ${isUser ? "border-white/20" : "border-border"}`}>
            {showTranslation ? (
              <Text className="text-sm text-text-muted italic">{message.translation}</Text>
            ) : (
              <Text className={`text-xs ${isUser ? "text-white/60" : "text-text-muted"}`}>
                Tap to translate
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Language corrections */}
      {message.corrections && message.corrections.length > 0 && (
        <View className="mt-2 ml-1 max-w-[80%]">
          {message.corrections.map((correction, i) => (
            <CorrectionChip key={i} correction={correction} />
          ))}
        </View>
      )}
    </View>
  );
}

function CorrectionChip({ correction }: { correction: LanguageCorrection }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      onPress={() => setExpanded((v) => !v)}
      className="bg-ember/10 border border-ember/30 rounded-lg px-3 py-2 mb-1"
    >
      <View className="flex-row items-center gap-2">
        <Text className="text-xs">✏️</Text>
        <View className="flex-1">
          <Text className="text-ember-light text-xs">
            <Text className="line-through opacity-60">{correction.original}</Text>
            {" → "}
            <Text className="font-bold">{correction.corrected}</Text>
          </Text>
          {expanded && (
            <Text className="text-text-muted text-xs mt-1">{correction.explanation}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
