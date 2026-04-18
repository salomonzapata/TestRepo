import { WorldGenre } from "@/types";

export type WorldGenreInfo = {
  value: WorldGenre;
  label: string;
  emoji: string;
  description: string;
  examplePrompt: string;
};

export const WORLD_GENRES: WorldGenreInfo[] = [
  {
    value: "fantasy",
    label: "Fantasy",
    emoji: "🧙",
    description: "Magic, dragons, kingdoms, and ancient prophecies",
    examplePrompt:
      "A crumbling elven empire where magic is dying and only forgotten languages hold the key",
  },
  {
    value: "sci-fi",
    label: "Sci-Fi",
    emoji: "🚀",
    description: "Space travel, alien civilizations, and future technology",
    examplePrompt:
      "A generation ship mid-voyage where different colonist factions have developed their own dialects",
  },
  {
    value: "historical",
    label: "Historical",
    emoji: "⚔️",
    description: "Real or reimagined historical periods",
    examplePrompt:
      "The court of a Renaissance Italian city-state rife with political intrigue",
  },
  {
    value: "mystery",
    label: "Mystery",
    emoji: "🔍",
    description: "Detective noir, secrets, and hidden truths",
    examplePrompt:
      "A rain-soaked 1940s Paris where a stolen artifact holds clues only spoken in old French",
  },
  {
    value: "horror",
    label: "Horror",
    emoji: "🌑",
    description: "Gothic dread, supernatural forces, and survival",
    examplePrompt:
      "A cursed village in the Carpathian mountains where only the old prayers offer protection",
  },
  {
    value: "contemporary",
    label: "Contemporary",
    emoji: "🌆",
    description: "Modern-day settings with everyday drama",
    examplePrompt:
      "An international culinary school in Tokyo where students from 20 countries compete",
  },
  {
    value: "custom",
    label: "My Own",
    emoji: "✨",
    description: "Fully describe your unique world",
    examplePrompt: "",
  },
];

export const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5000];

export function getLevelFromXp(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXpToNextLevel(xp: number): { current: number; needed: number } {
  const level = getLevelFromXp(xp);
  const currentThreshold = XP_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  return {
    current: xp - currentThreshold,
    needed: nextThreshold - currentThreshold,
  };
}
