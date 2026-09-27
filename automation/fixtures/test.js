const base = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { ShopPage } = require('../pages/ShopPage');
const { ConfirmationPage } = require('../pages/ConfirmationPage');
const { users } = require('../test-data/users');

/**
 * Custom fixtures:
 *  - appUrl            configurable option (set in playwright.config.js / APP_URL env var)
 *  - loginPage, shopPage, confirmationPage   page objects
 *  - loggedInShop      the app opened and logged in as the valid user, ready to shop
 */
const test = base.test.extend({
  appUrl: ['', { option: true }],

  loginPage: async ({ page, appUrl }, use) => {
    await use(new LoginPage(page, appUrl));
  },
  shopPage: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  confirmationPage: async ({ page }, use) => {
    await use(new ConfirmationPage(page));
  },
  loggedInShop: async ({ loginPage, shopPage }, use) => {
    await loginPage.open();
    await loginPage.login(users.valid.username, users.valid.password);
    await base.expect(shopPage.root).toBeVisible();
    await use(shopPage);
  },
});

module.exports = { test, expect: base.expect };
