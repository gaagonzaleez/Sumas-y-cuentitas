import { defineConfig, devices } from '@playwright/test';

const exe = process.env.PW_CHROMIUM_PATH;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:4173/Sumas-y-cuentitas/',
    ...devices['Pixel 7'],
    launchOptions: exe ? { executablePath: exe } : {},
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/Sumas-y-cuentitas/',
    reuseExistingServer: !process.env.CI,
  },
});
