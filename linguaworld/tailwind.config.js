/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Deep cosmic / fantasy palette
        void: "#0f0a1e",
        "void-light": "#1a1230",
        arcane: "#2d1b5e",
        "arcane-light": "#3d2878",
        mystic: "#7c3aed",
        "mystic-light": "#a855f7",
        glow: "#c084fc",
        ember: "#f97316",
        "ember-light": "#fb923c",
        gold: "#fbbf24",
        "gold-light": "#fcd34d",
        rune: "#06b6d4",
        "rune-light": "#22d3ee",
        sage: "#10b981",
        "text-primary": "#f1f0ff",
        "text-secondary": "#a89ec4",
        "text-muted": "#6b5f8a",
        "surface-1": "#1a1230",
        "surface-2": "#231848",
        "surface-3": "#2d2160",
        border: "#3d2878",
      },
      fontFamily: {
        sans: ["SpaceMono_400Regular"],
      },
    },
  },
  plugins: [],
};
