class ShopPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.root = page.locator('#shop-screen');
    this.cartCount = page.locator('#cart-count');
    this.productRows = this.root.locator('.item');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
  }

  product(name) {
    return this.productRows.filter({ hasText: name });
  }

  async addToCart(name) {
    await this.product(name).getByRole('button', { name: 'Add to Cart' }).click();
  }

  async addItems(names) {
    for (const name of names) {
      await this.addToCart(name);
    }
  }

  async checkout() {
    await this.checkoutButton.click();
  }

  /**
   * Clicks Checkout when a native alert() is expected, accepts it and returns its text.
   * Throws if no dialog appears, so a missing alert fails the test clearly.
   */
  async checkoutExpectingAlert() {
    let message = null;
    this.page.once('dialog', async (dialog) => {
      message = dialog.message();
      await dialog.accept();
    });
    await this.checkoutButton.click();
    if (message === null) throw new Error('Expected a browser alert after clicking Checkout, but none appeared');
    return message;
  }

  async logout() {
    await this.logoutButton.click();
  }
}

module.exports = { ShopPage };
