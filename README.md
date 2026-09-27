# MiniShop QA Assessment

## Overview

This is a QA take-home assessment covering two systems under test:

- **MiniShop v1**, a single-file web app (`mini-shop.html`). It has a login screen with a 3-attempt lockout, a 3-product shop with a cart badge, a checkout confirmation, and logout.
- **Nova**, the Northwind Appliances AI support chat, reviewed from 8 supplied transcripts against a reference policy.

The work covers manual and exploratory testing, API contract testing in Postman, AI output validation, and UI automation with Playwright.

| Part | Result |
|---|---|
| A: Manual testing | 23 test cases executed: 18 Pass, 2 Fail, 3 undefined by spec. 2 bugs, 10 specification gaps, 6 observations |
| B: API testing | 6 requests across 3 endpoints, each with a saved example. 49/49 assertions pass |
| C: AI validation | 8 transcripts evaluated: 6 fail (2 Critical, 2 High, 1 Medium, 1 Low), 2 pass. 2 additional test prompts designed |
| D: Automation | 13 Playwright tests × 3 browsers = 39 runs, all passing. Bonus: 12 Jest unit tests, all passing |

## Assessment Coverage

### Part A — Manual Testing

| File | Contents |
|---|---|
| `manual-testing/test-plan.pdf` | Scope, approach, state transitions, assumptions, test-case index, exploratory notes, requirement traceability, and the 10 specification gaps |
| `manual-testing/manual-test-cases.pdf` | All 23 test cases. Each has its ID, title, requirement, preconditions, test data, steps, expected result, actual result, status, priority and notes |
| `manual-testing/bug-reports.xlsx` | Every bug from Parts A and C (8 in total), plus 6 observations, a summary, and the severity/priority definitions |
| `manual-testing/evidence/` | Screenshots for BUG-A01 and BUG-A02 |

### Part B — API Testing

| File | Contents |
|---|---|
| `api-testing/api-tests.postman_collection.json` | Postman v2.1 collection covering `GET /products`, `POST /orders` (201, 400, 409) and `GET /orders/{orderId}` (200, 404). Every request has a saved example response and `pm.test()` assertions |
| `api-testing/api-contract-review.pdf` | What the tests assert, and 12 contract findings for the API developer |
| `api-testing/mock-server/` | A zero-dependency local mock that serves the collection's saved examples, plus a Newman runner. No Postman account is needed |

### Part C — AI Validation

| File | Contents |
|---|---|
| `ai-validation/ai-validation-report.xlsx` | The reference policy, an evaluation of all 8 transcripts (findings, issue type, expected response, verdict, severity), the 2 designed prompts, cross-transcript patterns, and a regression plan |

The six AI bugs (BUG-C01 to BUG-C06) are logged as full bug reports in `manual-testing/bug-reports.xlsx`, next to the app bugs.

### Part D — Automation

- **Technology:** Playwright 1.63 in JavaScript, using the built-in `expect` assertion library, the Page Object Model and custom fixtures. The bonus unit test uses Jest 30.
- **Scenarios:**
  - Valid login, invalid password and unknown username.
  - Account lockout after 3 failed attempts, including refusal of the correct credentials once locked.
  - Product list and cart badge.
  - Data-driven checkout checking the item count and total.
  - Empty-cart alert, Back to Shop, and logout.
- **Known bug:** one test is marked expected-to-fail to document BUG-A01.
- **Setup and design notes:** [`automation/README.md`](automation/README.md).

## Project Structure

```
minishop-qa-assessment/
├── README.md
├── mini-shop.html                      # application under test (as supplied)
├── manual-testing/
│   ├── test-plan.pdf
│   ├── manual-test-cases.pdf
│   ├── bug-reports.xlsx                # Part A + Part C bugs
│   └── evidence/                       # bug screenshots
├── api-testing/
│   ├── api-tests.postman_collection.json
│   ├── api-contract-review.pdf
│   └── mock-server/                    # local mock + Newman runner
├── ai-validation/
│   └── ai-validation-report.xlsx
└── automation/
    ├── README.md
    ├── package.json
    ├── playwright.config.js
    ├── jest.config.js
    ├── fixtures/                       # custom Playwright fixtures
    ├── pages/                          # page objects
    ├── test-data/
    ├── tests/e2e/                      # Playwright specs
    ├── tests/unit/                     # Jest (bonus)
    └── src/applyDiscount.js            # bonus function under test
```

## How to Run

Prerequisite: Node.js 18 or later, with npm.

**Part A: the app.** Open `mini-shop.html` in any browser.

**Part B: API tests**

```bash
cd api-testing/mock-server
npm install
npm test        # starts the mock on :3000, runs the collection with Newman, stops the mock
```

To use Postman instead, import the collection, create a mock server from it (**⋯ → Mock collection**), set the `baseUrl` collection variable to the mock URL, and click **Run collection**. Run the requests in order, because `POST /orders (201)` saves the `orderId` that the GET request checks.

**Part D: automation**

```bash
cd automation
npm install
npx playwright install              # browser binaries
npm test                            # Playwright UI tests on Chromium
npm run test:e2e:all-browsers       # Chromium, Firefox and WebKit
npm run test:unit                   # Jest bonus
```

The tests load `../mini-shop.html` over `file://` by default. To use a static server, set `APP_URL` (for example `APP_URL=http://localhost:8080/mini-shop.html npm test`).

## Assumptions

1. **The app is used exactly as supplied.** The only change was rejoining lines that the brief's PDF had wrapped (for example `Add to` / `Cart`). Behaviour is unchanged.
2. **"Consecutive" (requirement R5) means no successful login in between.** That reading is what makes BUG-A01 a bug.
3. **Every manual test case starts from a fresh page load,** because all app state is held in page memory.
4. **Part B has no live server,** so the tests validate the saved examples against the contract, through a Postman mock or the local mock. The same collection runs against a real backend by changing `baseUrl`.
5. **Each AI transcript is a single observation** of a non-deterministic model. Every AI bug records a repro rate of 1/1 and recommends re-running at least 10 times.

## Notes

- **Bugs, spec gaps and observations are kept separate:**
  - A **bug** is where the app contradicts a stated requirement.
  - A **specification gap** is where the requirements are silent, ambiguous or contradictory. These are in `test-plan.pdf`, section 7.
  - An **observation** is a quality risk, such as security or accessibility, with no v1 requirement behind it.

  BUG-A02 sits on the boundary: requirements R4 and R5 conflict, so it's logged as a bug that needs a Product Owner decision.
- **Severity measures impact and priority measures urgency.** Both scales are defined on the *Legend* sheet of `bug-reports.xlsx`.
- **Part A execution environment:** macOS, Chromium 153, 27 September 2026, with each case run from a fresh page load. Both failures were also reproduced in Firefox and WebKit.
- **Tools and versions:**

  | Tool | Version |
  |---|---|
  | Node.js / npm | 24.4.0 / 11.4.2 |
  | Playwright | 1.63.0: Chromium 153, Firefox 155, WebKit 26.6 |
  | Jest | 30.5.2 |
  | Newman | 6.2.2 |
  | Postman collection format | v2.1.0 |
