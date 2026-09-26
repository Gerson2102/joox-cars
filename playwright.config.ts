import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// End-to-end checks against the production build, in Chromium.
export default defineConfig({
  testDir: "e2e",
  use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}/es`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
