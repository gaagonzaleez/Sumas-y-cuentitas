import { defineConfig, devices } from '@playwright/test';

const exe = process.env.PW_CHROMIUM_PATH;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:4173/Sumas-y-cuentitas/',
    ...devices['Pixel 7'],
    // Las islas y fichas flotan todo el tiempo: en las pruebas se apaga el movimiento para poder tocarlas.
    reducedMotion: 'reduce',
    launchOptions: exe ? { executablePath: exe } : {},
  },
  webServer: {
    // En CI ya se compiló antes; en la compu se compila siempre, para no probar una versión vieja.
    command: process.env.CI ? 'npx vite preview --port 4173 --strictPort' : 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/Sumas-y-cuentitas/',
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
