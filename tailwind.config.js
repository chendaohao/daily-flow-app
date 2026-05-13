/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        frog: {
          pending: "#94a3b8",
          active: "#3b82f6",
          done: "#22c55e",
        },
      },
    },
  },
  plugins: [],
};
