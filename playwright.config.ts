import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Clipboard grants in one test otherwise poison Chrome autofill in later
        // tests (email fill clears the name field). Keep Book assertions honest.
        launchOptions: {
          args: ["--disable-features=AutofillServerCommunication"],
        },
      },
    },
  ],
  // Production server avoids next-dev cold-compile timeouts on first hits
  // (mobile-nav gateway, site-smoke multi-route). Build once, then serve.
  webServer: {
    command: "npm run build && npm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300 * 1000,
  },
});
