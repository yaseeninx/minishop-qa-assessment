// @ts-check
const path = require('path');
const { pathToFileURL } = require('url');
const { defineConfig, devices } = require('@playwright/test');

// Single place that decides where the app under test lives.
// Default: the local file ../mini-shop.html (file://).
// Override: APP_URL=http://localhost:8080/mini-shop.html npm test
const APP_URL =
  process.env.APP_URL || pathToFileURL(path.resolve(__dirname, '../mini-shop.html')).href;

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    appUrl: APP_URL, // custom option consumed by fixtures/test.js
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
