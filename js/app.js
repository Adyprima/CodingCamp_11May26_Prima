// Expense & Budget Visualizer — app.js

// === Constants & Config ===
const CATEGORY_COLORS = { Food: '#FF6384', Transport: '#36A2EB', Fun: '#FFCE56' };
const VALID_CATEGORIES = ['Food', 'Transport', 'Fun'];
const STORAGE_KEY = 'expense_transactions';

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
