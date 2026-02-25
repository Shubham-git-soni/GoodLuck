// ============================================================
// useReports — React hook for expense report operations
// ============================================================

'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import type { ExpenseReport, ReportFilters } from '../types';
import { subscribe, getSnapshot } from '../store';
import { seedStore } from '../seed';
import * as reportApi from '../api/report-api';

export function useReports(filters?: ReportFilters) {
    const [reports, setReports] = useState<ExpenseReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const storeState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    useEffect(() => {
        seedStore();
    }, []);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);

        reportApi.fetchReports(filters).then((data) => {
            if (!cancelled) {
                setReports(data);
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

    const create = useCallback(async (data: {
        salesmanId: string;
        salesmanName: string;
        reportTitle: string;
        notes: string;
        expenseIds: string[];
    }) => {
        setIsLoading(true);
        try {
            const result = await reportApi.createReport(data);
            setError(null);
            return result;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create report';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const approve = useCallback(async (id: string, comments: string, approvedBy?: string) => {
        try {
            const result = await reportApi.approveReport(id, comments, approvedBy);
            setError(null);
            return result;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to approve';
            setError(message);
            throw err;
        }
    }, []);

    const reject = useCallback(async (id: string, comments: string, rejectedBy?: string) => {
        try {
            const result = await reportApi.rejectReport(id, comments, rejectedBy);
            setError(null);
            return result;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to reject';
            setError(message);
            throw err;
        }
    }, []);

    const markAsPaid = useCallback(async (id: string, paidBy?: string) => {
        try {
            const result = await reportApi.markReportAsPaid(id, paidBy);
            setError(null);
            return result;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to mark as paid';
            setError(message);
            throw err;
        }
    }, []);

    const getById = useCallback(async (id: string) => {
        return reportApi.fetchReportById(id);
    }, []);

    const bulkApprove = useCallback(async (ids: string[], comments: string, approvedBy?: string) => {
        await reportApi.bulkApproveReports(ids, comments, approvedBy);
    }, []);

    const bulkReject = useCallback(async (ids: string[], comments: string, rejectedBy?: string) => {
        await reportApi.bulkRejectReports(ids, comments, rejectedBy);
    }, []);

    const bulkMarkAsPaid = useCallback(async (ids: string[], paidBy?: string) => {
        await reportApi.bulkMarkAsPaid(ids, paidBy);
    }, []);

    return {
        reports,
        isLoading,
        error,
        create,
        approve,
        reject,
        markAsPaid,
        getById,
        bulkApprove,
        bulkReject,
        bulkMarkAsPaid,
        pendingCount: reports.filter((r) => r.status === 'pending').length,
        approvedCount: reports.filter((r) => r.status === 'approved').length,
        totalPendingAmount: reports
            .filter((r) => r.status === 'pending')
            .reduce((sum, r) => sum + r.totalAmount, 0),
        totalViolations: reports.reduce((sum, r) => sum + r.policyViolations, 0),
    };
}
