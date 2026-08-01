import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  base: "/gantt-task-react",
  root: "example",
  build: {
    outDir: "../dist-demo",
    emptyOutDir: true,
    rolldownOptions: {
      input: resolve(import.meta.dirname, "example/index.html"),
    },
  },
});
