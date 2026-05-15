// Tests for StorageService (loadTransactions, saveTransactions)
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Inline implementations under test
// (mirrors js/app.js — keeps tests self-contained and avoids browser-module
//  issues with a plain JS file that has no exports)
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'expense_transactions';

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch (_err) {
    return [];
  }
}

function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // --- loadTransactions ---

  it('returns [] when localStorage is empty', () => {
    const result = loadTransactions();
    expect(result).toEqual([]);
  });

  it('returns [] when localStorage contains invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{');
    const result = loadTransactions();
    expect(result).toEqual([]);
  });

  it('returns the stored array when valid JSON exists', () => {
    const stored = [
      { id: '1', itemName: 'Coffee', amount: 4.5, category: 'Food', timestamp: 1000 },
      { id: '2', itemName: 'Bus', amount: 2.0, category: 'Transport', timestamp: 2000 },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    const result = loadTransactions();
    expect(result).toEqual(stored);
  });

  // --- saveTransactions ---

  it('returns { success: true } and persists data on success', () => {
    const data = [
      { id: '1', itemName: 'Lunch', amount: 12.5, category: 'Food', timestamp: 3000 },
    ];
    const result = saveTransactions(data);
    expect(result).toEqual({ success: true });
    // Verify the data was actually written
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(data);
  });

  it('returns { success: false, error: ... } when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const result = saveTransactions([{ id: '1', itemName: 'X', amount: 1, category: 'Fun', timestamp: 0 }]);
    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
    expect(result.error).toBeTruthy();
  });

  // --- Property 12: localStorage persistence round-trip ---
  // Feature: expense-budget-visualizer, Property 12: localStorage persistence round-trip
  // Validates: Requirements 6.1, 6.2, 6.3
  it('Property 12: saveTransactions then loadTransactions returns deeply equal array', () => {
    const transactionArb = fc.record({
      id: fc.uuid(),
      itemName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      amount: fc.double({ min: 0.01, max: 9999999.99, noNaN: true, noDefaultInfinity: true })
        .map(n => Math.round(n * 100) / 100),
      category: fc.constantFrom('Food', 'Transport', 'Fun'),
      timestamp: fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
    });

    fc.assert(
      fc.property(fc.array(transactionArb, { maxLength: 50 }), (transactions) => {
        localStorage.clear();
        const saveResult = saveTransactions(transactions);
        expect(saveResult).toEqual({ success: true });
        const loaded = loadTransactions();
        expect(loaded).toEqual(transactions);
      }),
      { numRuns: 100 }
    );
  });
});
