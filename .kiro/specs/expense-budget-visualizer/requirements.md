# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to track personal expenses, categorize spending, and visualize their budget distribution through an interactive pie chart. The application runs entirely in the browser using HTML, CSS, and Vanilla JavaScript, with all data persisted via the browser's Local Storage API. No backend server or build toolchain is required.

## Glossary

- **App**: The Expense & Budget Visualizer web application
- **Transaction**: A single expense entry consisting of an item name, a monetary amount, and a category
- **Category**: A classification label for a transaction; one of: Food, Transport, or Fun
- **Transaction_List**: The scrollable UI component that displays all stored transactions
- **Input_Form**: The UI form component used to create new transactions
- **Balance_Display**: The UI component at the top of the page that shows the total sum of all transaction amounts
- **Chart**: The pie chart UI component that visualizes spending distribution by category
- **Local_Storage**: The browser's `localStorage` API used for client-side data persistence
- **Validator**: The logic component responsible for validating Input_Form field values before submission

---

## Requirements

### Requirement 1: Transaction Input Form

**User Story:** As a user, I want to fill in a form with an item name, amount, and category so that I can record a new expense transaction.

#### Acceptance Criteria

1. THE Input_Form SHALL provide a text field for the item name (maximum 100 characters), a numeric field for the amount (accepting values between 0.01 and 9,999,999.99 with up to 2 decimal places), and a dropdown selector for the category with options: Food, Transport, Fun.
2. WHEN the user submits the Input_Form, THE Validator SHALL verify that the item name field is not empty and not whitespace-only, the amount field contains a numeric value between 0.01 and 9,999,999.99, and a category has been selected from the dropdown.
3. IF the Validator detects that any required field is empty, whitespace-only, or invalid, THEN THE Input_Form SHALL display an inline error message identifying the missing or invalid field and SHALL NOT create a transaction.
4. WHEN all fields pass validation and the user submits the Input_Form, THE App SHALL create a new Transaction and add it to the Transaction_List. IF the transaction creation fails due to a system error, THEN THE App SHALL display a visible error message and SHALL NOT reset the Input_Form fields.
5. WHEN a Transaction is successfully created, THE Input_Form SHALL reset all fields to their default empty state, with the category dropdown returning to its unselected placeholder state.

---

### Requirement 2: Transaction List Display

**User Story:** As a user, I want to see a scrollable list of all my recorded transactions so that I can review my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all stored transactions, each showing the item name, amount formatted to 2 decimal places with a currency symbol (e.g., $10.00), and category.
2. WHILE the number of transactions exceeds the visible area of the Transaction_List, THE Transaction_List SHALL be scrollable to allow access to all entries.
3. THE Transaction_List SHALL display transactions in the order they were added, with the most recently added transaction appearing at the top.
4. WHEN a transaction is added or deleted, THE Transaction_List SHALL update to reflect the current state of all stored transactions within 1 second.
5. WHEN the last transaction is deleted and the transaction count reaches zero, THE Transaction_List SHALL display an empty state message indicating that no transactions have been recorded.
6. THE Transaction_List SHALL support a maximum of 10,000 stored transactions. WHEN the transaction count exceeds 10,000, THE App SHALL continue to allow new transactions to be added without enforcing a hard limit.

---

### Requirement 3: Delete Transaction

**User Story:** As a user, I want to delete a transaction from the list so that I can correct mistakes or remove outdated entries.

#### Acceptance Criteria

1. THE Transaction_List SHALL render a uniquely identifiable delete button for each transaction entry.
2. WHEN the user activates the delete button for a transaction, THE App SHALL remove that transaction from Local_Storage and from the Transaction_List.
3. WHEN a transaction is deleted, THE Balance_Display SHALL update to show the recalculated sum of all remaining transaction amounts, regardless of whether the delete operation fully succeeded in storage.
4. WHEN a transaction is deleted, THE Chart SHALL update to show the recalculated spending distribution across all remaining transactions.
5. IF Local_Storage fails to remove the transaction (e.g., due to a storage error), THEN THE App SHALL display a visible error message and SHALL keep the transaction visible in the Transaction_List.

---

### Requirement 4: Total Balance Display

**User Story:** As a user, I want to see my total spending balance at the top of the page so that I always know how much I have spent in total.

#### Acceptance Criteria

1. THE Balance_Display SHALL show the sum of the amounts of all current transactions, formatted to 2 decimal places with a currency symbol.
2. WHEN a new transaction is added, THE Balance_Display SHALL update automatically to include the new transaction's amount.
3. WHEN a transaction is deleted, THE Balance_Display SHALL update automatically to exclude the deleted transaction's amount.
4. WHILE no transactions exist, THE Balance_Display SHALL show a total of zero (e.g., $0.00).

---

### Requirement 5: Spending Distribution Chart

**User Story:** As a user, I want to see a pie chart of my spending by category so that I can understand where my money is going.

#### Acceptance Criteria

1. THE Chart SHALL render a pie chart that displays the proportion of total spending for each category (Food, Transport, Fun), with each slice labeled with the category name and its percentage of total spending. WHEN no transactions exist, THE Chart SHALL skip percentage calculations entirely and display a placeholder state instead.
2. WHEN a transaction is added, THE Chart SHALL update automatically to reflect the new spending distribution across categories.
3. WHEN a transaction is deleted, THE Chart SHALL update automatically to reflect the revised spending distribution across categories.
4. WHILE no transactions exist, THE Chart SHALL display a placeholder state with a visible message indicating that no spending data is available.
5. THE Chart SHALL assign one unique, visually distinct color to each category (Food, Transport, Fun) that remains consistent across all chart updates.
6. WHILE a category has a total spending amount of zero, THE Chart SHALL omit that category's slice from the pie chart display.

---

### Requirement 6: Data Persistence

**User Story:** As a user, I want my transactions to be saved between browser sessions so that I do not lose my data when I close or refresh the page.

#### Acceptance Criteria

1. WHEN a transaction is created, THE App SHALL save the transaction to Local_Storage synchronously before returning control to the user.
2. WHEN a transaction is deleted, THE App SHALL remove the transaction from Local_Storage synchronously before returning control to the user.
3. WHEN the App is loaded or refreshed, THE App SHALL read all transactions from Local_Storage and populate the Transaction_List, Balance_Display, and Chart with the stored data. WHERE Local_Storage contains previously saved transactions, THE App SHALL load and display those transactions rather than starting with an empty state.
4. IF Local_Storage is unavailable or returns a parse error on load, THEN THE App SHALL initialize with an empty transaction state (zero transactions, balance of $0.00, empty chart) and SHALL NOT throw an unhandled error.
5. IF a Local_Storage write operation fails (e.g., quota exceeded), THEN THE App SHALL preserve the current in-memory transaction state and display a visible error message to the user indicating that the data could not be saved.

---

### Requirement 7: File and Code Structure

**User Story:** As a developer, I want the project to follow a clean, minimal file structure so that the codebase is easy to read and maintain.

#### Acceptance Criteria

1. THE App SHALL be structured with exactly one HTML file at the project root, exactly one CSS file inside a `css/` directory, and exactly one JavaScript file inside a `js/` directory.
2. THE App SHALL use only HTML, CSS, and Vanilla JavaScript with no frontend frameworks (such as React or Vue).
3. WHERE a charting library is required, THE App SHALL load Chart.js via a CDN `<script>` tag and SHALL NOT require a local build step or package manager.
4. THE App SHALL operate entirely client-side with no backend server dependency.
5. IF the Chart.js CDN fails to load, THEN THE App SHALL display a visible error message in the chart area indicating that the chart is unavailable, and all other features (Input_Form, Transaction_List, Balance_Display) SHALL continue to function correctly.

---

### Requirement 8: Browser Compatibility

**User Story:** As a user, I want the app to work in any modern browser so that I can use it regardless of my preferred browser.

#### Acceptance Criteria

1. THE App SHALL function correctly in the current stable versions of Chrome, Firefox, Edge, and Safari, such that all UI elements render visibly and all interactive features (form submission, transaction deletion, chart updates, balance updates) execute without uncaught JavaScript errors.
2. THE App SHALL be usable as a standalone web page opened directly from the file system (via `file://` protocol), with all features accessible and no cross-origin errors blocking core functionality.

---

### Requirement 9: Responsive and Accessible UI

**User Story:** As a user, I want a clean, readable interface that responds to my interactions without lag so that using the app feels smooth and intuitive.

#### Acceptance Criteria

1. THE App SHALL apply a consistent visual hierarchy with text contrast ratios meeting WCAG AA standards (minimum 4.5:1 for normal text) between headings, labels, and body text.
2. WHEN the user interacts with the Input_Form or delete controls, THE App SHALL reflect the resulting state change (updated list, balance, and chart) within 100 milliseconds.
3. THE Input_Form, Transaction_List, Balance_Display, and Chart SHALL each be visually distinct sections within the page layout, separated by observable visual boundaries (e.g., borders, spacing, or background contrast).
4. THE App SHALL use semantic HTML elements and provide programmatically associated labels for all form controls to support screen reader accessibility.
