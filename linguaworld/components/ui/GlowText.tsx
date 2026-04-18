import { Text, TextProps } from "react-native";

type GlowTextProps = TextProps & {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  dim?: boolean;
};

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

export function GlowText({ children, size = "md", dim, className, ...props }: GlowTextProps) {
  return (
    <Text
      className={`
        font-bold tracking-wide
        ${dim ? "text-text-secondary" : "text-glow"}
        ${sizeClasses[size]}
        ${className ?? ""}
      `}
      {...props}
    >
      {children}
    </Text>
  );
}

export function BodyText({ children, className, ...props }: TextProps) {
  return (
    <Text className={`text-text-secondary text-base leading-relaxed ${className ?? ""}`} {...props}>
      {children}
    </Text>
  );
}

export function MutedText({ children, className, ...props }: TextProps) {
  return (
    <Text className={`text-text-muted text-sm ${className ?? ""}`} {...props}>
      {children}
    </Text>
  );
}
