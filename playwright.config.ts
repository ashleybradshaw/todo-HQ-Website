import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: isCI ? 1 : 2,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? "list" : "line",
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
  // (mobile-nav gateway, site-smoke multi-route). Build once, then serve;
  // Tier 2/3 set PW_NO_BUILD=1 after `npm run build`.
  webServer: {
    command: process.env.PW_NO_BUILD
      ? "npm run start"
      : "npm run build && npm run start",
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 300 * 1000,
  },
});
