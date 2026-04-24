/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}"
  ],
  theme: {
    extend: {
      colors: {
        lumiDark: "#0f172a",
        lumiCyan: "#00e5ff",
        lumiCyanDark: "#00b3cc",
        lumiGold: "#facc15"
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};
