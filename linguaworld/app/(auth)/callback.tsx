import { useEffect } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export default function AuthCallback() {
  const params = useLocalSearchParams();

  useEffect(() => {
    const { access_token, refresh_token } = params as Record<string, string>;
    if (access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(() => router.replace("/(app)"));
    } else {
      router.replace("/(auth)/login");
    }
  }, [params]);

  return <LoadingOverlay message="Entering your world..." />;
}
