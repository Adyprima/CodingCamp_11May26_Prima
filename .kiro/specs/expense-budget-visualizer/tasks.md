# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement a fully client-side expense tracking app using plain HTML, CSS, and Vanilla JavaScript. The app consists of three files (`index.html`, `css/style.css`, `js/app.js`), uses Chart.js v4 via CDN for the pie chart, and persists data in `localStorage`. A separate test suite uses Vitest + fast-check for property-based and unit tests.

---

## Tasks

- [x] 1. Set up project structure and test scaffolding
  - [x] 1.1 Create the project file skeleton
    - Create `index.html` at the project root with semantic HTML structure: `<form id="transaction-form">`, `<ul id="transaction-list">`, balance display element, `<canvas id="spending-chart">`, and `<div id="chart-container">` with a `<p id="chart-placeholder">` sibling
    - Add inline error `<span class="error-msg" aria-live="polite">` next to each form field
    - Add Chart.js v4 CDN `<script>` tag and link to `css/style.css` and `js/app.js`
    - Create `css/style.css` with layout skeleton (visual sections, scrollable list container, WCAG AA contrast placeholders)
    - Create `js/app.js` with the eight section comment headers: Constants & Config, Data Model, Storage Service, Validator, Chart Controller, UI Renderer, Event Handlers, App Initializer
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.3, 9.4_

  - [x] 1.2 Initialize test infrastructure
    - Create `package.json` with `vitest` and `fast-check` as dev dependencies
    - Create `vitest.config.js` (or equivalent) configured for a browser-like environment (jsdom)
    - Create empty test files: `tests/unit/validator.test.js`, `tests/unit/storage.test.js`, `tests/unit/balance.test.js`, `tests/unit/chart.test.js`, `tests/unit/renderer.test.js`, `tests/unit/form.test.js`, `tests/integration/app.test.js`
    - _Requirements: 7.1_

- [x] 2. Implement Constants, Data Model, and Storage Service
  - [x] 2.1 Implement constants and the Transaction data model
    - Define `CATEGORY_COLORS` constant: `{ Food: '#FF6384', Transport: '#36A2EB', Fun: '#FFCE56' }`
    - Define `VALID_CATEGORIES` constant: `['Food', 'Transport', 'Fun']`
    - Define `STORAGE_KEY` constant: `'expense_transactions'`
    - Define the `Transaction` JSDoc typedef with fields: `id` (string), `itemName` (string), `amount` (number), `category` (string), `timestamp` (number)
    - Declare the mutable `let transactions = []` in-memory array
    - _Requirements: 7.1, 7.2_

  - [x] 2.2 Implement StorageService (`loadTransactions` and `saveTransactions`)
    - Implement `loadTransactions()`: reads `localStorage[STORAGE_KEY]`, parses JSON, returns `Transaction[]`; on any error (unavailable, parse failure) returns `[]` without throwing
    - Implement `saveTransactions(transactions)`: serializes array to JSON and writes to `localStorage`; returns `{ success: true }` on success or `{ success: false, error: message }` on failure (quota exceeded, etc.)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_



- [ ] 3. Implement Validator
  - [ ] 3.1 Implement `validateForm(itemName, amount, category)`
    - `itemName`: non-empty after `.trim()`, max 100 characters
    - `amount`: parses to finite number, ≥ 0.01, ≤ 9,999,999.99, at most 2 decimal places (use `Math.round(val * 100) / 100 === val` check)
    - `category`: must be one of `VALID_CATEGORIES`
    - Returns `{ valid: boolean, errors: { itemName?, amount?, category? } }`
    - _Requirements: 1.2, 1.3_



- [ ] 4. Implement UI Renderer functions
  - [ ] 4.1 Implement `renderTransactionList(transactions)`
    - Clear `<ul id="transaction-list">` and re-render from the array
    - Render transactions in reverse-insertion order (most recent at top, index 0)
    - Each `<li data-id="{id}">` contains: `<span class="item-name">`, `<span class="item-category">`, `<span class="item-amount">` formatted as `$X.XX`, and `<button class="delete-btn" aria-label="Delete {name}">✕</button>`
    - When array is empty, render `<li class="empty-state">No transactions recorded yet.</li>`
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 3.1_

  - [ ] 4.2 Implement `renderBalance(transactions)`
    - Sum all `transaction.amount` values
    - Update the balance DOM element with the result formatted as `$X.XX`
    - Display `$0.00` when the array is empty
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  

- [ ] 5. Implement Chart Controller
  - [ ] 5.1 Implement `computeCategoryTotals(transactions)`
    - Returns `{ Food: number, Transport: number, Fun: number }` where each value is the sum of amounts for that category
    - Returns all three keys with value `0` for an empty array
    - _Requirements: 5.1, 5.6_

  - [ ] 5.2 Implement `renderChart(transactions)`
    - Check `typeof Chart === 'undefined'`; if true, hide `<canvas>` and show fallback message *"Chart unavailable — could not load charting library."* inside `#chart-container`; return early
    - When `transactions` is empty: hide `<canvas id="spending-chart">`, show `<p id="chart-placeholder">` with *"No spending data available."*
    - When transactions exist: hide placeholder, show canvas; filter out zero-total categories; build `labels`, `data`, and `backgroundColor` arrays using `CATEGORY_COLORS`
    - On first call, create a new `Chart` instance (type `'doughnut'` or `'pie'`); on subsequent calls, mutate `chart.data` in-place and call `chart.update()`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.5_

 

- [ ] 6. Checkpoint — Core logic complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement Event Handlers and App Initializer
  - [ ] 7.1 Implement `handleFormSubmit(event)`
    - Prevent default form submission
    - Read `itemName`, `amount`, `category` from form fields
    - Call `validateForm`; if invalid, display inline error messages in the corresponding `<span class="error-msg">` elements and return
    - If valid: create a `Transaction` object with `crypto.randomUUID()`, trimmed `itemName`, parsed `amount`, `category`, and `Date.now()` timestamp
    - Prepend the new transaction to the in-memory `transactions` array
    - Call `saveTransactions(transactions)`; if `{ success: false }`, show error banner, remove the transaction from the array, and do NOT reset the form
    - On success: call `resetForm()`, then call `renderAll()`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.4, 6.1_

  - [ ] 7.2 Implement `handleDelete(transactionId)`
    - Find the transaction by `id` in the in-memory array
    - Remove it from the array
    - Call `saveTransactions(transactions)`; if `{ success: false }`, re-insert the transaction, show error banner, and return
    - On success: call `renderAll()`
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 6.2_

  - [ ] 7.3 Implement `renderAll()` and `initApp()`
    - `renderAll()`: calls `renderTransactionList(transactions)`, `renderBalance(transactions)`, `renderChart(transactions)` in sequence
    - `initApp()`: calls `loadTransactions()`, assigns result to `transactions`, then calls `renderAll()`; attach `submit` event listener to `#transaction-form` and a delegated `click` listener on `#transaction-list` for `.delete-btn` buttons (extract `data-id` and call `handleDelete`)
    - Wire `initApp` to `DOMContentLoaded`
    - _Requirements: 2.4, 3.3, 3.4, 4.2, 4.3, 5.2, 5.3, 6.3_

  

- [ ] 8. Apply CSS styling and accessibility
  - [ ] 8.1 Style layout and visual hierarchy in `css/style.css`
    - Apply a consistent visual hierarchy: heading, balance display, form section, transaction list section, chart section — each visually separated by borders, spacing, or background contrast
    - Ensure text contrast ratios meet WCAG AA (minimum 4.5:1 for normal text)
    - Make `#transaction-list` container scrollable (`overflow-y: auto` with a fixed `max-height`)
    - Style form fields, error messages, delete buttons, and the empty-state message
    - Style the chart placeholder and error banner
    - _Requirements: 9.1, 9.3_

  - [ ] 8.2 Finalize semantic HTML and accessibility attributes in `index.html`
    - Ensure every form control has a programmatically associated `<label>` (via `for`/`id` pairing)
    - Verify `aria-live="polite"` on all `.error-msg` spans
    - Verify `aria-label="Delete {name}"` on all delete buttons (set dynamically in `renderTransactionList`)
    - Verify semantic elements: `<header>`, `<main>`, `<section>`, `<form>`, `<ul>`, `<li>`
    - _Requirements: 9.4_





- [ ] 10. Final checkpoint — All tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with a minimum of 100 iterations per property
- Unit tests cover specific examples, edge cases, and error conditions
- The app has zero runtime dependencies — `fast-check` and `vitest` are test-only dev dependencies never loaded by the browser
- All 13 correctness properties from the design document are covered by PBT sub-tasks
- The `renderAll()` function is the single re-render entry point, ensuring list, balance, and chart always stay in sync

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["2.3", "3.2", "4.1", "4.2", "5.1"] },
    { "id": 4, "tasks": ["4.3", "5.2"] },
    { "id": 5, "tasks": ["5.3", "7.1", "7.2"] },
    { "id": 6, "tasks": ["7.3"] },
    { "id": 7, "tasks": ["7.4", "8.1", "8.2"] },
    { "id": 8, "tasks": ["8.3", "9.1"] }
  ]
}
```
