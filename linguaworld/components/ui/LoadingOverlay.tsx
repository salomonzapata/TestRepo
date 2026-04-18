import { View, Text, ActivityIndicator } from "react-native";

type LoadingOverlayProps = {
  message?: string;
};

export function LoadingOverlay({ message = "Weaving reality..." }: LoadingOverlayProps) {
  return (
    <View className="flex-1 bg-void items-center justify-center gap-4 px-8">
      <Text className="text-5xl">✨</Text>
      <ActivityIndicator size="large" color="#a855f7" />
      <Text className="text-glow text-lg font-bold text-center">{message}</Text>
    </View>
  );
}
