import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "/gantt-task-react",
  root: "example",
  build: {
    outDir: "../dist-demo",
    rollupOptions: {
      input: resolve(__dirname, "example/index.html"),
    },
  },
});
