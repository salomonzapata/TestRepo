import { View, ViewProps } from "react-native";

type CardProps = ViewProps & {
  glow?: boolean;
};

export function Card({ children, className, glow, style, ...props }: CardProps) {
  return (
    <View
      className={`
        bg-surface-2 rounded-2xl p-4 border border-border
        ${glow ? "border-mystic/60" : ""}
        ${className ?? ""}
      `}
      style={[
        glow
          ? {
              shadowColor: "#7c3aed",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 8,
            }
          : {},
        ...(Array.isArray(style) ? style : [style]),
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
