// ============================================================
// usePolicies — React hook for expense policy operations
// ============================================================

'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import type { ExpensePolicy } from '../types';
import { subscribe, getSnapshot } from '../store';
import { seedStore } from '../seed';
import * as policyApi from '../api/policy-api';

export function usePolicies(activeOnly: boolean = false) {
    const [policies, setPolicies] = useState<ExpensePolicy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const storeState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    useEffect(() => {
        seedStore();
    }, []);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);

        policyApi.fetchPolicies(activeOnly).then((data) => {
            if (!cancelled) {
                setPolicies(data);
                setIsLoading(false);
            }
        }).catch((err) => {
            if (!cancelled) {
                setError(err.message);
                setIsLoading(false);
            }
        });

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storeState._lastSyncedAt, activeOnly]);

    const create = useCallback(async (data: Partial<ExpensePolicy>) => {
        try {
            const result = await policyApi.createPolicy(data);
            setError(null);
            return result;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create policy';
            setError(message);
            throw err;
        }
    }, []);

    const update = useCallback(async (id: string, updates: Partial<ExpensePolicy>) => {
        try {
            const result = await policyApi.updatePolicy(id, updates);
            setError(null);
            return result;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update policy';
            setError(message);
            throw err;
        }
    }, []);

    const remove = useCallback(async (id: string) => {
        try {
            await policyApi.deletePolicy(id);
            setError(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete policy';
            setError(message);
            throw err;
        }
    }, []);

    const toggle = useCallback(async (id: string) => {
        try {
            const result = await policyApi.togglePolicy(id);
            setError(null);
            return result;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to toggle policy';
            setError(message);
            throw err;
        }
    }, []);

    const getByType = useCallback(async (type: string) => {
        return policyApi.fetchPolicyByType(type);
    }, []);

    return {
        policies,
        isLoading,
        error,
        create,
        update,
        remove,
        toggle,
        getByType,
        policyCount: policies.length,
        activePolicies: policies.filter((p) => p.isActive),
        receiptRequiredCount: policies.filter((p) => p.receiptRequired).length,
        avgDailyLimit: policies.length > 0
            ? Math.round(policies.reduce((sum, p) => sum + p.dailyLimit, 0) / policies.length)
            : 0,
    };
}
