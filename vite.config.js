import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // Tell Vite to completely ignore the backend and Python virtual env
      ignored: ["**/backend/**", "**/.venv/**"],
    },
  },
});
