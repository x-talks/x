// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15000,
  retries: 0,
  reporter: 'list',
  use: {
    headless: true,
    // No baseURL — tests use file:// paths directly
  },
});
