// ============================================================
// useAuditLog — React hook for the activity timeline
// ============================================================

'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import type { AuditLogEntry } from '../types';
import { subscribe, getSnapshot, getAuditLog } from '../store';
import { seedStore } from '../seed';

interface AuditLogFilters {
    entityType?: AuditLogEntry['entityType'];
    entityId?: string;
    action?: AuditLogEntry['action'];
    performedBy?: string;
    limit?: number;
}

export function useAuditLog(filters?: AuditLogFilters) {
    const [entries, setEntries] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const storeState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    useEffect(() => {
        seedStore();
    }, []);

    useEffect(() => {
        setIsLoading(true);

        let result = [...getAuditLog()];

        if (filters?.entityType) {
            result = result.filter((e) => e.entityType === filters.entityType);
        }
        if (filters?.entityId) {
            result = result.filter((e) => e.entityId === filters.entityId);
        }
        if (filters?.action) {
            result = result.filter((e) => e.action === filters.action);
        }
        if (filters?.performedBy) {
            result = result.filter((e) => e.performedBy === filters.performedBy);
        }

        // Sort: newest first
        result.sort((a, b) =>
            new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
        );

        if (filters?.limit) {
            result = result.slice(0, filters.limit);
        }

        setEntries(result);
        setIsLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storeState._lastSyncedAt, JSON.stringify(filters)]);

    return {
        entries,
        isLoading,
        totalCount: entries.length,
    };
}
