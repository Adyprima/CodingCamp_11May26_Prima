// Expense & Budget Visualizer — app.js

// === Constants & Config ===
const CATEGORY_COLORS = {
  Food: "#FF6384",
  Transport: "#36A2EB",
  Fun: "#FFCE56",
};
const VALID_CATEGORIES = ["Food", "Transport", "Fun"];
const STORAGE_KEY = "expense_transactions";
const CUSTOM_CATEGORIES_KEY = "ebv_custom_categories";

// === Data Model ===
/**
 * @typedef {Object} Transaction
 * @property {string} id        - Unique identifier
 * @property {string} itemName  - Item name (1–100 chars, non-whitespace)
 * @property {number} amount    - Positive number, max 2 decimal places
 * @property {string} category  - "Food" | "Transport" | "Fun"
 * @property {number} timestamp - Unix timestamp (ms) when the transaction was created
 */

let transactions = [];

// === Storage Service ===
/**
 * Loads transactions from localStorage.
 * Returns an empty array on any error (unavailable storage, parse failure, etc.).
 * @returns {Transaction[]}
 */
function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch (_err) {
    return [];
  }
}

/**
 * Saves transactions to localStorage.
 * @param {Transaction[]} transactions
 * @returns {{ success: true } | { success: false, error: string }}
 */
function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// === Validator ===

// === Chart Controller ===

// === UI Renderer ===

// === Event Handlers ===

// === App Initializer ===

// === Theme Toggle ===
const THEME_KEY = "ebv_theme";

function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.textContent = isDark ? "☀️" : "🌙";
    btn.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode",
    );
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  // Respect saved preference; fall back to OS preference
  const prefersDark =
    saved !== null
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const isDark = !document.body.classList.contains("dark");
    applyTheme(isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initCustomCategories();
  initMonthlySummary();
});

// === Custom Categories ===

/**
 * Load custom categories from localStorage.
 * @returns {{ name: string, color: string }[]}
 */
function loadCustomCategories() {
  try {
    const raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch (_err) {
    return [];
  }
}

/**
 * Save custom categories to localStorage.
 * @param {{ name: string, color: string }[]} categories
 */
function saveCustomCategories(categories) {
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (_err) {
    // non-critical — silently ignore
  }
}
/**
 * Save custom categories to localStorage.
 * @param {{ name: string, color: string }[]} categories
 */
function saveCustomCategories(categories) {
  try {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (_err) {
    // non-critical — silently ignore
  }
}

/**
 * Register a custom category into the live VALID_CATEGORIES and CATEGORY_COLORS maps.
 * @param {string} name
 * @param {string} color  hex string e.g. "#a855f7"
 */
function registerCategory(name, color) {
  if (!VALID_CATEGORIES.includes(name)) {
    VALID_CATEGORIES.push(name);
  }
  CATEGORY_COLORS[name] = color;
}

/**
 * Rebuild the <select id="category"> options from VALID_CATEGORIES,
 * preserving the current selection if possible.
 */
function refreshCategorySelect() {
  const select = document.getElementById("category");
  if (!select) return;
  const current = select.value;

  // Clear all options except the placeholder
  while (select.options.length > 1) {
    select.remove(1);
  }

  VALID_CATEGORIES.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });

  // Restore previous selection if it still exists
  if (current && VALID_CATEGORIES.includes(current)) {
    select.value = current;
  }
}

/**
 * Wire up the "Add Category" dialog: open, cancel, save, color preview.
 */
function initCustomCategories() {
  // Load and register any previously saved custom categories
  const saved = loadCustomCategories();
  saved.forEach(({ name, color }) => registerCategory(name, color));
  refreshCategorySelect();

  const dialog = document.getElementById("category-dialog");
  const openBtn = document.getElementById("open-add-category");
  const cancelBtn = document.getElementById("cancel-category");
  const saveBtn = document.getElementById("save-category");
  const saveTR = document.getElementById("save-transaction");
  const nameInput = document.getElementById("new-category-name");
  const colorInput = document.getElementById("new-category-color");
  const colorLabel = document.getElementById("color-preview-label");
  const nameError = document.getElementById("new-category-error");
  const itemNama = document.getElementById("item-name");
  const amountInput = document.getElementById("amount");

  // Open dialog
  openBtn.addEventListener("click", () => {
    nameInput.value = "";
    nameError.textContent = "";
    colorInput.value = "#a855f7";
    colorLabel.textContent = "#a855f7";
    dialog.showModal();
    nameInput.focus();
  });

  // Live color label update
  colorInput.addEventListener("input", () => {
    colorLabel.textContent = colorInput.value;
  });

  // Cancel
  cancelBtn.addEventListener("click", () => {
    dialog.close();
  });

  // Close on backdrop click
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  // Save
  saveBtn.addEventListener("click", () => {
    const rawName = nameInput.value.trim();
    nameError.textContent = "";

    // Validate
    if (!rawName) {
      nameError.textContent = "Category name is required.";
      nameInput.focus();
      return;
    }
    if (rawName.length > 30) {
      nameError.textContent = "Name must be 30 characters or fewer.";
      nameInput.focus();
      return;
    }
    if (
      VALID_CATEGORIES.map((c) => c.toLowerCase()).includes(
        rawName.toLowerCase(),
      )
    ) {
      nameError.textContent = "That category already exists.";
      nameInput.focus();
      return;
    }

    const color = colorInput.value;

    // Register in memory
    registerCategory(rawName, color);

    // Persist
    const existing = loadCustomCategories();
    existing.push({ name: rawName, color });
    saveCustomCategories(existing);

    // Update the dropdown and auto-select the new category
    refreshCategorySelect();
    document.getElementById("category").value = rawName;

    dialog.close();
  });

  // Save
  saveTR.addEventListener("click", () => {
    const rawName = itemNama.value.trim();
    const amount = amountInput.value;
    const existing = loadTransactions();
    existing.push({ amount });
    saveTransactions(existing);
    // // // 1. Find the parent element where you want the list (e.g., a div)
    // const container = document.getElementById("transaction-list-container");
    // // // 2. Create the <ul> element
    // const ul = document.createElement("ul");
    // // // 3. Create an <li> element
    // const li = document.createElement("li");
    // li.textContent = itemName.value.trim(); // Add text to the li
    // // // 4. Put the <li> inside the <ul>, then <ul> into the container
    // ul.appendChild(li);
    // container.appendChild(ul);
  });
}
const myForm = document.getElementById("transaction-form");
myForm.addEventListener("submit", function (event) {
  // Prevent the page from refreshing (default behavior)
  event.preventDefault();
  const savedItems =
    JSON.parse(localStorage.getItem("expense_transactions")) || [];
  let totalAmount = 0;
  savedItems.forEach((itemText) => {
    const li = document.createElement("li");
    const balance = document.getElementById("balance-display");
    totalAmount += Number(itemText.amount);
    balance.textContent = `$${totalAmount}.00`;
  });
  // Your logic here (e.g., validation or AJAX request)
});

// === Monthly Summary ===

/** Currently viewed month state: { year: number, month: number (0-based) } */
let summaryView = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
};

/**
 * Returns the long month+year label, e.g. "May 2026".
 * @param {number} year
 * @param {number} month  0-based
 * @returns {string}
 */
function formatMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

/**
 * Filter transactions that belong to the given year/month.
 * Uses the transaction's `timestamp` field (ms since epoch).
 * @param {Transaction[]} txns
 * @param {number} year
 * @param {number} month  0-based
 * @returns {Transaction[]}
 */
function filterByMonth(txns, year, month) {
  return txns.filter((t) => {
    const d = new Date(t.timestamp);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

/**
 * Compute per-category totals for a list of transactions.
 * @param {Transaction[]} txns
 * @returns {{ [category: string]: number }}
 */
function computeMonthlyTotals(txns) {
  const totals = {};
  txns.forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });
  return totals;
}

/**
 * Render the monthly summary section for the current `summaryView`.
 * Reads from the global `transactions` array.
 */
function renderMonthlySummary() {
  const { year, month } = summaryView;

  // Update label
  document.getElementById("month-label").textContent = formatMonthLabel(
    year,
    month,
  );

  // Disable "next" if we're already on the current month
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  document.getElementById("month-next").disabled = isCurrentMonth;

  const monthTxns = filterByMonth(transactions, year, month);
  const content = document.getElementById("monthly-content");

  if (monthTxns.length === 0) {
    content.innerHTML =
      '<p class="monthly-empty">No transactions recorded for this month.</p>';
    return;
  }

  const total = monthTxns.reduce((sum, t) => sum + t.amount, 0);
  const totals = computeMonthlyTotals(monthTxns);

  // Sort categories by total descending
  const sortedCats = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  // Build stats row
  const statsHtml = `
    <div class="monthly-stats">
      <div class="monthly-stat">
        <span class="monthly-stat-label">Total Spent</span>
        <span class="monthly-stat-value">$${total.toFixed(2)}</span>
      </div>
      <div class="monthly-stat">
        <span class="monthly-stat-label">Transactions</span>
        <span class="monthly-stat-value neutral">${monthTxns.length}</span>
      </div>
      <div class="monthly-stat">
        <span class="monthly-stat-label">Categories</span>
        <span class="monthly-stat-value neutral">${sortedCats.length}</span>
      </div>
    </div>`;

  // Build breakdown table rows
  const rowsHtml = sortedCats
    .map(([cat, catTotal]) => {
      const pct = total > 0 ? (catTotal / total) * 100 : 0;
      const color = CATEGORY_COLORS[cat] || "#888888";
      return `
      <tr>
        <td>
          <span class="cat-name">
            <span class="cat-dot" style="background-color:${color}"></span>
            ${escapeHtml(cat)}
          </span>
        </td>
        <td class="amount">$${catTotal.toFixed(2)}</td>
        <td class="pct">${pct.toFixed(1)}%</td>
        <td class="monthly-bar-cell">
          <div class="monthly-bar-track">
            <div class="monthly-bar-fill" style="width:${pct.toFixed(1)}%;background-color:${color}"></div>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  const tableHtml = `
    <table class="monthly-table" aria-label="Spending breakdown by category for ${formatMonthLabel(year, month)}">
      <thead>
        <tr>
          <th>Category</th>
          <th>Total</th>
          <th>Share</th>
          <th></th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>`;

  content.innerHTML = statsHtml + tableHtml;
}

/**
 * Minimal HTML escape to prevent XSS from user-supplied category names.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Wire up the month navigator and do the initial render.
 */
function initMonthlySummary() {
  document.getElementById("month-prev").addEventListener("click", () => {
    summaryView.month -= 1;
    if (summaryView.month < 0) {
      summaryView.month = 11;
      summaryView.year -= 1;
    }
    renderMonthlySummary();
  });

  document.getElementById("month-next").addEventListener("click", () => {
    const now = new Date();
    // Guard: never navigate past the current month
    if (
      summaryView.year === now.getFullYear() &&
      summaryView.month === now.getMonth()
    )
      return;
    summaryView.month += 1;
    if (summaryView.month > 11) {
      summaryView.month = 0;
      summaryView.year += 1;
    }
    renderMonthlySummary();
  });

  renderMonthlySummary();
}
