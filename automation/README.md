# MiniShop — UI Automation (Part D)

Playwright tests (JavaScript) for `../mini-shop.html`, structured with the **Page Object Model**, plus the bonus **Jest** unit test for `applyDiscount`.

## Setup

```bash
cd automation
npm install
npx playwright install chromium        # or: npx playwright install   (all three engines)
```

Requires Node 18 or later. Tested on Node 24.4.0 and npm 11.4.2.

## Run

| Command | What it runs |
|---|---|
| `npm test` | UI tests on Chromium (the default) |
| `npm run test:e2e:all-browsers` | UI tests on Chromium, Firefox and WebKit |
| `npm run test:unit` | Jest unit tests for `applyDiscount` |
| `npm run test:all` | Jest, then the UI tests on Chromium |
| `npm run report` | Opens the last Playwright HTML report |
| `npx playwright test --grep @smoke` | Smoke subset only |

**Where the app is loaded from.** `playwright.config.js` is the only place that knows the URL. By default it points at the local file `../mini-shop.html` (`file://`). To run against a static server instead:

```bash
npx http-server .. -p 8080              # any static server works
APP_URL=http://localhost:8080/mini-shop.html npm test
```

The URL reaches the tests through a Playwright **option fixture** (`appUrl`), so no test body contains a path.

## Structure

```
automation/
├── playwright.config.js     # testDir, reporters, browsers, APP_URL resolution
├── fixtures/test.js         # extends Playwright's test: appUrl option, page objects, loggedInShop
├── pages/                   # Page Object Model: locators + user actions, no assertions
│   ├── LoginPage.js
│   ├── ShopPage.js          # includes checkoutExpectingAlert() for the native alert()
│   └── ConfirmationPage.js
├── test-data/
│   ├── users.js             # credentials + expected UI messages (from the requirements)
│   └── products.js          # catalogue + data-driven checkout scenarios with hand-calculated totals
├── tests/
│   ├── e2e/                 # Playwright specs
│   │   ├── login.spec.js
│   │   ├── checkout.spec.js
│   │   └── navigation.spec.js
│   └── unit/
│       └── applyDiscount.test.js   # Jest (bonus)
├── src/applyDiscount.js     # function under test, verbatim from the brief
└── jest.config.js           # Jest limited to tests/unit so the two runners never overlap
```

**Design choices**

- **Page objects hold locators and actions only.** Assertions stay in the specs, so a failure points at a requirement, not at a helper.
- **Locators are user-facing where possible:** `getByRole('button', { name: 'Checkout' })` and `getByPlaceholder('Username')`. Product rows are scoped by their text, so "Add to Cart" is always the button for the named product.
- **Web-first assertions** (`await expect(locator).toHaveText(...)`) retry automatically, so there are no sleeps. Each assertion names what it checks, so a failure explains itself. For example: `Expected "1 item(s), total $19.99", Received "…"`.
- **Test oracles are independent.** Expected totals in `test-data/products.js` are worked out by hand, not by re-using the app's arithmetic.
- **Every test starts from a fresh page.** The app keeps all state in memory, so tests are isolated and run fully in parallel.

## Test inventory (13 tests × 3 browsers = 39 runs)

| Spec | Test | Requirement |
|---|---|---|
| login | valid credentials open the shop screen `@smoke` | R2, R3 |
| login | wrong password shows the invalid-login message and stays on login | R4 |
| login | unknown username shows the invalid-login message | R4 |
| login | account locks after 3 failed attempts and rejects even correct credentials | R5 |
| login | failed-attempt counter resets after a successful login, **expected to fail: BUG-A01** | R5 |
| checkout | shop lists 3 products, each with name, price and an Add to Cart button | R6 |
| checkout | each Add to Cart click increments the badge by one | R7 |
| checkout | checkout with a single item shows the correct count and total `@smoke` | R9 |
| checkout | checkout with one of each product shows the correct count and total `@smoke` | R9 |
| checkout | checkout with the same item added three times shows the correct count and total `@smoke` | R7, R9 |
| checkout | checkout with an empty cart shows an alert and does not proceed | R8 |
| checkout | cart is emptied after checkout: Back to Shop, then Checkout, shows the empty-cart alert | R9, R11 |
| navigation | logout returns to the login screen and clears both fields | R10 |

**Reading the result.** A green run reports `39 passed`. The BUG-A01 test is marked `test.fail()`, so it *passes because the bug is still there*. Playwright's list reporter draws it with a ✘ symbol, and the run is still green. When the bug is fixed, Playwright reports it as an **unexpected pass**, which is the reminder to delete the `test.fail()` line.

The lockout test deliberately does **not** assert which message the 3rd attempt shows. Requirements R4 and R5 conflict on that point (BUG-A02, pending a PO decision). It asserts the unambiguous part of R5 instead: after 3 failures, even the correct credentials are refused.

## Bonus: Jest unit test for `applyDiscount`

`tests/unit/applyDiscount.test.js` has 12 tests:

- **Normal:** `(100, 20) → 80`, plus two cases that exercise the 2-decimal rounding (`19.99 @ 15% → 16.99`).
- **Boundaries:** `0%` and `100%` are accepted (inclusive), and `-0.01%` and `100.01%` throw `Invalid discount`.
- **Invalid input:** `-10` and `150` throw. Non-numeric input is covered by the finding below.

**Findings from writing the test**

1. **Non-numeric `percent` isn't rejected.** `NaN < 0` and `NaN > 100` are both false, so `applyDiscount(100, 'abc')`, `(100, undefined)` and `(100, NaN)` all return `NaN` instead of throwing. This is documented with `test.failing`, which passes while the defect exists. **Fix:** `if (typeof percent !== 'number' || Number.isNaN(percent) || percent < 0 || percent > 100) throw …`
2. **`price` isn't validated at all.** `applyDiscount(-50, 10)` returns `-45`, and `null` is coerced to `0`.
3. **Half-cent rounding is inconsistent because of binary floating point.** For example, `applyDiscount(19.95, 10)` returns `17.95`, even though the exact value is 17.955, which rounds half-up to 17.96. It happens because `19.95 * 0.9` evaluates to `17.954999…`. The rounding rule isn't specified, so this is noted rather than asserted. **Recommendation:** calculate in integer cents.
