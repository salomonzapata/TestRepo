import { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppStore } from "@/lib/store";
import { useWorld } from "@/lib/hooks/useWorld";
import { WORLD_GENRES } from "@/constants/worlds";
import { SUPPORTED_LANGUAGES, NATIVE_LANGUAGES } from "@/constants/languages";
import { WorldGenre } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

type Step = "genre" | "description" | "languages" | "name" | "generating";

export default function OnboardingScreen() {
  const { session } = useAppStore();
  const { buildWorld } = useWorld();

  const [step, setStep] = useState<Step>("genre");
  const [genre, setGenre] = useState<WorldGenre>("fantasy");
  const [description, setDescription] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [nativeLanguage, setNativeLanguage] = useState("en");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedGenre = WORLD_GENRES.find((g) => g.value === genre)!;

  const handleGenreNext = () => {
    setStep("description");
  };

  const handleDescriptionNext = () => {
    if (!description.trim()) {
      setError("Please describe your world.");
      return;
    }
    setError(null);
    setStep("languages");
  };

  const handleLanguagesNext = () => {
    setStep("name");
  };

  const handleCreate = async () => {
    if (!userName.trim()) {
      setError("Please enter your character name.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await buildWorld({
        userDescription: description,
        genre,
        targetLanguage,
        nativeLanguage,
        userName,
      });
      router.replace("/(app)");
    } catch (err: any) {
      setError(err?.message ?? "Failed to create world. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingOverlay message="The AI is building your world..." />
    );
  }

  return (
    <LinearGradient colors={["#0f0a1e", "#1a1230"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 24, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Progress dots */}
            <View className="flex-row justify-center gap-2 mb-8">
              {(["genre", "description", "languages", "name"] as Step[]).map((s) => (
                <View
                  key={s}
                  className={`h-1.5 rounded-full ${step === s ? "w-6 bg-mystic" : "w-1.5 bg-surface-3"}`}
                />
              ))}
            </View>

            {/* STEP: Genre */}
            {step === "genre" && (
              <View className="flex-1 gap-6">
                <View className="gap-2">
                  <Text className="text-glow text-2xl font-bold">Choose your genre</Text>
                  <Text className="text-text-secondary">
                    The setting that shapes your language adventure
                  </Text>
                </View>

                <View className="gap-3">
                  {WORLD_GENRES.map((g) => (
                    <TouchableOpacity
                      key={g.value}
                      onPress={() => setGenre(g.value)}
                      activeOpacity={0.85}
                    >
                      <Card
                        glow={genre === g.value}
                        className={genre === g.value ? "border-mystic" : ""}
                      >
                        <View className="flex-row items-center gap-3">
                          <Text className="text-3xl">{g.emoji}</Text>
                          <View className="flex-1">
                            <Text className="text-text-primary font-bold">{g.label}</Text>
                            <Text className="text-text-muted text-xs">{g.description}</Text>
                          </View>
                          {genre === g.value && (
                            <Text className="text-mystic-light">✓</Text>
                          )}
                        </View>
                      </Card>
                    </TouchableOpacity>
                  ))}
                </View>

                <Button onPress={handleGenreNext} fullWidth>
                  Next
                </Button>
              </View>
            )}

            {/* STEP: Description */}
            {step === "description" && (
              <View className="flex-1 gap-6">
                <View className="gap-2">
                  <Text className="text-3xl">{selectedGenre.emoji}</Text>
                  <Text className="text-glow text-2xl font-bold">Describe your world</Text>
                  <Text className="text-text-secondary">
                    The AI will bring it to life. Be as creative as you like.
                  </Text>
                </View>

                {selectedGenre.examplePrompt && (
                  <TouchableOpacity
                    onPress={() => setDescription(selectedGenre.examplePrompt)}
                    className="bg-surface-2 border border-mystic/30 rounded-xl p-3"
                  >
                    <Text className="text-text-muted text-xs mb-1">💡 Example — tap to use:</Text>
                    <Text className="text-text-secondary text-sm italic">
                      "{selectedGenre.examplePrompt}"
                    </Text>
                  </TouchableOpacity>
                )}

                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe your world..."
                  placeholderTextColor="#6b5f8a"
                  multiline
                  numberOfLines={5}
                  className="bg-surface-2 border border-border rounded-xl p-4 text-text-primary text-base"
                  style={{ minHeight: 120, textAlignVertical: "top" }}
                />

                {error && <Text className="text-red-400 text-sm">{error}</Text>}

                <View className="flex-row gap-3">
                  <Button onPress={() => setStep("genre")} variant="ghost">
                    Back
                  </Button>
                  <View className="flex-1">
                    <Button onPress={handleDescriptionNext} fullWidth>
                      Next
                    </Button>
                  </View>
                </View>
              </View>
            )}

            {/* STEP: Languages */}
            {step === "languages" && (
              <View className="flex-1 gap-6">
                <View className="gap-2">
                  <Text className="text-glow text-2xl font-bold">Choose languages</Text>
                  <Text className="text-text-secondary">
                    What language are you learning? What do you speak natively?
                  </Text>
                </View>

                <View className="gap-4">
                  <View className="gap-2">
                    <Text className="text-text-primary font-bold">I want to learn:</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8 }}
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <TouchableOpacity
                          key={lang.code}
                          onPress={() => setTargetLanguage(lang.code)}
                          className={`
                            px-4 py-2 rounded-full border items-center
                            ${targetLanguage === lang.code
                              ? "bg-mystic border-mystic-light"
                              : "bg-surface-2 border-border"
                            }
                          `}
                        >
                          <Text className="text-lg">{lang.flag}</Text>
                          <Text className={`text-xs mt-0.5 ${targetLanguage === lang.code ? "text-white font-bold" : "text-text-muted"}`}>
                            {lang.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View className="gap-2">
                    <Text className="text-text-primary font-bold">My native language:</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 8 }}
                    >
                      {NATIVE_LANGUAGES.filter((l) => l.code !== targetLanguage).map((lang) => (
                        <TouchableOpacity
                          key={lang.code}
                          onPress={() => setNativeLanguage(lang.code)}
                          className={`
                            px-4 py-2 rounded-full border items-center
                            ${nativeLanguage === lang.code
                              ? "bg-rune border-rune-light"
                              : "bg-surface-2 border-border"
                            }
                          `}
                        >
                          <Text className="text-lg">{lang.flag}</Text>
                          <Text className={`text-xs mt-0.5 ${nativeLanguage === lang.code ? "text-white font-bold" : "text-text-muted"}`}>
                            {lang.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <Button onPress={() => setStep("description")} variant="ghost">
                    Back
                  </Button>
                  <View className="flex-1">
                    <Button onPress={handleLanguagesNext} fullWidth>
                      Next
                    </Button>
                  </View>
                </View>
              </View>
            )}

            {/* STEP: Character name */}
            {step === "name" && (
              <View className="flex-1 gap-6">
                <View className="gap-2">
                  <Text className="text-glow text-2xl font-bold">Your character</Text>
                  <Text className="text-text-secondary">
                    What name will you carry into this world?
                  </Text>
                </View>

                <TextInput
                  value={userName}
                  onChangeText={setUserName}
                  placeholder="Enter your character name..."
                  placeholderTextColor="#6b5f8a"
                  className="bg-surface-2 border border-border rounded-xl p-4 text-text-primary text-lg text-center"
                  autoFocus
                />

                {error && <Text className="text-red-400 text-sm text-center">{error}</Text>}

                <Card className="items-center gap-2">
                  <Text className="text-text-muted text-xs uppercase tracking-widest">Your Journey</Text>
                  <Text className="text-text-secondary text-sm text-center">
                    {selectedGenre.emoji} {selectedGenre.label} world
                  </Text>
                  <Text className="text-text-secondary text-sm text-center" numberOfLines={2}>
                    "{description}"
                  </Text>
                  <Text className="text-glow text-sm font-bold">
                    Learning:{" "}
                    {SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage)?.flag}{" "}
                    {SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage)?.name}
                  </Text>
                </Card>

                <View className="flex-row gap-3">
                  <Button onPress={() => setStep("languages")} variant="ghost">
                    Back
                  </Button>
                  <View className="flex-1">
                    <Button onPress={handleCreate} fullWidth loading={loading}>
                      Create World
                    </Button>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
