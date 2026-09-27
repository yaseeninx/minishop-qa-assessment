const { test, expect } = require('../../fixtures/test');
const { users, messages } = require('../../test-data/users');

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('valid credentials open the shop screen @smoke', async ({ loginPage, shopPage }) => {
    await loginPage.login(users.valid.username, users.valid.password);

    await expect(shopPage.root).toBeVisible();
    await expect(loginPage.root).toBeHidden();
    await expect(loginPage.errorMessage).toHaveText('');
    await expect(shopPage.cartCount).toHaveText('0');
  });

  test('wrong password shows the invalid-login message and stays on login', async ({ loginPage, shopPage }) => {
    await loginPage.login(users.wrongPassword.username, users.wrongPassword.password);

    await expect(loginPage.errorMessage).toHaveText(messages.invalidLogin);
    await expect(loginPage.root).toBeVisible();
    await expect(shopPage.root).toBeHidden();
  });

  test('unknown username shows the invalid-login message', async ({ loginPage, shopPage }) => {
    await loginPage.login(users.unknownUser.username, users.unknownUser.password);

    await expect(loginPage.errorMessage).toHaveText(messages.invalidLogin);
    await expect(shopPage.root).toBeHidden();
  });

  test('account locks after 3 failed attempts and rejects even correct credentials', async ({ loginPage, shopPage }) => {
    // Attempts 1 and 2: plain invalid-login message, not locked yet.
    for (const attempt of [1, 2]) {
      await loginPage.login(users.wrongPassword.username, users.wrongPassword.password);
      await expect(loginPage.errorMessage, `message after failed attempt ${attempt}`).toHaveText(messages.invalidLogin);
    }

    // Attempt 3 locks the account. The message shown on this attempt is deliberately not asserted:
    // requirements 4 and 5 conflict on it (see BUG-A02 / SG-01, awaiting a PO decision).
    await loginPage.login(users.wrongPassword.username, users.wrongPassword.password);

    // Requirement 5: further attempts, even with the correct credentials, are rejected.
    await loginPage.login(users.valid.username, users.valid.password);
    await expect(loginPage.errorMessage).toHaveText(messages.locked);
    await expect(shopPage.root).toBeHidden();
    await expect(loginPage.root).toBeVisible();
  });

  test('failed-attempt counter resets after a successful login (requirement 5: "consecutive")', async ({ loginPage, shopPage }) => {
    test.info().annotations.push({ type: 'known bug', description: 'BUG-A01: counter is never reset, so non-consecutive failures lock the account' });
    test.fail(); // Documents BUG-A01. Playwright reports "unexpected pass" once the bug is fixed; remove this line then.

    await loginPage.login(users.wrongPassword.username, users.wrongPassword.password);
    await loginPage.login(users.wrongPassword.username, users.wrongPassword.password);
    await loginPage.login(users.valid.username, users.valid.password);
    await expect(shopPage.root).toBeVisible();
    await shopPage.logout();

    // One failure after a successful login is 1 consecutive failure, so the account must not lock.
    await loginPage.login(users.wrongPassword.username, users.wrongPassword.password);
    await expect(loginPage.errorMessage).toHaveText(messages.invalidLogin, { timeout: 2000 });
  });
});
