import { defineConfig } from 'vitest/config';

// Vitest chạy: hàm thuần trong src/lib, test dữ liệu nội dung và các test shell.
// Test e2e (tests/e2e) do Playwright chạy riêng: npm run test:e2e.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    environment: 'node',
  },
});
