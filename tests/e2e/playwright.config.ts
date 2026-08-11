import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  // Expo web (Metro) compila cada ruta on-demand la primera vez que se navega a
  // ella; en Windows ese primer compile puede pasar los 30s. Damos margen y una
  // retry local para absorber ese warm-up (las corridas siguientes son rápidas).
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:8081',
    navigationTimeout: 60_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm --filter mobile web',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
