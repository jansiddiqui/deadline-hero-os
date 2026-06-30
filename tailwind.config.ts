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
        background: "var(--background)",
        foreground: "var(--foreground)",
        "surface-primary": "var(--surface-primary)",
        "surface-secondary": "var(--surface-secondary)",
        "surface-elevated": "var(--surface-elevated)",
        "accent-indigo": "var(--indigo-primary)",
        indigo: {
          50: "rgba(0, 245, 196, 0.05)",
          100: "rgba(0, 245, 196, 0.1)",
          200: "rgba(0, 245, 196, 0.2)",
          300: "rgba(0, 245, 196, 0.4)",
          400: "var(--indigo-primary)",
          450: "#00e0b3",
          455: "#00d5aa",
          500: "#00d5aa",
          600: "#00b58f",
          650: "#009f7d",
          655: "#009575",
          700: "#008567",
          800: "#006b52",
          900: "#00523e",
        },
      },
    },
  },
  plugins: [],
};
export default config;
