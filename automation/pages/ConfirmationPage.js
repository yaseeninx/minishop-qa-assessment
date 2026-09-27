class ConfirmationPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.root = page.locator('#confirmation-screen');
    this.heading = this.root.getByRole('heading', { name: 'Order Confirmed' });
    this.summary = page.locator('#order-summary');
    this.backToShopButton = page.getByRole('button', { name: 'Back to Shop' });
  }

  async backToShop() {
    await this.backToShopButton.click();
  }
}

module.exports = { ConfirmationPage };
