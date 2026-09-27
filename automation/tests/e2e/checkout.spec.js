const { test, expect } = require('../../fixtures/test');
const { messages } = require('../../test-data/users');
const { products, checkoutScenarios } = require('../../test-data/products');

test.describe('Cart and checkout', () => {
  test('shop lists 3 products, each with name, price and an Add to Cart button', async ({ loggedInShop }) => {
    await expect(loggedInShop.productRows).toHaveCount(3);
    for (const { name, price } of Object.values(products)) {
      const row = loggedInShop.product(name);
      await expect(row).toContainText(`${name} - $${price}`);
      await expect(row.getByRole('button', { name: 'Add to Cart' })).toBeVisible();
    }
  });

  test('each Add to Cart click increments the badge by one', async ({ loggedInShop }) => {
    await expect(loggedInShop.cartCount).toHaveText('0');
    await loggedInShop.addToCart(products.mouse.name);
    await expect(loggedInShop.cartCount).toHaveText('1');
    await loggedInShop.addToCart(products.keyboard.name);
    await expect(loggedInShop.cartCount).toHaveText('2');
    await loggedInShop.addToCart(products.mouse.name);
    await expect(loggedInShop.cartCount).toHaveText('3');
  });

  for (const scenario of checkoutScenarios) {
    test(`checkout with ${scenario.title} shows the correct count and total @smoke`, async ({ loggedInShop, confirmationPage }) => {
      await loggedInShop.addItems(scenario.items);
      await expect(loggedInShop.cartCount).toHaveText(String(scenario.items.length));

      await loggedInShop.checkout();

      await expect(confirmationPage.heading).toBeVisible();
      await expect(confirmationPage.summary).toHaveText(scenario.expectedSummary);
      await expect(loggedInShop.root).toBeHidden();
      // Requirement 9: cart count is reset to 0.
      await expect(loggedInShop.cartCount).toHaveText('0');
    });
  }

  test('checkout with an empty cart shows an alert and does not proceed', async ({ loggedInShop, confirmationPage }) => {
    const alertText = await loggedInShop.checkoutExpectingAlert();

    expect(alertText).toBe(messages.emptyCart);
    await expect(loggedInShop.root).toBeVisible();
    await expect(confirmationPage.root).toBeHidden();
  });

  test('cart is emptied after checkout: Back to Shop then Checkout shows the empty-cart alert', async ({ loggedInShop, confirmationPage }) => {
    await loggedInShop.addToCart(products.hub.name);
    await loggedInShop.checkout();
    await confirmationPage.backToShop();

    await expect(loggedInShop.root).toBeVisible();
    await expect(confirmationPage.root).toBeHidden();
    await expect(loggedInShop.cartCount).toHaveText('0');
    expect(await loggedInShop.checkoutExpectingAlert()).toBe(messages.emptyCart);
  });
});
