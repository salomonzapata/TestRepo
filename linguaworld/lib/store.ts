import { create } from "zustand";
import { World, UserProgress, Quest, NPC } from "@/types";
import { Session } from "@supabase/supabase-js";

type AppState = {
  // Auth
  session: Session | null;
  setSession: (session: Session | null) => void;

  // Active world
  activeWorld: World | null;
  setActiveWorld: (world: World | null) => void;

  // Progress
  progress: UserProgress | null;
  setProgress: (progress: UserProgress | null) => void;
  addXp: (amount: number) => void;

  // Quests
  quests: Quest[];
  setQuests: (quests: Quest[]) => void;
  addQuest: (quest: Quest) => void;
  markQuestComplete: (questId: string) => void;

  // NPCs
  npcs: NPC[];
  setNpcs: (npcs: NPC[]) => void;

  // Onboarding
  isOnboarded: boolean;
  setIsOnboarded: (value: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),

  activeWorld: null,
  setActiveWorld: (world) => set({ activeWorld: world }),

  progress: null,
  setProgress: (progress) => set({ progress }),
  addXp: (amount) =>
    set((state) => ({
      progress: state.progress
        ? { ...state.progress, xp: state.progress.xp + amount }
        : null,
    })),

  quests: [],
  setQuests: (quests) => set({ quests }),
  addQuest: (quest) => set((state) => ({ quests: [...state.quests, quest] })),
  markQuestComplete: (questId) =>
    set((state) => ({
      quests: state.quests.map((q) =>
        q.id === questId ? { ...q, completed: true } : q
      ),
    })),

  npcs: [],
  setNpcs: (npcs) => set({ npcs }),

  isOnboarded: false,
  setIsOnboarded: (value) => set({ isOnboarded: value }),
}));
