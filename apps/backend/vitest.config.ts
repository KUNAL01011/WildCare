import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths()],

  test: {
    globals: false,
    environment: "node",

    env: {
      ...loadEnv(mode, process.cwd(), ""),
      NODE_ENV: "test",
    },

    // Run integration tests sequentially — they share DB state
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/generated/**",
        "src/**/*.d.ts",
        "src/config/swagger.ts",
        "src/**/server.ts",
        "src/**/instrumentation.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
}));