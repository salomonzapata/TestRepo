import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = {
  onPress: () => void;
  children: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
};

const gradients: Record<Variant, [string, string]> = {
  primary: ["#7c3aed", "#a855f7"],
  secondary: ["#1a1230", "#2d1b5e"],
  ghost: ["transparent", "transparent"],
  danger: ["#dc2626", "#ef4444"],
};

const textColors: Record<Variant, string> = {
  primary: "text-white font-bold",
  secondary: "text-glow font-semibold",
  ghost: "text-mystic-light font-semibold",
  danger: "text-white font-bold",
};

export function Button({
  onPress,
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={fullWidth ? "w-full" : undefined}
    >
      <LinearGradient
        colors={isDisabled ? ["#2d2160", "#2d2160"] : gradients[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={`
          flex-row items-center justify-center gap-2
          px-6 py-3.5 rounded-xl
          ${variant === "ghost" ? "border border-mystic/40" : ""}
          ${variant === "secondary" ? "border border-arcane-light" : ""}
          ${isDisabled ? "opacity-50" : ""}
          ${fullWidth ? "w-full" : ""}
        `}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#f1f0ff" />
        ) : (
          <>
            {icon && <View>{icon}</View>}
            <Text className={`text-base ${textColors[variant]}`}>{children}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
