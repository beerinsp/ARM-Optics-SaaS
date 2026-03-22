import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

export const STAFF_STORAGE = "tests/e2e/.auth/staff.json";
export const PORTAL_STORAGE = "tests/e2e/.auth/portal.json";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  expect: {
    timeout: 15_000,
  },
  projects: [
    // Auth setup — each in its own isolated browser context
    {
      name: "setup:staff",
      testMatch: "**/staff.setup.ts",
    },
    {
      name: "setup:portal",
      testMatch: "**/portal.setup.ts",
    },
    // Staff tests (auth, customers, orders)
    {
      name: "staff",
      testMatch: [
        "**/auth.spec.ts",
        "**/customers.spec.ts",
        "**/orders.spec.ts",
        "**/reset-password.spec.ts",
        "**/staff-pages.spec.ts",
      ],
      dependencies: ["setup:staff"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: STAFF_STORAGE,
      },
    },
    // Portal tests
    {
      name: "portal",
      testMatch: "**/portal.spec.ts",
      dependencies: ["setup:portal"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: PORTAL_STORAGE,
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
