import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: "#2f7d52",
        moss: "#7ea35f",
        clay: "#bf7654",
        sunlight: "#f4c95d",
        baseblue: "#0052ff",
        soil: "#513f35",
        linen: "#f8f5ed"
      },
      boxShadow: {
        sensor: "0 18px 60px rgba(42, 67, 47, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
