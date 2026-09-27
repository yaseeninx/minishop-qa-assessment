class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {string} url location of mini-shop.html (injected via the appUrl fixture)
   */
  constructor(page, url) {
    this.page = page;
    this.url = url;
    this.root = page.locator('#login-screen');
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('#error');
  }

  async open() {
    if (!this.url) throw new Error('appUrl is not configured (see playwright.config.js)');
    await this.page.goto(this.url);
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

module.exports = { LoginPage };
