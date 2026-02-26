// ============================================================
// Expense API Service (Fake)
// ============================================================

import type { Expense, ExpenseFilters, AuditLogEntry } from '../types';
import { getExpenses, setExpenses, addAuditEntry } from '../store';
import { generateId, now, randomDelay } from '../utils/formatters';
import { API_DELAY_MIN, API_DELAY_MAX } from '../utils/constants';

// ─── Read ────────────────────────────────────────────────────

export async function fetchExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    let result = [...getExpenses()];

    if (!filters) return result;

    // Apply filters
    if (filters.salesmanId) {
        result = result.filter((e) => e.salesmanId === filters.salesmanId);
    }
    if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        result = result.filter((e) => statuses.includes(e.status));
    }
    if (filters.expenseType) {
        const types = Array.isArray(filters.expenseType) ? filters.expenseType : [filters.expenseType];
        result = result.filter((e) => types.includes(e.expenseType));
    }
    if (filters.dateFrom) {
        result = result.filter((e) => e.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
        result = result.filter((e) => e.date <= filters.dateTo!);
    }
    if (filters.amountMin !== undefined) {
        result = result.filter((e) => e.amount >= filters.amountMin!);
    }
    if (filters.amountMax !== undefined) {
        result = result.filter((e) => e.amount <= filters.amountMax!);
    }
    if (filters.hasReceipt !== undefined) {
        result = result.filter((e) => e.hasReceipt === filters.hasReceipt);
    }
    if (filters.policyViolation !== undefined) {
        result = result.filter((e) => e.policyViolation === filters.policyViolation);
    }
    if (filters.reportId !== undefined) {
        result = result.filter((e) => e.reportId === filters.reportId);
    }
    if (filters.fraudRiskMin !== undefined) {
        result = result.filter((e) => e.fraudRiskScore >= filters.fraudRiskMin!);
    }
    if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
            (e) =>
                e.description.toLowerCase().includes(q) ||
                e.expenseType.toLowerCase().includes(q) ||
                e.salesmanName.toLowerCase().includes(q) ||
                e.id.toLowerCase().includes(q)
        );
    }

    // Sort
    if (filters.sortBy) {
        const dir = filters.sortOrder === 'desc' ? -1 : 1;
        result.sort((a, b) => {
            const aVal = a[filters.sortBy!];
            const bVal = b[filters.sortBy!];
            if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
            return String(aVal).localeCompare(String(bVal)) * dir;
        });
    }

    // Pagination
    if (filters.offset) result = result.slice(filters.offset);
    if (filters.limit) result = result.slice(0, filters.limit);

    return result;
}

export async function fetchExpenseById(id: string): Promise<Expense | null> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);
    return getExpenses().find((e) => e.id === id) || null;
}

// ─── Write ───────────────────────────────────────────────────

export async function createExpense(data: Partial<Expense>): Promise<Expense> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const expense: Expense = {
        id: generateId('EXP'),
        salesmanId: data.salesmanId || 'SM001',
        salesmanName: data.salesmanName || 'Amit Sharma',
        expenseType: data.expenseType || 'Other',
        date: data.date || now().split('T')[0],
        amount: data.amount || 0,
        description: data.description || '',
        receiptUrl: data.receiptUrl || null,
        hasReceipt: data.hasReceipt || false,
        policyViolation: data.policyViolation || false,
        violationReason: data.violationReason,
        status: data.status || 'draft',
        reportId: data.reportId || null,
        currency: data.currency || 'INR',
        ocrResult: data.ocrResult || null,
        fraudRiskScore: data.fraudRiskScore || 0,
        fraudReasons: data.fraudReasons || [],
        duplicateOf: data.duplicateOf || null,
        duplicateSimilarity: data.duplicateSimilarity || 0,
        categoryConfidence: data.categoryConfidence || 1,
        tags: data.tags || [],
        approvedBy: null,
        approvedAt: null,
        paidAt: null,
        adminComments: null,
        createdAt: now(),
        updatedAt: now(),
    };

    const expenses = [...getExpenses(), expense];
    setExpenses(expenses);

    // Audit log
    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'expense',
        entityId: expense.id,
        action: 'created',
        performedBy: expense.salesmanName,
        performedAt: now(),
        details: `Created ${expense.expenseType} expense of ₹${expense.amount}`,
    });

    return expense;
}

export async function updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const expenses = getExpenses();
    const index = expenses.findIndex((e) => e.id === id);
    if (index === -1) throw new Error(`Expense ${id} not found`);

    const previous = expenses[index];
    const updated: Expense = { ...previous, ...updates, updatedAt: now() };
    const newExpenses = [...expenses];
    newExpenses[index] = updated;
    setExpenses(newExpenses);

    // Audit log
    const prevRecord = previous as unknown as Record<string, unknown>;
    const updRecord = updates as unknown as Record<string, unknown>;
    const changedFields = Object.keys(updates).filter(
        (k) => k !== 'updatedAt' && JSON.stringify(prevRecord[k]) !== JSON.stringify(updRecord[k])
    );

    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'expense',
        entityId: id,
        action: 'updated',
        performedBy: updated.salesmanName,
        performedAt: now(),
        details: `Updated fields: ${changedFields.join(', ')}`,
        previousValue: JSON.stringify(Object.fromEntries(changedFields.map((k) => [k, prevRecord[k]]))),
        newValue: JSON.stringify(Object.fromEntries(changedFields.map((k) => [k, updRecord[k]]))),
    });

    return updated;
}

export async function deleteExpense(id: string): Promise<void> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const expenses = getExpenses();
    const expense = expenses.find((e) => e.id === id);
    if (!expense) throw new Error(`Expense ${id} not found`);

    setExpenses(expenses.filter((e) => e.id !== id));

    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'expense',
        entityId: id,
        action: 'deleted',
        performedBy: expense.salesmanName,
        performedAt: now(),
        details: `Deleted ${expense.expenseType} expense of ₹${expense.amount}`,
    });
}

// ─── Bulk Operations ─────────────────────────────────────────

export async function bulkUpdateExpenseStatus(
    ids: string[],
    status: Expense['status'],
    performedBy: string = 'Admin'
): Promise<void> {
    await randomDelay(API_DELAY_MIN, API_DELAY_MAX);

    const expenses = getExpenses().map((e) => {
        if (ids.includes(e.id)) {
            return {
                ...e,
                status,
                updatedAt: now(),
                ...(status === 'approved' ? { approvedBy: performedBy, approvedAt: now() } : {}),
                ...(status === 'paid' ? { paidAt: now() } : {}),
            };
        }
        return e;
    });

    setExpenses(expenses);

    addAuditEntry({
        id: generateId('AUD'),
        entityType: 'expense',
        entityId: ids.join(','),
        action: 'bulk_action',
        performedBy,
        performedAt: now(),
        details: `Bulk ${status}: ${ids.length} expenses`,
    });
}
