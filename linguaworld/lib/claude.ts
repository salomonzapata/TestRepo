import Anthropic from "@anthropic-ai/sdk";
import { NPC, Quest, VocabularyItem, WorldGenre } from "@/types";

const client = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true, // Required for Expo web; use a server proxy for production
});

const MODEL = "claude-sonnet-4-6";

// ─── World Generation ─────────────────────────────────────────────────────────

export type GeneratedWorld = {
  name: string;
  lore: string;
  openingNarrative: string;
  npcs: Array<{
    name: string;
    role: string;
    personality: string;
    avatarEmoji: string;
    languageLevel: "beginner" | "intermediate" | "advanced";
  }>;
};

export async function generateWorld(params: {
  userDescription: string;
  genre: WorldGenre;
  targetLanguage: string;
  nativeLanguage: string;
  userName: string;
}): Promise<GeneratedWorld> {
  const { userDescription, genre, targetLanguage, nativeLanguage, userName } = params;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are the world-builder for LinguaWorld, an immersive language learning app.

The user wants to learn ${targetLanguage} (their native language: ${nativeLanguage}).
Their character name: ${userName}
Genre: ${genre}
Their world concept: "${userDescription}"

Generate a vivid, immersive world for them. Return ONLY valid JSON matching this schema:
{
  "name": "string (evocative world name)",
  "lore": "string (3-4 paragraphs of rich world lore that naturally weaves in why the target language matters here)",
  "openingNarrative": "string (2-3 paragraphs in second-person 'you' perspective, introducing the player to their world and their first challenge — end with a hook that makes them want to learn the language)",
  "npcs": [
    {
      "name": "string",
      "role": "string (their role in this world)",
      "personality": "string (2-3 adjectives + one distinguishing trait)",
      "avatarEmoji": "string (single emoji that fits them)",
      "languageLevel": "beginner | intermediate | advanced (how patient they are with language learners)"
    }
  ]
}

Include 3-4 diverse NPCs. Make the world feel alive and the language learning feel essential to survival or success.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse world generation response");
  return JSON.parse(jsonMatch[0]) as GeneratedWorld;
}

// ─── Quest Generation ─────────────────────────────────────────────────────────

export async function generateQuest(params: {
  worldLore: string;
  worldName: string;
  targetLanguage: string;
  nativeLanguage: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  previousQuestSummary?: string;
  userName: string;
}): Promise<Omit<Quest, "id" | "worldId" | "completed">> {
  const { worldLore, worldName, targetLanguage, nativeLanguage, difficulty, previousQuestSummary, userName } = params;

  const difficultyDescriptions = {
    1: "absolute beginner (single words, greetings, numbers)",
    2: "elementary (simple phrases, present tense)",
    3: "intermediate (full sentences, past/future tense, basic conversation)",
    4: "upper-intermediate (complex grammar, idiomatic expressions)",
    5: "advanced (nuanced language, cultural references, complex structures)",
  };

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2500,
    messages: [
      {
        role: "user",
        content: `You are the quest master for LinguaWorld.

World: ${worldName}
Lore: ${worldLore}
Player name: ${userName}
Target language: ${targetLanguage}
Native language: ${nativeLanguage}
Difficulty: ${difficulty}/5 — ${difficultyDescriptions[difficulty]}
${previousQuestSummary ? `Previous quest summary: ${previousQuestSummary}` : "This is the opening quest."}

Generate an immersive quest that teaches ${targetLanguage} at this difficulty level. Return ONLY valid JSON:
{
  "title": "string",
  "narrative": "string (3-4 paragraphs of immersive story in second-person, building tension toward a choice)",
  "choices": [
    {
      "id": "string (choice_1, choice_2, etc.)",
      "text": "string (THE CHOICE TEXT IN ${targetLanguage})",
      "transliteration": "string (only if non-latin script, otherwise omit)",
      "translation": "string (translation in ${nativeLanguage})",
      "consequence": "string (2-3 sentences of what happens next, in ${nativeLanguage})"
    }
  ],
  "vocabularyFocus": [
    {
      "word": "string (in ${targetLanguage})",
      "translation": "string (in ${nativeLanguage})",
      "exampleSentence": "string (in ${targetLanguage})",
      "exampleTranslation": "string (in ${nativeLanguage})",
      "partOfSpeech": "string"
    }
  ],
  "grammarFocus": "string (the grammar concept this quest teaches, explained briefly in ${nativeLanguage})",
  "difficulty": ${difficulty},
  "xpReward": number (50-200 based on difficulty)
}

Include 3 meaningful choices and 4-6 vocabulary items that appear naturally in the story.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse quest generation response");
  return JSON.parse(jsonMatch[0]);
}

// ─── NPC Dialogue ─────────────────────────────────────────────────────────────

export type DialogueResponse = {
  npcReply: string;
  npcReplyTranslation: string;
  userCorrections?: Array<{
    original: string;
    corrected: string;
    explanation: string;
  }>;
  hint?: string;
  vocabularyNote?: string;
};

export async function getNPCDialogueResponse(params: {
  npc: Pick<NPC, "name" | "role" | "personality" | "knownLanguageLevel">;
  worldContext: string;
  conversationHistory: Array<{ role: "user" | "npc"; content: string }>;
  userMessage: string;
  targetLanguage: string;
  nativeLanguage: string;
  userLevel: number;
}): Promise<DialogueResponse> {
  const { npc, worldContext, conversationHistory, userMessage, targetLanguage, nativeLanguage, userLevel } = params;

  const historyFormatted = conversationHistory
    .slice(-8) // last 4 exchanges
    .map((m) => `${m.role === "user" ? "Player" : npc.name}: ${m.content}`)
    .join("\n");

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `You are ${npc.name}, a ${npc.role} in this world. Personality: ${npc.personality}.
Language patience level: ${npc.knownLanguageLevel} (${
          npc.knownLanguageLevel === "beginner"
            ? "very patient, speaks slowly, uses simple words"
            : npc.knownLanguageLevel === "intermediate"
            ? "somewhat patient, gently corrects errors"
            : "expects reasonable fluency, uses idioms naturally"
        }).

World context: ${worldContext}

The player is learning ${targetLanguage} (native: ${nativeLanguage}). Player level: ${userLevel}/10.

Recent conversation:
${historyFormatted}
Player just said: "${userMessage}"

Respond as ${npc.name} in character. Return ONLY valid JSON:
{
  "npcReply": "string (your reply IN ${targetLanguage}, stay in character)",
  "npcReplyTranslation": "string (translation in ${nativeLanguage})",
  "userCorrections": [
    {
      "original": "string (what the player said incorrectly)",
      "corrected": "string (the correct ${targetLanguage} form)",
      "explanation": "string (brief explanation in ${nativeLanguage})"
    }
  ],
  "hint": "string or null (optional gentle hint for what to say next, in ${nativeLanguage})",
  "vocabularyNote": "string or null (optional interesting word/phrase from your reply worth highlighting)"
}

Only include corrections if there are actual language errors. Keep the reply immersive and in-character.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse NPC dialogue response");
  return JSON.parse(jsonMatch[0]);
}

// ─── Pronunciation Feedback ───────────────────────────────────────────────────

export async function getPronunciationFeedback(params: {
  targetLanguage: string;
  targetText: string;
  transcribedText: string;
  nativeLanguage: string;
}): Promise<{ score: number; feedback: string; tips: string[] }> {
  const { targetLanguage, targetText, transcribedText, nativeLanguage } = params;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Evaluate ${targetLanguage} pronunciation.

Target phrase: "${targetText}"
What the learner said (transcribed): "${transcribedText}"
Learner's native language: ${nativeLanguage}

Return ONLY valid JSON:
{
  "score": number (0-100, how close the pronunciation was),
  "feedback": "string (1-2 sentences of encouraging feedback in ${nativeLanguage})",
  "tips": ["string", "string"] (1-3 specific pronunciation tips for a ${nativeLanguage} speaker)
}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse pronunciation feedback");
  return JSON.parse(jsonMatch[0]);
}

// ─── Adaptive Vocabulary Quiz ─────────────────────────────────────────────────

export async function generateVocabularyQuiz(params: {
  vocabularyItems: VocabularyItem[];
  targetLanguage: string;
  nativeLanguage: string;
}): Promise<Array<{ question: string; answer: string; distractors: string[]; type: "translate" | "fill-blank" }>> {
  const { vocabularyItems, targetLanguage, nativeLanguage } = params;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: `Create vocabulary quiz questions for these ${targetLanguage} words (learner's native: ${nativeLanguage}):

${vocabularyItems.map((v) => `- ${v.word} (${v.translation}): "${v.exampleSentence}"`).join("\n")}

Return ONLY a valid JSON array:
[
  {
    "question": "string",
    "answer": "string (the correct answer)",
    "distractors": ["string", "string", "string"] (3 wrong answers),
    "type": "translate | fill-blank"
  }
]

Mix question types. For fill-blank, use the example sentence with a word blanked out.`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse quiz generation response");
  return JSON.parse(jsonMatch[0]);
}
