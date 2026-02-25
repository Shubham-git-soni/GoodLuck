// ============================================================
// Smart Defaults Engine
// ============================================================
// Auto-suggest values based on user's expense history.

import type { Expense } from '../types';
import { getExpenses } from '../store';

interface SmartDefaults {
    expenseType: string | null;
    amount: number | null;
    description: string | null;
    city: string | null;
}

// ─── Get Smart Defaults for New Expense ──────────────────────

export function getSmartDefaults(salesmanId: string): SmartDefaults {
    const expenses = getExpenses().filter((e) => e.salesmanId === salesmanId);

    if (expenses.length === 0) {
        return { expenseType: null, amount: null, description: null, city: null };
    }

    return {
        expenseType: getMostFrequentType(expenses),
        amount: getTypicalAmount(expenses),
        description: getRecentDescription(expenses),
        city: null, // could be derived from visits
    };
}

// ─── Most Frequent Expense Type ──────────────────────────────

function getMostFrequentType(expenses: Expense[]): string | null {
    const today = new Date().getDay(); // 0=Sun, 6=Sat

    // Filter by same day-of-week first
    const sameDayExpenses = expenses.filter((e) => new Date(e.date).getDay() === today);
    const source = sameDayExpenses.length >= 3 ? sameDayExpenses : expenses;

    const counts: Record<string, number> = {};
    for (const expense of source) {
        counts[expense.expenseType] = (counts[expense.expenseType] || 0) + 1;
    }

    const entries = Object.entries(counts);
    if (entries.length === 0) return null;

    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
}

// ─── Typical Amount (median of last 10) ──────────────────────

function getTypicalAmount(expenses: Expense[]): number | null {
    const sorted = [...expenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

    if (sorted.length === 0) return null;

    const amounts = sorted.map((e) => e.amount).sort((a, b) => a - b);
    const mid = Math.floor(amounts.length / 2);
    return amounts.length % 2 === 0
        ? Math.round((amounts[mid - 1] + amounts[mid]) / 2)
        : amounts[mid];
}

// ─── Recent Description Patterns ─────────────────────────────

function getRecentDescription(expenses: Expense[]): string | null {
    const recent = expenses
        .filter((e) => e.description && e.description.trim().length > 0)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return recent.length > 0 ? recent[0].description : null;
}

// ─── Get Suggested Amounts Per Category ──────────────────────

export function getSuggestedAmounts(salesmanId: string): Record<string, number> {
    const expenses = getExpenses().filter((e) => e.salesmanId === salesmanId);
    const result: Record<string, number> = {};

    const byType: Record<string, number[]> = {};
    for (const expense of expenses) {
        if (!byType[expense.expenseType]) byType[expense.expenseType] = [];
        byType[expense.expenseType].push(expense.amount);
    }

    for (const [type, amounts] of Object.entries(byType)) {
        // Use median
        amounts.sort((a, b) => a - b);
        const mid = Math.floor(amounts.length / 2);
        result[type] = amounts.length % 2 === 0
            ? Math.round((amounts[mid - 1] + amounts[mid]) / 2)
            : amounts[mid];
    }

    return result;
}

// ─── Get Frequently Used Descriptions ────────────────────────

export function getFrequentDescriptions(salesmanId: string, limit: number = 5): string[] {
    const expenses = getExpenses()
        .filter((e) => e.salesmanId === salesmanId && e.description)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Unique descriptions, most recent first
    const seen = new Set<string>();
    const result: string[] = [];
    for (const expense of expenses) {
        const desc = expense.description.trim();
        if (desc && !seen.has(desc.toLowerCase())) {
            seen.add(desc.toLowerCase());
            result.push(desc);
            if (result.length >= limit) break;
        }
    }

    return result;
}
