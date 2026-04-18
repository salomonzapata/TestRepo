import { View, Text, TouchableOpacity, Linking } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { signInWithGoogle, signInWithApple } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);

  const handleGoogle = async () => {
    setLoadingGoogle(true);
    try {
      const { data, error } = await signInWithGoogle();
      if (error) throw error;
      if (data.url) {
        await WebBrowser.openAuthSessionAsync(data.url, "linguaworld://auth/callback");
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleApple = async () => {
    setLoadingApple(true);
    try {
      const { data, error } = await signInWithApple();
      if (error) throw error;
      if (data.url) {
        await WebBrowser.openAuthSessionAsync(data.url, "linguaworld://auth/callback");
      }
    } catch (err) {
      console.error("Apple sign-in error:", err);
    } finally {
      setLoadingApple(false);
    }
  };

  return (
    <LinearGradient colors={["#0f0a1e", "#1a1230", "#0f0a1e"]} className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-8 justify-between py-12">
          {/* Hero */}
          <View className="flex-1 items-center justify-center gap-6">
            <View className="items-center gap-2">
              <Text className="text-8xl mb-2">🌐</Text>
              <Text className="text-5xl font-bold text-text-primary tracking-widest">
                LINGUA
              </Text>
              <Text className="text-5xl font-bold text-glow tracking-widest">
                WORLD
              </Text>
            </View>

            <View className="items-center gap-2 mt-4">
              <Text className="text-text-secondary text-lg text-center leading-relaxed">
                Learn any language through
              </Text>
              <Text className="text-mystic-light text-lg font-bold text-center">
                your own immersive story
              </Text>
            </View>

            {/* Feature chips */}
            <View className="flex-row flex-wrap justify-center gap-2 mt-4">
              {[
                "🧙 AI world builder",
                "💬 Live NPC dialogue",
                "📖 Adaptive quests",
                "🎤 Pronunciation AI",
              ].map((feat) => (
                <View key={feat} className="bg-surface-2 border border-border rounded-full px-3 py-1.5">
                  <Text className="text-text-secondary text-xs">{feat}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Auth buttons */}
          <View className="gap-3">
            <Button
              onPress={handleGoogle}
              loading={loadingGoogle}
              variant="secondary"
              fullWidth
              icon={<Text className="text-base">G</Text>}
            >
              Continue with Google
            </Button>

            {Platform.OS === "ios" && (
              <Button
                onPress={handleApple}
                loading={loadingApple}
                variant="secondary"
                fullWidth
                icon={<Text className="text-base"></Text>}
              >
                Continue with Apple
              </Button>
            )}

            <Text className="text-text-muted text-xs text-center mt-2">
              By continuing you agree to our Terms of Service
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
