// ============================================================
// useExpenses — React hook for expense operations
// ============================================================

'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import type { Expense, ExpenseFilters } from '../types';
import { subscribe, getSnapshot } from '../store';
import { seedStore } from '../seed';
import * as expenseApi from '../api/expense-api';

export function useExpenses(filters?: ExpenseFilters) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Subscribe to store changes
    const storeState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    // Seed on mount
    useEffect(() => {
        seedStore();
    }, []);

    // Fetch whenever store changes or filters change
    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);

        expenseApi.fetchExpenses(filters).then((data) => {
            if (!cancelled) {
                setExpenses(data);
                setIsLoading(false);
            }
        }).catch((err) => {
            if (!cancelled) {
                setError(err.message);
                setIsLoading(false);
            }
        });

        return () => { cancelled = true; };
        // Re-fetch when store state or filters change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storeState._lastSyncedAt, JSON.stringify(filters)]);

    const create = useCallback(async (data: Partial<Expense>) => {
        setIsLoading(true);
        try {
            const result = await expenseApi.createExpense(data);
            setError(null);
            return result;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create expense';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const update = useCallback(async (id: string, updates: Partial<Expense>) => {
        try {
            const result = await expenseApi.updateExpense(id, updates);
            setError(null);
            return result;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update expense';
            setError(message);
            throw err;
        }
    }, []);

    const remove = useCallback(async (id: string) => {
        try {
            await expenseApi.deleteExpense(id);
            setError(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete expense';
            setError(message);
            throw err;
        }
    }, []);

    const bulkUpdateStatus = useCallback(async (
        ids: string[],
        status: Expense['status'],
        performedBy?: string
    ) => {
        try {
            await expenseApi.bulkUpdateExpenseStatus(ids, status, performedBy);
            setError(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Bulk update failed';
            setError(message);
            throw err;
        }
    }, []);

    const getById = useCallback(async (id: string) => {
        return expenseApi.fetchExpenseById(id);
    }, []);

    return {
        expenses,
        isLoading,
        error,
        create,
        update,
        remove,
        bulkUpdateStatus,
        getById,
        totalCount: expenses.length,
        draftCount: expenses.filter((e) => e.status === 'draft').length,
        violationCount: expenses.filter((e) => e.policyViolation).length,
    };
}
