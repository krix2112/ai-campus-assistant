import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F3EEE3",
        ink: "#0E0E0C",
        accent: {
          DEFAULT: "#FF4B1F",
          hover: "#E03C12",
        },
        surface: {
          DEFAULT: "#E8E1D2",
          muted: "#DED6C4",
        },
        success: {
          DEFAULT: "#1F7A4D",
          light: "#E4F4EC",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Bricolage Grotesque", "sans-serif"],
        body: ["var(--font-body)", "Instrument Sans", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        hard: "4px 4px 0px #0E0E0C",
        "hard-sm": "2px 2px 0px #0E0E0C",
        "hard-md": "5px 5px 0px #0E0E0C",
        "hard-lg": "6px 6px 0px #0E0E0C",
        "hard-xl": "8px 8px 0px #0E0E0C",
        "hard-accent": "4px 4px 0px #FF4B1F",
        "hard-surface": "4px 4px 0px #E8E1D2",
      },
      borderWidth: {
        "1.5": "1.5px",
        "2.5": "2.5px",
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
