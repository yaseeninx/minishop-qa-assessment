const { test, expect } = require('../../fixtures/test');

test.describe('Logout', () => {
  test('logout returns to the login screen and clears both fields', async ({ loggedInShop, loginPage }) => {
    await loggedInShop.logout();

    await expect(loginPage.root).toBeVisible();
    await expect(loggedInShop.root).toBeHidden();
    await expect(loginPage.usernameInput).toHaveValue('');
    await expect(loginPage.passwordInput).toHaveValue('');
  });
});
