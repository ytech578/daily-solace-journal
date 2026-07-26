import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    isolate: true,
    // Inject env vars before any module is imported so env.ts doesn't throw.
    env: {
      DATABASE_URL: 'postgresql://localhost:5432/daily_solace_test',
      JWT_SECRET: 'test-secret-for-vitest-only-32chars!!',
      NODE_ENV: 'test',
      RESEND_API_KEY: 're_test_placeholder',
      RAZORPAY_KEY_ID: 'rzp_test_placeholder',
      RAZORPAY_KEY_SECRET: 'test_razorpay_secret_placeholder',
      RAZORPAY_WEBHOOK_SECRET: 'test_webhook_secret_placeholder',
      CROSSREF_USER: 'test@example.com',
      CROSSREF_PASSWORD: 'test_crossref_pass',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/server.ts'],
    },
    setupFiles: ['src/test/setup.ts'],
  },
});

