// ============================================================
// Duplicate Detection Engine
// ============================================================

import type { DuplicateMatch, Expense } from '../types';
import { getExpenses } from '../store';
import { expenseFingerprint, stringSimilarity } from '../utils/hash';
import { DUPLICATE_THRESHOLD } from '../utils/constants';

// ─── Detect Duplicates for a Single Expense ──────────────────

export function detectDuplicates(expense: Partial<Expense>, excludeId?: string): DuplicateMatch[] {
    const allExpenses = getExpenses().filter((e) => e.id !== excludeId);
    const matches: DuplicateMatch[] = [];

    if (!expense.amount || !expense.date || !expense.expenseType) return matches;

    const targetFingerprint = expenseFingerprint(expense.amount, expense.date, expense.expenseType);

    for (const existing of allExpenses) {
        const existingFingerprint = expenseFingerprint(existing.amount, existing.date, existing.expenseType);
        const matchReasons: string[] = [];
        let similarity = 0;

        // 1. Exact fingerprint match (same amount + date + type)
        if (targetFingerprint === existingFingerprint) {
            matchReasons.push('Same amount, date, and type');
            similarity += 0.6;
        }

        // 2. Same amount on same date (different type)
        if (expense.amount === existing.amount && expense.date === existing.date) {
            if (!matchReasons.length) matchReasons.push('Same amount on same date');
            similarity += 0.3;
        }

        // 3. Same amount within date range
        if (expense.amount === existing.amount) {
            const daysDiff = Math.abs(
                (new Date(expense.date).getTime() - new Date(existing.date).getTime()) / 86400000
            );
            if (daysDiff <= DUPLICATE_THRESHOLD.dayRange && daysDiff > 0) {
                matchReasons.push(`Same amount within ${DUPLICATE_THRESHOLD.dayRange} days`);
                similarity += 0.2;
            }
        }

        // 4. Description similarity
        if (expense.description && existing.description &&
            expense.description.length >= DUPLICATE_THRESHOLD.descriptionMinLength) {
            const descSim = stringSimilarity(expense.description, existing.description);
            if (descSim >= 0.7) {
                matchReasons.push('Similar description');
                similarity += descSim * 0.3;
            }
        }

        // Cap at 1.0
        similarity = Math.min(similarity, 1.0);

        if (similarity >= DUPLICATE_THRESHOLD.similarity && matchReasons.length > 0) {
            matches.push({
                expenseId: excludeId || 'new',
                matchedExpenseId: existing.id,
                similarity: parseFloat(similarity.toFixed(2)),
                matchReasons,
            });
        }
    }

    // Sort by similarity descending
    matches.sort((a, b) => b.similarity - a.similarity);
    return matches;
}

// ─── Batch Duplicate Check ───────────────────────────────────

export function detectDuplicatesInBatch(expenses: Expense[]): Map<string, DuplicateMatch[]> {
    const duplicateMap = new Map<string, DuplicateMatch[]>();

    for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        const others = expenses.filter((_, j) => j !== i);

        const matches: DuplicateMatch[] = [];
        for (const other of others) {
            const matchReasons: string[] = [];
            let similarity = 0;

            // Same amount + date + type
            if (expense.amount === other.amount && expense.date === other.date && expense.expenseType === other.expenseType) {
                matchReasons.push('Same amount, date, and type');
                similarity = 0.9;
            } else if (expense.amount === other.amount && expense.date === other.date) {
                matchReasons.push('Same amount and date');
                similarity = 0.7;
            }

            if (similarity >= DUPLICATE_THRESHOLD.similarity) {
                matches.push({
                    expenseId: expense.id,
                    matchedExpenseId: other.id,
                    similarity: parseFloat(similarity.toFixed(2)),
                    matchReasons,
                });
            }
        }

        if (matches.length > 0) {
            duplicateMap.set(expense.id, matches);
        }
    }

    return duplicateMap;
}

// ─── Check if Similar Expense Exists ─────────────────────────

export function hasPotentialDuplicate(expense: Partial<Expense>, excludeId?: string): boolean {
    return detectDuplicates(expense, excludeId).length > 0;
}
