export type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
};

export type World = {
  id: string;
  userId: string;
  name: string;
  description: string; // user-provided world premise
  genre: WorldGenre;
  targetLanguage: string; // language code
  nativeLanguage: string; // language code
  lore: string; // AI-generated world lore
  openingNarrative: string; // AI-generated intro
  createdAt: string;
};

export type WorldGenre =
  | "fantasy"
  | "sci-fi"
  | "historical"
  | "contemporary"
  | "horror"
  | "mystery"
  | "custom";

export type Quest = {
  id: string;
  worldId: string;
  title: string;
  narrative: string; // AI-generated story text
  choices: QuestChoice[];
  vocabularyFocus: VocabularyItem[];
  grammarFocus: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  completed: boolean;
  xpReward: number;
};

export type QuestChoice = {
  id: string;
  text: string; // in target language
  transliteration?: string;
  translation: string;
  consequence: string; // AI-generated story continuation
  nextQuestHint?: string;
};

export type NPC = {
  id: string;
  worldId: string;
  name: string;
  role: string; // e.g. "Tavern keeper", "Space station commander"
  personality: string;
  avatarEmoji: string;
  knownLanguageLevel: "beginner" | "intermediate" | "advanced"; // NPC's tolerance for learner errors
};

export type DialogueMessage = {
  id: string;
  role: "user" | "npc";
  content: string;
  translation?: string;
  corrections?: LanguageCorrection[];
  timestamp: string;
};

export type LanguageCorrection = {
  original: string;
  corrected: string;
  explanation: string;
};

export type VocabularyItem = {
  word: string;
  translation: string;
  exampleSentence: string;
  exampleTranslation: string;
  partOfSpeech: string;
};

export type UserProgress = {
  userId: string;
  worldId: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  completedQuests: string[];
  vocabularyMastered: string[];
  pronunciationScore: number; // 0-100
};

export type OnboardingState = {
  worldDescription: string;
  genre: WorldGenre;
  targetLanguage: string;
  nativeLanguage: string;
  userName: string;
};
