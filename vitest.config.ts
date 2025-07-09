import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    poolOptions: {
      forks: {
        execArgv: ["--expose-gc"],
      },
    },
    projects: [
      {
        test: {
          name: {
            label: "gc",
            color: "yellow",
          },
          include: ["tests/*.gc.test.{ts,js}"],

          environment: "node",
        },
      },
      {
        test: {
          name: {
            label: "node",
            color: "green",
          },
          include: ["tests/*.test.{ts,js}"],
          exclude: ["tests/*.gc.test.{ts,js}"],
          environment: "node",
        },
      },
    ],
  },
});
