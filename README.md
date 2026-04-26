# eBay Playwright Homework

## Project Description
This project contains automated UI tests for the eBay shopping flow using **Playwright** and **TypeScript**.

The main required scenario is broken into multiple test cases. The tests cover searching for a product, applying filters, opening an item, adding it to the cart, starting checkout, proceeding as far as possible without completing payment, returning to the cart, and removing the item. Tests also include negative cases.

Tests are ran on multiple browsers (**Chromium**, **Firefox**)

Input data (Search term and filter options, delivery address) is read from external files (**.csv** and **.json** respectively)

GitHub Actions pipeline and Playwright HTML test report are also set up.

---

## Covered Scenario

The covered scenario is:

1. Go to https://www.ebay.com/
2. Search for `"Headphones"`
3. Filter to show only Sony products
4. Set the price range filter to `50 - 200`
5. Select the third item in the list
6. Add the item to the cart
7. Begin the checkout process and proceed as far as possible without completing payment
8. Return to the cart
9. Remove the item from the cart

---
## Test Case Breakdown

The required scenario is broken into multiple Playwright test files:

| Test file | Purpose |
|---|---|
| `ebay-search.spec.ts` | Opens eBay and searches for the product from test data, including a negative test case search of a non-existant product |
| `ebay-filter.spec.ts` | Applies Sony brand and 50–200 price filters, including a negative test case of a non-existant brand selection attempt |
| `ebay-item.spec.ts` | Opens the third filtered item |
| `ebay-cart.spec.ts` | Adds the selected item to the cart |
| `ebay-full-flow.spec.ts` | Runs the entire scenario defined above |

---

## Technologies Used

- Playwright
- TypeScript
- Node.js
- CSV test data
- JSON checkout test data
- GitHub Actions
- Playwright HTML report

---
## Prerequisites

Before running the project, install:

- Node.js LTS
- npm
- Git

Check that Node.js and npm are installed:

```bash
node -v
npm -v
```

---

## Setup Instructions

Clone the repository:

```bash
git clone https://github.com/W1TCH3R/hw-ui.git
cd hw-ui
```

Install project dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

If running tests in Linux CI or a fresh environment, install browsers with dependencies:

```bash
npx playwright install --with-deps
```

---

## Test Data

### Search data

Search and filter data is stored in:

```text
data/search-data.csv
```

Example:

```csv
searchTerm,brand,minPrice,maxPrice
Headphones,Sony,50,200
```

### Checkout data

Mock delivery address data is stored in:

```text
data/checkout-data.json
```

Example:

```json
{
  "email": "test.user@example.com",
  "firstName": "Jonas",
  "lastName": "Petraitis",
  "addressLine1": "Gedimino pr. 1",
  "city": "Vilnius",
  "postalCode": "01103",
  "phone": "+37061234567",
  "country": "Lithuania"
}
```

Only mock data is used. No real payment is completed.

---

## Running Tests

Run all tests:

```bash
npx playwright test
```

Run all tests in headed mode:

```bash
npx playwright test --headed
```

Run all tests with one worker:

```bash
npx playwright test --workers=1
```

Running with one worker is recommended because eBay cart and checkout flows are stateful and can be less stable when many tests run in parallel.

---

## Running Tests by Browser

Run tests only in Chromium:

```bash
npx playwright test --project=chromium
```

Run tests only in Firefox:

```bash
npx playwright test --project=firefox
```

Run Chromium tests in headed mode with one worker:

```bash
npx playwright test --project=chromium --headed --workers=1
```

Recommended local command:

```bash
npx playwright test --project=chromium --headed --workers=1
```

Recommended final check for both browsers:

```bash
npx playwright test --workers=1
```

---
## Running Specific Test Files

Run search tests:

```bash
npx playwright test tests/ebay-search.spec.ts --project=chromium --headed
```

Run filter tests:

```bash
npx playwright test tests/ebay-filter.spec.ts --project=chromium --headed
```

Run item page tests:

```bash
npx playwright test tests/ebay-item.spec.ts --project=chromium --headed
```

Run cart tests:

```bash
npx playwright test tests/ebay-cart.spec.ts --project=chromium --headed
```

Run full scenario:

```bash
npx playwright test tests/ebay-full-flow.spec.ts --project=chromium --headed
```

---

## Test Report

This project uses Playwright’s HTML report.

After running tests, open the report:

```bash
npx playwright show-report
```

The report contains:

- Test results
- Passed and failed tests
- Screenshots on failure
- Videos on failure
- Traces on retry, if enabled

---

## Debugging Tests

Run tests in debug mode:

```bash
npx playwright test --debug
```

Run a specific test file in debug mode:

```bash
npx playwright test tests/ebay-cart.spec.ts --project=chromium --debug
```

---

## Notes and Assumptions

- eBay UI may vary depending on region, currency, cookies, A/B tests, and product availability.
- Some products may not support “Add to cart”. If that happens, the selected item or locator strategy may need adjustment.
- Checkout is intentionally not completed.
- The test proceeds only as far as possible before payment.
- PayPal is selected, but no PayPal login, authorization, or final order confirmation is completed.
- Delivery address data is mock data.
- If eBay changes its UI, selectors may need to be updated.
- The GitHub Actions pipeline runs a stable subset of tests against eBay because eBay may apply bot protection, region-specific UI, or different checkout behavior in cloud runners.
- In a real company project, these tests would ideally run against a stable test environment instead of a public production website.

---

## Optional Requirements Covered

| Optional requirement | Status |
|---|---|
| Tests executed on at least two browsers | Covered: Chromium and Firefox configured |
| Input data from external file | Covered: CSV and JSON data files |
| Negative scenarios covered | Covered in negative search/filter tests |
| Project pipeline set up | Covered with GitHub Actions |
| Test report created | Covered with Playwright HTML report |

---