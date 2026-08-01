/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { resolve } from "node:path";
import dts from "unplugin-dts/vite";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    dts({
      include: "src",
      bundleTypes: true,
      tsconfigPath: "tsconfig-build.json",
    }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      name: "@nikmaxott/gantt-task-react",
      fileName: "gantt-task-react",
    },
    rolldownOptions: {
      // Ensure to externalise dependencies that shouldn't be bundled
      external: ["react", "react/jsx-runtime", "react-dom"],
      output: {
        // Provide global variables to use in the UMD build
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
