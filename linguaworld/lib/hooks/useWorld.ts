import { useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { generateWorld, generateQuest, GeneratedWorld } from "@/lib/claude";
import {
  createWorld,
  getWorldsByUser,
  saveQuest,
  getQuestsByWorld,
  getNPCsByWorld,
  saveNPC,
  getUserProgress,
  upsertUserProgress,
} from "@/lib/supabase";
import { WorldGenre } from "@/types";

export function useWorld() {
  const { session, activeWorld, setActiveWorld, setQuests, setNpcs, setProgress } = useAppStore();

  const buildWorld = useCallback(
    async (params: {
      userDescription: string;
      genre: WorldGenre;
      targetLanguage: string;
      nativeLanguage: string;
      userName: string;
    }) => {
      if (!session?.user) throw new Error("Not authenticated");

      // Generate world with AI
      const generated: GeneratedWorld = await generateWorld(params);

      // Persist to Supabase
      const { data: worldData, error: worldError } = await createWorld({
        user_id: session.user.id,
        name: generated.name,
        description: params.userDescription,
        genre: params.genre,
        target_language: params.targetLanguage,
        native_language: params.nativeLanguage,
        lore: generated.lore,
        opening_narrative: generated.openingNarrative,
      });

      if (worldError || !worldData) throw worldError ?? new Error("Failed to create world");

      // Save NPCs
      const savedNpcs = await Promise.all(
        generated.npcs.map((npc) =>
          saveNPC({
            world_id: worldData.id,
            name: npc.name,
            role: npc.role,
            personality: npc.personality,
            avatar_emoji: npc.avatarEmoji,
            language_level: npc.languageLevel,
          })
        )
      );

      // Generate opening quest
      const questData = await generateQuest({
        worldLore: generated.lore,
        worldName: generated.name,
        targetLanguage: params.targetLanguage,
        nativeLanguage: params.nativeLanguage,
        difficulty: 1,
        userName: params.userName,
      });

      const { data: savedQuest } = await saveQuest({
        world_id: worldData.id,
        title: questData.title,
        narrative: questData.narrative,
        choices: questData.choices,
        vocabulary_focus: questData.vocabularyFocus,
        grammar_focus: questData.grammarFocus,
        difficulty: questData.difficulty,
        xp_reward: questData.xpReward,
      });

      // Init progress
      await upsertUserProgress({
        user_id: session.user.id,
        world_id: worldData.id,
        xp: 0,
        streak: 1,
        last_active_date: new Date().toISOString(),
      });

      const world = {
        id: worldData.id,
        userId: session.user.id,
        name: worldData.name,
        description: worldData.description,
        genre: worldData.genre,
        targetLanguage: worldData.target_language,
        nativeLanguage: worldData.native_language,
        lore: worldData.lore,
        openingNarrative: worldData.opening_narrative,
        createdAt: worldData.created_at,
      };

      setActiveWorld(world);
      if (savedQuest) {
        setQuests([
          {
            id: savedQuest.id,
            worldId: worldData.id,
            title: savedQuest.title,
            narrative: savedQuest.narrative,
            choices: savedQuest.choices,
            vocabularyFocus: savedQuest.vocabulary_focus,
            grammarFocus: savedQuest.grammar_focus,
            difficulty: savedQuest.difficulty,
            completed: false,
            xpReward: savedQuest.xp_reward,
          },
        ]);
      }

      const npcList = savedNpcs
        .filter((r) => r.data)
        .map((r) => ({
          id: r.data!.id,
          worldId: worldData.id,
          name: r.data!.name,
          role: r.data!.role,
          personality: r.data!.personality,
          avatarEmoji: r.data!.avatar_emoji,
          knownLanguageLevel: r.data!.language_level,
        }));
      setNpcs(npcList);

      return world;
    },
    [session]
  );

  const loadWorld = useCallback(
    async (worldId: string) => {
      if (!session?.user) return;

      const [worldRes, questsRes, npcsRes, progressRes] = await Promise.all([
        import("@/lib/supabase").then((m) => m.getWorld(worldId)),
        getQuestsByWorld(worldId),
        getNPCsByWorld(worldId),
        getUserProgress(session.user.id, worldId),
      ]);

      if (worldRes.data) {
        const w = worldRes.data;
        setActiveWorld({
          id: w.id,
          userId: w.user_id,
          name: w.name,
          description: w.description,
          genre: w.genre,
          targetLanguage: w.target_language,
          nativeLanguage: w.native_language,
          lore: w.lore,
          openingNarrative: w.opening_narrative,
          createdAt: w.created_at,
        });
      }

      if (questsRes.data) {
        setQuests(
          questsRes.data.map((q) => ({
            id: q.id,
            worldId: q.world_id,
            title: q.title,
            narrative: q.narrative,
            choices: q.choices,
            vocabularyFocus: q.vocabulary_focus,
            grammarFocus: q.grammar_focus,
            difficulty: q.difficulty,
            completed: false,
            xpReward: q.xp_reward,
          }))
        );
      }

      if (npcsRes.data) {
        setNpcs(
          npcsRes.data.map((n) => ({
            id: n.id,
            worldId: n.world_id,
            name: n.name,
            role: n.role,
            personality: n.personality,
            avatarEmoji: n.avatar_emoji,
            knownLanguageLevel: n.language_level,
          }))
        );
      }

      if (progressRes.data) {
        setProgress({
          userId: progressRes.data.user_id,
          worldId: progressRes.data.world_id,
          xp: progressRes.data.xp,
          level: 1,
          streak: progressRes.data.streak,
          lastActiveDate: progressRes.data.last_active_date,
          completedQuests: [],
          vocabularyMastered: [],
          pronunciationScore: 0,
        });
      }
    },
    [session]
  );

  return { activeWorld, buildWorld, loadWorld };
}
