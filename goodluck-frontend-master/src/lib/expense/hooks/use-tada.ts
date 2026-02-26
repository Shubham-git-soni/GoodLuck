// ============================================================
// useTada — React hook for TA/DA claim operations
// ============================================================

'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import type { TadaClaim, TadaFilters } from '../types';
import { subscribe, getSnapshot } from '../store';
import { seedStore } from '../seed';
import * as tadaApi from '../api/tada-api';

export function useTada(filters?: TadaFilters) {
    const [claims, setClaims] = useState<TadaClaim[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const storeState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    useEffect(() => {
        seedStore();
    }, []);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);

        tadaApi.fetchTadaClaims(filters).then((data) => {
            if (!cancelled) {
                setClaims(data);
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
    }, [storeState._lastSyncedAt, JSON.stringify(filters)]);

    const create = useCallback(async (data: Partial<TadaClaim>) => {
        setIsLoading(true);
        try {
            const result = await tadaApi.createTadaClaim(data);
            setError(null);
            return result;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create claim';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const approve = useCallback(async (id: string, approvedBy?: string) => {
        try {
            const result = await tadaApi.approveTadaClaim(id, approvedBy);
            setError(null);
            return result;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to approve claim';
            setError(message);
            throw err;
        }
    }, []);

    const reject = useCallback(async (id: string, rejectedBy?: string, comments?: string) => {
        try {
            const result = await tadaApi.rejectTadaClaim(id, rejectedBy, comments);
            setError(null);
            return result;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to reject claim';
            setError(message);
            throw err;
        }
    }, []);

    const bulkApprove = useCallback(async (ids: string[], approvedBy?: string) => {
        await tadaApi.bulkApproveTadaClaims(ids, approvedBy);
    }, []);

    const bulkReject = useCallback(async (ids: string[], rejectedBy?: string, comments?: string) => {
        await tadaApi.bulkRejectTadaClaims(ids, rejectedBy, comments);
    }, []);

    return {
        claims,
        isLoading,
        error,
        create,
        approve,
        reject,
        bulkApprove,
        bulkReject,
        pendingCount: claims.filter((c) => c.status === 'Pending').length,
        approvedCount: claims.filter((c) => c.status === 'Approved').length,
        flaggedCount: claims.filter((c) => c.status === 'Flagged').length,
        totalApprovedAmount: claims
            .filter((c) => c.status === 'Approved')
            .reduce((sum, c) => sum + c.amount, 0),
    };
}
