import { defineConfig, devices } from '@playwright/test';

// E2E: chạy trên bản build thật (astro preview), đúng base /math/ như GitHub Pages.
// Trên máy Windows dùng Edge có sẵn (không phải tải trình duyệt); trên CI dùng
// Chromium của Playwright (cài bằng `npx playwright install --with-deps chromium`).
const CONG = 4322;
const kenh = process.env.PW_CHANNEL ?? (process.platform === 'win32' ? 'msedge' : undefined);

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${CONG}/math/`,
    trace: 'retain-on-failure',
    locale: 'vi-VN',
  },
  projects: [
    {
      name: 'laptop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 }, channel: kenh },
      testIgnore: /dien-thoai\.spec\.ts/,
    },
    { name: 'dien-thoai', use: { ...devices['Pixel 7'], channel: kenh }, testMatch: /dien-thoai\.spec\.ts/ },
  ],
  webServer: {
    command: `npm run build && npx astro preview --port ${CONG}`,
    url: `http://localhost:${CONG}/math/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
