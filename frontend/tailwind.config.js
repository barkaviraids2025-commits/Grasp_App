/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surfaceSoft: "var(--surface-soft)",
        textMain: "var(--text)",
        textSoft: "var(--text-soft)",
        primary: "var(--primary)",
        primaryDark: "var(--primary-dark)",
        accent: "var(--accent)",
        leaf: "#10b981",
        clay: "#f97316",
        gold: "#f59e0b",
        mist: "#f1f3fa",
        ink: "#171827",
        paper: "#f7f8fc",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
      },
    },
  },
  plugins: [],
};
