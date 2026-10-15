/** @type {import('tailwindcss').Config} */
module.exports = {
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
        hazard: {
          safe: "#10B981",     // Emerald 500
          warning: "#F59E0B",  // Amber 500
          danger: "#F97316",   // Orange 500
          critical: "#EF4444", // Red 500
          dark: "#0F172A",     // Slate 900
        }
      },
    },
  },
  plugins: [],
};
